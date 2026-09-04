import { useEffect, useState } from 'react';
import { leaveApi } from '../api/leaveApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DateUtils } from '../utils/dateUtils.js';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import { Card, CardHeader } from '../components/Card.jsx';
import { Table, Thead, Th, EmptyRow } from '../components/Table.jsx';
import Icon from '../components/Icon.jsx';

export default function ApprovalsPage() {
  const { currentUser } = useAuth();
  const [pending, setPending] = useState(null);
  const [error, setError] = useState('');

  const [approveTarget, setApproveTarget] = useState(null);
  const [approveComment, setApproveComment] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectComment, setRejectComment] = useState('');
  const [sendBackTarget, setSendBackTarget] = useState(null);
  const [sendBackComment, setSendBackComment] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadData() {
    setError('');
    try {
      const data = await leaveApi.getPendingApprovals();
      setPending(data);
    } catch (err) {
      setError(err.message);
      setPending([]);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function confirmApprove() {
    setBusy(true);
    try {
      await leaveApi.approveLeave(approveTarget.id, approveComment);
      setApproveTarget(null);
      setApproveComment('');
      await loadData();
    } catch (err) {
      alert('Error approving leave: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmReject() {
    if (!rejectComment.trim()) {
      setFormError('Please enter a rejection reason.');
      return;
    }
    setBusy(true);
    try {
      await leaveApi.rejectLeave(rejectTarget.id, rejectComment);
      setRejectTarget(null);
      setRejectComment('');
      setFormError('');
      await loadData();
    } catch (err) {
      alert('Error rejecting leave: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmSendBack() {
    if (!sendBackComment.trim()) {
      setFormError('Please enter feedback.');
      return;
    }
    setBusy(true);
    try {
      await leaveApi.sendBackLeave(sendBackTarget.id, sendBackComment);
      setSendBackTarget(null);
      setSendBackComment('');
      setFormError('');
      await loadData();
    } catch (err) {
      alert('Error sending back leave: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Team Leave Approvals"
        subtitle="Review pending leave applications from your team reportees. Approve, reject, or send back for updates."
      />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Card>
        <CardHeader>
          <span>Pending Leave Requests</span>
          <Button variant="outline" size="sm" onClick={loadData}>↻ Refresh</Button>
        </CardHeader>
        <Table>
          <Thead>
            <Th>Employee</Th>
            <Th>Leave Type</Th>
            <Th>Dates & Duration</Th>
            <Th>Reason</Th>
            <Th className="text-right">Decision</Th>
          </Thead>
          <tbody>
            {pending === null ? (
              <EmptyRow colSpan={5}>Loading pending requests...</EmptyRow>
            ) : pending.length === 0 ? (
              <EmptyRow colSpan={5}>No pending approval requests at this time. All caught up!</EmptyRow>
            ) : (
              pending.map((l) => {
                const isOwn = currentUser.id === l.userId;
                return (
                  <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{l.employeeName || 'Team Member'}</div>
                      <div className="text-xs text-slate-500">{l.employeeRole || ''} • {l.department || ''}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{l.leaveTypeDisplayName}</div>
                      {l.combinedWithType && <div className="text-xs text-indigo-600">+ Combined with {l.combinedWithType}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <div>{DateUtils.formatDate(l.startDate)} &rarr; {DateUtils.formatDate(l.endDate)}</div>
                      <div className="text-xs text-slate-500">{l.totalDays} day{l.totalDays > 1 ? 's' : ''}</div>
                    </td>
                    <td className="max-w-[200px] px-4 py-3">
                      {l.reason || '—'}
                      {l.documentAttached && (
                        <div className="mt-0.5 text-xs">
                          <a href={l.documentUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-indigo-600 hover:underline">
                            <Icon name="document" className="h-3.5 w-3.5" strokeWidth={2} /> View Medical Doc
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isOwn ? (
                        <span className="text-xs text-slate-500">Self-Approval Blocked</span>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="success" size="sm" onClick={() => setApproveTarget(l)}>Approve</Button>
                          <Button variant="secondary" size="sm" onClick={() => { setFormError(''); setSendBackTarget(l); }}>Send Back</Button>
                          <Button variant="danger" size="sm" onClick={() => { setFormError(''); setRejectTarget(l); }}>Reject</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </Card>

      {approveTarget && (
        <Modal
          title={`Approve Leave: ${approveTarget.employeeName}`}
          onClose={() => setApproveTarget(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setApproveTarget(null)}>Cancel</Button>
              <Button variant="success" disabled={busy} onClick={confirmApprove}>Confirm Approval</Button>
            </>
          }
        >
          <p className="mb-3 text-sm">
            Approve <strong>{approveTarget.leaveTypeDisplayName}</strong> ({approveTarget.totalDays} days) for <strong>{approveTarget.employeeName}</strong>?
          </p>
          <label className="mb-1 block text-sm font-medium text-slate-700">Approval Note / Comment (Optional)</label>
          <input
            type="text"
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
            placeholder="e.g. Approved, coverage confirmed."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Modal>
      )}

      {rejectTarget && (
        <Modal
          title={`Reject Leave: ${rejectTarget.employeeName}`}
          onClose={() => setRejectTarget(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setRejectTarget(null)}>Cancel</Button>
              <Button variant="danger" disabled={busy} onClick={confirmReject}>Confirm Rejection</Button>
            </>
          }
        >
          {formError && <Alert variant="danger" className="mb-3">{formError}</Alert>}
          <p className="mb-3 text-sm">
            Are you sure you want to reject <strong>{rejectTarget.leaveTypeDisplayName}</strong> for <strong>{rejectTarget.employeeName}</strong>?
          </p>
          <label className="mb-1 block text-sm font-medium text-slate-700">Reason for Rejection *</label>
          <input
            type="text"
            required
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            placeholder="e.g. Critical release sprint deadline"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Modal>
      )}

      {sendBackTarget && (
        <Modal
          title={`Send Back Leave: ${sendBackTarget.employeeName}`}
          onClose={() => setSendBackTarget(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setSendBackTarget(null)}>Cancel</Button>
              <Button disabled={busy} onClick={confirmSendBack}>Send Back to Employee</Button>
            </>
          }
        >
          {formError && <Alert variant="danger" className="mb-3">{formError}</Alert>}
          <p className="mb-3 text-sm">
            Return this application to <strong>{sendBackTarget.employeeName}</strong> for updates or date adjustments. Status will transition to <strong>RETURNED</strong>.
          </p>
          <label className="mb-1 block text-sm font-medium text-slate-700">Feedback / Requested Changes *</label>
          <input
            type="text"
            required
            value={sendBackComment}
            onChange={(e) => setSendBackComment(e.target.value)}
            placeholder="e.g. Please shift by one day due to team handover"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </Modal>
      )}
    </div>
  );
}
