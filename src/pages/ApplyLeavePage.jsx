import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveApi } from '../api/leaveApi.js';
import { agentApi } from '../api/agentApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DateUtils } from '../utils/dateUtils.js';
import { ValidationUtils } from '../utils/validationUtils.js';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import { Card, CardHeader, CardBody } from '../components/Card.jsx';
import Icon from '../components/Icon.jsx';

const PRESETS = [
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'next-mon', label: 'Next Monday' },
  { key: '3days', label: 'Next 3 Days' },
  { key: 'next-week', label: 'Next Week (5 Days)' },
];

function nextMondayDiff(today) {
  const day = today.getDay();
  return (8 - day) % 7 || 7;
}

export default function ApplyLeavePage() {
  const navigate = useNavigate();
  const { isContractor, currentUser } = useAuth();

  const [leaveType, setLeaveType] = useState('');
  const [combinedWithType, setCombinedWithType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [session, setSession] = useState('FIRST_HALF');
  const [reason, setReason] = useState('');
  const [docAttached, setDocAttached] = useState(false);
  const [docUrl, setDocUrl] = useState('https://documents.peoplefirst.internal/medical-cert.pdf');
  const [errors, setErrors] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const todayStr = DateUtils.getTodayStr();
  const totalDays = DateUtils.calculateDays(startDate, endDate, isHalfDay);

  const minStartDate = useMemo(() => {
    if (leaveType === 'PAID') return DateUtils.formatDateISO(DateUtils.addDays(new Date(), 3));
    return todayStr;
  }, [leaveType, todayStr]);

  const notice = useMemo(() => {
    if (leaveType === 'PAID') {
      return { text: `Paid Leave requires advance notice of more than 2 days (earliest start: ${DateUtils.formatDate(minStartDate)}).`, color: 'text-amber-600' };
    }
    if (leaveType === 'VOLUNTEERING') {
      return { text: 'Volunteering triggers corporate CSR chapter enrollment recommendations!', color: 'text-emerald-600' };
    }
    return null;
  }, [leaveType, minStartDate]);

  const showCombination = leaveType === 'CASUAL' && !isContractor;
  const showDocGroup = leaveType === 'SICK' && totalDays > 2;

  function applyPreset(key) {
    const today = new Date();
    let start;
    let end;

    if (key === 'tomorrow') {
      start = DateUtils.addDays(today, 1);
      end = start;
    } else if (key === 'next-mon') {
      start = DateUtils.addDays(today, nextMondayDiff(today));
      end = start;
    } else if (key === '3days') {
      start = DateUtils.addDays(today, leaveType === 'PAID' ? 3 : 1);
      end = DateUtils.addDays(start, 2);
    } else if (key === 'next-week') {
      start = DateUtils.addDays(today, nextMondayDiff(today));
      end = DateUtils.addDays(start, 4);
    }

    setStartDate(DateUtils.formatDateISO(start));
    setEndDate(DateUtils.formatDateISO(end));
  }

  function handleLeaveTypeChange(value) {
    setLeaveType(value);
    if (value !== 'CASUAL') setCombinedWithType('');
  }

  function handleStartDateChange(value) {
    setStartDate(value);
    if (value && (!endDate || DateUtils.parseLocalDate(endDate) < DateUtils.parseLocalDate(value))) {
      setEndDate(value);
    }
  }

  function handleHalfDayChange(checked) {
    setIsHalfDay(checked);
    if (checked && startDate && !endDate) setEndDate(startDate);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError('');
    setErrors([]);

    const validation = ValidationUtils.validateLeaveForm({
      leaveType,
      combinedWithType: combinedWithType || null,
      startDate,
      endDate,
      totalDays,
      documentAttached: docAttached,
      isContractor,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        leaveType,
        combinedWithType: combinedWithType || null,
        startDate,
        endDate,
        isHalfDay,
        halfDaySession: isHalfDay ? session : null,
        reason,
        documentAttached: docAttached,
        documentUrl: docAttached ? docUrl : null,
      };

      const response = await leaveApi.applyLeave(payload);

      let wellbeingSuggestions = [];
      try {
        const chatCheck = await agentApi.chat(`Applied for ${leaveType} leave from ${startDate} to ${endDate}`);
        wellbeingSuggestions = chatCheck?.wellbeingSuggestions || [];
      } catch {
        // non-blocking
      }

      setResult({ ...response, wellbeingSuggestions });
    } catch (err) {
      setSubmitError(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Apply for Leave"
        subtitle="Submit a leave request. Backend policies will validate combinations, deadlines, and documentation."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>Leave Application Form</CardHeader>
          <CardBody>
            {errors.length > 0 && (
              <Alert variant="danger" className="mb-4 block">
                <strong>Application Notice:</strong>
                <ul className="mt-1 ml-5 list-disc">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </Alert>
            )}
            {submitError && (
              <Alert variant="danger" className="mb-4 block">
                <strong>Submission Rejected by Policy Engine:</strong>
                <div className="mt-1">{submitError}</div>
                {submitError.toLowerCase().includes('ticket') && (
                  <Button size="sm" variant="secondary" className="mt-2" onClick={() => navigate('/tickets')}>
                    Raise a Support Ticket &rarr;
                  </Button>
                )}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Leave Type *</label>
                <select
                  required
                  value={leaveType}
                  onChange={(e) => handleLeaveTypeChange(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Leave Type --</option>
                  {!isContractor && <option value="CASUAL">Casual Leave (12 days/yr)</option>}
                  <option value="SICK">Sick Leave (16 days/yr)</option>
                  <option value="PAID">Paid Leave ({isContractor ? '24' : '20'} days/yr)</option>
                  <option value="LOP">Loss of Pay (LOP) ({isContractor ? '30' : '180'} days/yr)</option>
                  {!isContractor && <option value="WFH">Work From Home (WFH) (24 days/yr)</option>}
                  {!isContractor && currentUser?.gender === 'MALE' && (
                    <option value="PATERNITY">Paternity Leave (15 days/yr)</option>
                  )}
                  {!isContractor && currentUser?.gender === 'FEMALE' && (
                    <option value="MATERNITY">Maternity Leave (182 days/yr)</option>
                  )}
                  {!isContractor && !currentUser?.gender && (
                    <>
                      <option value="MATERNITY">Maternity Leave (182 days/yr)</option>
                      <option value="PATERNITY">Paternity Leave (15 days/yr)</option>
                    </>
                  )}
                  {!isContractor && <option value="VOLUNTEERING">Volunteering Leave (2 days/yr)</option>}
                </select>
                {notice && (
                  <div className={`mt-1 flex items-start gap-1 text-xs ${notice.color}`}>
                    <Icon name={leaveType === 'PAID' ? 'bell' : 'leaf'} className="mt-px h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                    {notice.text}
                  </div>
                )}
              </div>

              {showCombination && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Combine with Another Leave Type</label>
                  <select
                    value={combinedWithType}
                    onChange={(e) => setCombinedWithType(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">-- None (Single Leave Type) --</option>
                    <option value="WFH">Work From Home (WFH)</option>
                  </select>
                  <div className="mt-1 text-xs text-slate-500">Policy Rule: Casual Leave may only be combined with WFH.</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Start Date *</label>
                  <input
                    type="date"
                    required
                    min={minStartDate}
                    value={startDate}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">End Date *</label>
                  <input
                    type="date"
                    required
                    min={startDate || todayStr}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2">
                <span className="text-xs font-semibold text-slate-500">Quick Pick:</span>
                {PRESETS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => applyPreset(p.key)}
                    className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-300"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-3">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={isHalfDay} onChange={(e) => handleHalfDayChange(e.target.checked)} className="h-4 w-4" />
                  Half-Day Leave
                </label>
                {isHalfDay && (
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                  >
                    <option value="FIRST_HALF">First Half</option>
                    <option value="SECOND_HALF">Second Half</option>
                  </select>
                )}
                <div className="text-sm font-semibold text-indigo-600">Total Days: {totalDays}</div>
              </div>

              {showDocGroup && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <label className="font-semibold text-amber-800">Medical Document Required *</label>
                  <p className="mt-1 mb-2 text-xs text-amber-700">
                    Sick leave exceeding 2 days requires a valid medical certificate or prescription.
                  </p>
                  <label className="flex items-center gap-2 text-xs text-amber-900">
                    <input type="checkbox" checked={docAttached} onChange={(e) => setDocAttached(e.target.checked)} className="h-4 w-4" />
                    I have attached a verified medical certificate
                  </label>
                  <input
                    type="text"
                    value={docUrl}
                    onChange={(e) => setDocUrl(e.target.value)}
                    placeholder="Medical Certificate File URL / Ref"
                    className="mt-2 w-full rounded-lg border border-amber-300 px-3 py-1.5 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Reason for Leave</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Briefly state the reason for your leave..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>Leave Policy Checklist</CardHeader>
          <CardBody className="space-y-2 text-sm leading-relaxed text-slate-600">
            <p>• <strong>Notice:</strong> Apply before the leave start date.</p>
            <p>• <strong>Paid Leave:</strong> Requires &gt; 2 days notice (start date must be 3+ days out).</p>
            <p>• <strong>Sick Leave &gt; 2 days:</strong> Medical documentation is mandatory.</p>
            <p>• <strong>Casual Leave:</strong> Can only be combined with WFH.</p>
            <p>• <strong>Weekly Cutoff:</strong> Casual/WFH requests must be submitted by end of the current week.</p>
            <p>• <strong>Monthly Cutoff:</strong> Sick/Paid/LOP submitted on or before the 25th.</p>
            <p className="mt-2 text-indigo-600">
              Late requests or retroactive corrections must be raised via a <strong>Support Ticket</strong>.
            </p>
          </CardBody>
        </Card>
      </div>

      {result && (
        <Modal
          title="Leave Request Submitted"
          onClose={() => setResult(null)}
          footer={
            <Button
              onClick={() => {
                setResult(null);
                navigate('/my-leaves');
              }}
            >
              View My Leaves
            </Button>
          }
        >
          <div className="mb-3 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Icon name="checkCircle" className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <p className="mt-2 font-semibold text-slate-800">Your leave application is now {result.status}.</p>
          </div>
          <div className="space-y-1 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
            <div>
              • <strong>Type:</strong> {result.leaveTypeDisplayName} {result.combinedWithType ? `(+ ${result.combinedWithType})` : ''}
            </div>
            <div>
              • <strong>Dates:</strong> {DateUtils.formatDate(result.startDate)} to {DateUtils.formatDate(result.endDate)} ({result.totalDays} days)
            </div>
            <div>
              • <strong>Reason:</strong> {result.reason || '—'}
            </div>
          </div>

          {result.wellbeingSuggestions?.length > 0 && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <div className="mb-2 flex items-center gap-1.5 font-semibold text-indigo-600">
                <Icon name="sparkles" className="h-4 w-4" strokeWidth={2} /> Kura Wellbeing Recommendations
              </div>
              {result.wellbeingSuggestions.map((s, i) => (
                <div key={i} className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-sm">
                  <div className="font-semibold text-emerald-800">{s.title}</div>
                  <div className="mt-0.5 text-slate-700">{s.message}</div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
