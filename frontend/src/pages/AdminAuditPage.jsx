import { useEffect, useState } from 'react';
import { leaveApi } from '../api/leaveApi.js';
import { DateUtils } from '../utils/dateUtils.js';
import PageHeader from '../components/PageHeader.jsx';
import Alert from '../components/Alert.jsx';
import { Card } from '../components/Card.jsx';
import { Table, Thead, Th, EmptyRow } from '../components/Table.jsx';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    leaveApi
      .getAllAuditLogs()
      .then(setLogs)
      .catch((err) => {
        setError(err.message);
        setLogs([]);
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="System Audit Trail"
        subtitle="Chronological ledger of every leave creation, approval, rejection, send back, and admin direct edit."
      />

      {error && <Alert variant="danger" className="mb-4">Failed to load audit logs: {error}</Alert>}

      <Card>
        <Table>
          <Thead>
            <Th>Timestamp</Th>
            <Th>Actor</Th>
            <Th>Action</Th>
            <Th>Transition</Th>
            <Th>Flags</Th>
            <Th>Comment / Rationale</Th>
          </Thead>
          <tbody>
            {logs === null ? (
              <EmptyRow colSpan={6}>Loading audit logs...</EmptyRow>
            ) : logs.length === 0 ? (
              <EmptyRow colSpan={6}>No audit logs yet.</EmptyRow>
            ) : (
              logs.map((l, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 text-xs whitespace-nowrap text-slate-400 font-medium">{DateUtils.formatDateTime(l.timestamp)}</td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{l.actorName}</div>
                    <div className="text-xs text-slate-400 font-medium">{l.actorRole}</div>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-800 text-sm">{l.action}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-600">{l.previousStatus || 'INIT'} &rarr; <strong className="text-indigo-600 font-bold">{l.newStatus}</strong></td>
                  <td className="px-5 py-3.5">
                    {l.adminDirectEdit && <span className="mr-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 ring-1 ring-inset ring-rose-600/20">ADMIN_DIRECT_EDIT</span>}
                    {l.adminOverride && <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">OVERRIDE</span>}
                    {!l.adminDirectEdit && !l.adminOverride && <span className="text-slate-400">—</span>}
                  </td>
                  <td className="max-w-[260px] px-5 py-3.5 text-sm text-slate-600">{l.comment || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
