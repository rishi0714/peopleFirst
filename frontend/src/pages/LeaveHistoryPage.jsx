import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { leaveApi } from '../api/leaveApi.js';
import { DateUtils } from '../utils/dateUtils.js';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import LeaveRow from '../components/LeaveRow.jsx';
import { Card } from '../components/Card.jsx';
import { Table, Thead, Th, EmptyRow } from '../components/Table.jsx';

const STATUS_OPTIONS = ['ALL', 'PENDING', 'APPROVED', 'RETURNED', 'REJECTED', 'CANCELLED'];

export default function LeaveHistoryPage() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [leaves, setLeaves] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  const [detailsLeave, setDetailsLeave] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [cancelLeave, setCancelLeave] = useState(null);
  const [cancelComment, setCancelComment] = useState('');
  const [editLeave, setEditLeave] = useState(null);
  const [editForm, setEditForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [editError, setEditError] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadLeaves() {
    try {
      const data = await leaveApi.getMyLeaves();
      setLeaves(data);
    } catch (err) {
      setError(err.message);
      setLeaves([]);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  useEffect(() => {
    const selectedId = location.state?.selectedId;
    if (selectedId && leaves) {
      const target = leaves.find((l) => l.id === selectedId);
      if (target) openDetails(target);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaves]);

  async function openDetails(leave) {
    setDetailsLeave(leave);
    setAuditLogs([]);
    try {
      const logs = await leaveApi.getAuditLogsForLeave(leave.id);
      setAuditLogs(logs);
    } catch {
      setAuditLogs([]);
    }
  }

  function openEdit(leave) {
    setEditLeave(leave);
    setEditError('');
    setEditForm({ startDate: leave.startDate, endDate: leave.endDate, reason: leave.reason || '' });
  }

  async function confirmCancel() {
    setBusy(true);
    try {
      await leaveApi.cancelLeave(cancelLeave.id, cancelComment);
      setCancelLeave(null);
      setCancelComment('');
      await loadLeaves();
    } catch (err) {
      alert('Failed to cancel leave: ' + err.message);
    } finally {
      setBusy(false);
    }
  }

  async function saveEdit() {
    setBusy(true);
    setEditError('');
    try {
      await leaveApi.editLeave(editLeave.id, {
        leaveType: editLeave.leaveType,
        combinedWithType: editLeave.combinedWithType,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        halfDay: editLeave.halfDay,
        halfDaySession: editLeave.halfDaySession,
        reason: editForm.reason,
        documentAttached: editLeave.documentAttached,
        documentUrl: editLeave.documentUrl,
      });
      setEditLeave(null);
      await loadLeaves();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filtered = leaves ? (filter === 'ALL' ? leaves : leaves.filter((l) => l.status === filter)) : [];

  return (
    <div>
      <PageHeader
        title="My Leave History"
        subtitle="Review, edit returned leaves, cancel upcoming leaves, or view transition audit logs."
        actions={
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:border-indigo-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        }
      />

      {error && <Alert variant="danger" className="mb-4">Failed to load leaves: {error}</Alert>}

      <Card>
        <Table>
          <Thead>
            <Th>Leave Type</Th>
            <Th>Dates & Duration</Th>
            <Th>Status</Th>
            <Th>Reason</Th>
            <Th className="text-right">Actions</Th>
          </Thead>
          <tbody>
            {leaves === null ? (
              <EmptyRow colSpan={5}>Loading leave history...</EmptyRow>
            ) : filtered.length === 0 ? (
              <EmptyRow colSpan={5}>No leave records found matching criteria.</EmptyRow>
            ) : (
              filtered.map((l) => {
                const isBeforeStart = new Date(l.startDate) > today;
                const canCancel = (l.status === 'PENDING' || l.status === 'APPROVED') && isBeforeStart;
                const canEdit = (l.status === 'PENDING' || l.status === 'RETURNED') && isBeforeStart;

                return (
                  <LeaveRow
                    key={l.id}
                    leave={l}
                    actions={
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openDetails(l)}>
                          Audit Trail
                        </Button>
                        {canEdit && (
                          <Button variant="secondary" size="sm" onClick={() => openEdit(l)}>
                            Edit
                          </Button>
                        )}
                        {canCancel && (
                          <Button variant="danger" size="sm" onClick={() => setCancelLeave(l)}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    }
                  />
                );
              })
            )}
          </tbody>
        </Table>
      </Card>

      {detailsLeave && (
        <Modal
          title={`Leave Details: ${detailsLeave.leaveTypeDisplayName}`}
          onClose={() => setDetailsLeave(null)}
          maxWidth="max-w-xl"
          footer={<Button variant="secondary" onClick={() => setDetailsLeave(null)}>Close</Button>}
        >
          <div className="space-y-2 text-sm leading-relaxed">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Status:</span> <StatusBadge status={detailsLeave.status} />
            </div>
            <div>
              <strong className="text-slate-700">Dates:</strong> {DateUtils.formatDate(detailsLeave.startDate)} &rarr; {DateUtils.formatDate(detailsLeave.endDate)} ({detailsLeave.totalDays} day{detailsLeave.totalDays > 1 ? 's' : ''})
            </div>
            {detailsLeave.combinedWithType && (
              <div>
                <strong className="text-slate-700">Combined with:</strong> {detailsLeave.combinedWithType}
              </div>
            )}
            <div>
              <strong className="text-slate-700">Applied On:</strong> {DateUtils.formatDate(detailsLeave.appliedDate)}
            </div>
            <div>
              <strong className="text-slate-700">Reason:</strong> {detailsLeave.reason || '—'}
            </div>
            {detailsLeave.documentAttached && (
              <div>
                <strong className="text-slate-700">Medical Document:</strong>{' '}
                <a href={detailsLeave.documentUrl} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline">
                  View Certificate &rarr;
                </a>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <h4 className="mb-2.5 text-sm font-bold text-slate-800">Audit &amp; Transition Trail</h4>
              {auditLogs.length === 0 ? (
                <div className="text-xs text-slate-400">No audit logs recorded.</div>
              ) : (
                <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                  {auditLogs.map((log, i) => (
                    <div key={i} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs shadow-2xs">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{log.action} by {log.actorName} ({log.actorRole})</span>
                        <span className="font-normal text-slate-400">{DateUtils.formatDateTime(log.timestamp)}</span>
                      </div>
                      <div className="mt-1 text-slate-600">
                        Status: <strong>{log.previousStatus || '—'}</strong> &rarr; <strong className="text-indigo-600">{log.newStatus}</strong>
                        {log.adminDirectEdit && (
                          <span className="ml-1.5 rounded-md bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">ADMIN_DIRECT_EDIT</span>
                        )}
                      </div>
                      {log.comment && <div className="mt-1 text-slate-500 italic">"{log.comment}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal>
      )}

      {cancelLeave && (
        <Modal
          title="Confirm Leave Cancellation"
          onClose={() => setCancelLeave(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setCancelLeave(null)}>Never mind</Button>
              <Button variant="danger" disabled={busy} onClick={confirmCancel}>Yes, Cancel Leave</Button>
            </>
          }
        >
          <p className="mb-3 text-sm text-slate-700 leading-relaxed">
            Are you sure you want to cancel your <strong>{cancelLeave.leaveTypeDisplayName}</strong> from{' '}
            <strong>{DateUtils.formatDate(cancelLeave.startDate)}</strong> to <strong>{DateUtils.formatDate(cancelLeave.endDate)}</strong>?
          </p>
          <div className="mb-3 rounded-xl bg-indigo-50/70 p-3 text-xs text-indigo-800">
            Cancelling will instantly restore <strong>{cancelLeave.totalDays} days</strong> back to your available leave balance.
          </div>
          <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase">Cancellation Reason (Optional)</label>
          <input
            type="text"
            value={cancelComment}
            onChange={(e) => setCancelComment(e.target.value)}
            placeholder="e.g. Schedule conflict"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </Modal>
      )}

      {editLeave && (
        <Modal
          title={`Edit Leave Request (${editLeave.leaveTypeDisplayName})`}
          onClose={() => setEditLeave(null)}
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditLeave(null)}>Cancel</Button>
              <Button disabled={busy} onClick={saveEdit}>Save &amp; Resubmit</Button>
            </>
          }
        >
          {editError && <Alert variant="danger" className="mb-3">{editError}</Alert>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase">Start Date *</label>
              <input
                type="date"
                required
                value={editForm.startDate}
                onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase">End Date *</label>
              <input
                type="date"
                required
                value={editForm.endDate}
                onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
              />
            </div>
          </div>
          <div className="mt-3.5">
            <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase">Reason for Modification</label>
            <textarea
              rows={2}
              value={editForm.reason}
              onChange={(e) => setEditForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
            />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Editing will resubmit the request into <strong>PENDING</strong> status for managerial re-approval.
          </p>
        </Modal>
      )}
    </div>
  );
}
