import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveApi } from '../api/leaveApi.js';
import { agentApi } from '../api/agentApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import BalanceCard from '../components/BalanceCard.jsx';
import LeaveRow from '../components/LeaveRow.jsx';
import { Card, CardHeader } from '../components/Card.jsx';
import { Table, Thead, Th, EmptyRow } from '../components/Table.jsx';
import Icon from '../components/Icon.jsx';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [balances, setBalances] = useState(null);
  const [leaves, setLeaves] = useState(null);
  const [nudge, setNudge] = useState(null);

  useEffect(() => {
    leaveApi.getBalances().then(setBalances).catch(() => setBalances([]));
    leaveApi.getMyLeaves().then(setLeaves).catch(() => setLeaves([]));
    agentApi
      .getVacationNudge()
      .then((n) => {
        if (n && n.trigger === 'NO_LEAVE_LAST_QUARTER') setNudge(n);
      })
      .catch(() => {});
  }, []);

  const recentLeaves = leaves ? leaves.slice(0, 5) : [];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your leave quotas, active requests, and wellbeing."
        actions={
          <Button onClick={() => navigate('/apply-leave')}>
            <Icon name="plus" className="h-4 w-4" />
            Apply for Leave
          </Button>
        }
      />

      {nudge && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-slate-800 border-l-4 border-l-blue-900 bg-white px-4 py-3.5 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-900">
            <Icon name="sun" className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900">{nudge.title}</div>
            <div className="mt-0.5 text-sm text-slate-600">{nudge.message}</div>
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => navigate('/wellness')}>
                Explore Partner Resorts & Discounts
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setNudge(null)}>
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h3 className="mb-3 text-lg font-semibold text-slate-800">My Leave Balances ({new Date().getFullYear()})</h3>
        {balances === null ? (
          <div className="text-slate-500">Loading balances...</div>
        ) : balances.length === 0 ? (
          <div className="text-slate-500">No leave balance records available.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {balances.map((b) => (
              <BalanceCard key={b.leaveType} balance={b} />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <span>Recent Leave Requests</span>
          <Button variant="outline" size="sm" onClick={() => navigate('/my-leaves')}>
            View All History &rarr;
          </Button>
        </CardHeader>
        <Table>
          <Thead>
            <Th>Leave Type</Th>
            <Th>Dates & Duration</Th>
            <Th>Status</Th>
            <Th>Reason</Th>
            <Th className="text-right">Action</Th>
          </Thead>
          <tbody>
            {leaves === null ? (
              <EmptyRow colSpan={5}>Loading requests...</EmptyRow>
            ) : recentLeaves.length === 0 ? (
              <EmptyRow colSpan={5}>No leave requests yet. Click "Apply for Leave" above to get started.</EmptyRow>
            ) : (
              recentLeaves.map((l) => (
                <LeaveRow
                  key={l.id}
                  leave={l}
                  actions={
                    <Button variant="outline" size="sm" onClick={() => navigate('/my-leaves', { state: { selectedId: l.id } })}>
                      Details
                    </Button>
                  }
                />
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
