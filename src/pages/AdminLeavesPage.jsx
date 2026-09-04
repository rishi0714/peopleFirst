import { useEffect, useState } from 'react';
import { leaveApi } from '../api/leaveApi.js';
import { DateUtils } from '../utils/dateUtils.js';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { Card, CardHeader } from '../components/Card.jsx';
import { Table, Thead, Th, EmptyRow } from '../components/Table.jsx';
import Icon from '../components/Icon.jsx';

const STATUS_OPTIONS = ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'CANCELLED'];

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState(null);
  const [error, setError] = useState('');

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editErr, setEditErr] = useState('');
  const [busy, setBusy] = useState(false);

  const [auditTarget, setAuditTarget] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  async function loadData() {
    setError('');
    try {
      const data = await leaveApi.getAllLeavesOrgWide();
      setLeaves(data);
    } catch (err) {
      setError(err.message);
      setLeaves([]);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openEdit(leave) {
    setEditTarget(leave);
    setEditErr('');
    setEditForm({
      status: leave.status,
      totalDays: leave.totalDays,
      startDate: leave.startDate,
      endDate: leave.endDate,
      reason: leave.reason || '',
      auditComment: '',
    });
  }

  async function submitDirectEdit() {
    if (!editForm.auditComment.trim()) {
      setEditErr('Mandatory audit comment is required for direct DB edits.');
      return;
    }
    setBusy(true);
    try {
      await leaveApi.adminDirectEdit(editTarget.id, {
        status: editForm.status,
        totalDays: parseFloat(editForm.totalDays),
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        reason: editForm.reason,
        auditComment: editForm.auditComment,
      });
      setEditTarget(null);
      await loadData();
    } catch (err) {
      setEditErr(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function openAuditLogs(leaveId) {
    try {
      const logs = await leaveApi.getAuditLogsForLeave(leaveId);
      setAuditLogs(logs);
      setAuditTarget(leaveId);
    } catch (err) {
      alert('Failed to load audit logs: ' + err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Org Leaves & Direct-DB-Edit Utility"
        subtitle="Privileged administrative screen to view all leaves across the organization and perform audited direct-DB corrections."
        actions={<Button variant="outline" size="sm" onClick={loadData}>↻ Refresh</Button>}
      />

      {error && <Alert variant="danger" className="mb-4">Failed to load leaves: {error}</Alert>}

      <Card>
        <CardHeader>
          <span>All Organization Leave Records</span>
          <span className="text-xs font-normal text-slate-500">Direct edit actions are logged with ADMIN_DIRECT_EDIT</span>
        </CardHeader>
        <Table>
          <Thead>
            <Th>Employee / Dept</Th>
            <Th>Leave Type</Th>
            <Th>Dates & Duration</Th>
            <Th>Status</Th>
            <Th>Reason</Th>
            <Th className="text-right">Privileged Action</Th>
          </Thead>
          <tbody>
            {leaves === null ? (
              <EmptyRow colSpan={6}>Loading org leaves...</EmptyRow>
            ) : leaves.length === 0 ? (
              <EmptyRow colSpan={6}>No leave records in the system.</EmptyRow>
            ) : (
              leaves.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{l.employeeName}</div>
                    <div className="text-xs text-slate-500">{l.department} • {l.employeeRole}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{l.leaveTypeDisplayName}</div>
                    {l.combinedWithType && <div className="text-xs text-indigo-600">+ {l.combinedWithType}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <div>{DateUtils.formatDate(l.startDate)} &rarr; {DateUtils.formatDate(l.endDate)}</div>
                    <div className="text-xs text-slate-500">{l.totalDays} days</div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="max-w-[180px] truncate px-4 py-3">{l.reason || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openAuditLogs(l.id)}>Audit Logs</Button>
                      <Button size="sm" onClick={() => openEdit(l)}>
                        <Icon name="wrench" className="h-3.5 w-3.5" strokeWidth={2} /> Direct Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {editTarget && editForm && (
        <Modal
          title={`Privileged Direct DB Edit: ${editTarget.employeeName}`}
          onClose={() => setEditTarget(null)}
          maxWidth="max-w-xl"
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button variant="danger" disabled={busy} onClick={submitDirectEdit}>Execute Direct Edit</Button>
            </>
          }
        >
          <Alert variant="warning" className="mb-4 block">
            <strong>Audited Administration:</strong> Modifying records through Direct Edit immediately updates the database and balances. Every direct edit is recorded with the <code>ADMIN_DIRECT_EDIT</code> audit tag.
          </Alert>

          {editErr && <Alert variant="danger" className="mb-3">{editErr}</Alert>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Status Override *</label>
              <select
                value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Total Days</label>
              <input
                type="number"
                step="0.5"
                value={editForm.totalDays}
                onChange={(e) => setEditForm((f) => ({ ...f, totalDays: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Start Date</label>
              <input
                type="date"
                value={editForm.startDate}
                onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">End Date</label>
              <input
                type="date"
                value={editForm.endDate}
                onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Updated Reason</label>
            <input
              type="text"
              value={editForm.reason}
              onChange={(e) => setEditForm((f) => ({ ...f, reason: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="mt-3">
            <label className="mb-1 block text-sm font-semibold text-rose-800">Mandatory Audit Justification / Comment *</label>
            <textarea
              rows={2}
              required
              value={editForm.auditComment}
              onChange={(e) => setEditForm((f) => ({ ...f, auditComment: e.target.value }))}
              placeholder="State reason for privileged administrative modification (e.g. Executive override approved by VP)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </Modal>
      )}

      {auditTarget && (
        <Modal
          title="Leave Audit & Transition Trail"
          onClose={() => setAuditTarget(null)}
          maxWidth="max-w-xl"
          footer={<Button variant="secondary" onClick={() => setAuditTarget(null)}>Close</Button>}
        >
          <div className="max-h-[400px] space-y-3 overflow-y-auto">
            {auditLogs.map((log, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-sm">
                <div className="flex justify-between font-semibold">
                  <span>Action: <strong>{log.action}</strong></span>
                  <span className="text-xs text-slate-500">{DateUtils.formatDateTime(log.timestamp)}</span>
                </div>
                <div className="mt-1 text-slate-600">Actor: <strong>{log.actorName}</strong> ({log.actorRole})</div>
                <div className="mt-1">
                  Transition: <strong>{log.previousStatus || 'INIT'}</strong> &rarr; <strong>{log.newStatus}</strong>
                  {log.adminDirectEdit && <span className="ml-1.5 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-800">ADMIN_DIRECT_EDIT</span>}
                  {log.adminOverride && <span className="ml-1.5 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800">ADMIN_OVERRIDE</span>}
                </div>
                {log.comment && (
                  <div className="mt-1.5 rounded border border-slate-200 bg-white px-2 py-1 text-slate-700 italic">"{log.comment}"</div>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
