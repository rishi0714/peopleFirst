import { useEffect, useState } from 'react';
import { leaveApi } from '../api/leaveApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Alert from '../components/Alert.jsx';
import { Card } from '../components/Card.jsx';
import { Table, Thead, Th, EmptyRow } from '../components/Table.jsx';

export default function TeamBalancesPage() {
  const { isAdmin } = useAuth();
  const [balances, setBalances] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const scope = isAdmin ? 'all' : 'reportees';
    leaveApi
      .getBalances(scope)
      .then(setBalances)
      .catch((err) => {
        setError(err.message);
        setBalances([]);
      });
  }, [isAdmin]);

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'Organization-Wide Leave Balances' : 'Direct Reportee Leave Balances'}
        subtitle={
          isAdmin
            ? 'Aggregated view of all employee leave quotas and consumption org-wide.'
            : 'View remaining leave quotas for your direct reporting team.'
        }
      />

      {error && <Alert variant="danger" className="mb-4">Failed to load balances: {error}</Alert>}

      <Card>
        <Table>
          <Thead>
            <Th>Team Member</Th>
            <Th>Leave Type</Th>
            <Th>Allocated</Th>
            <Th>Used</Th>
            <Th>Pending</Th>
            <Th>Remaining</Th>
          </Thead>
          <tbody>
            {balances === null ? (
              <EmptyRow colSpan={6}>Loading balances...</EmptyRow>
            ) : balances.length === 0 ? (
              <EmptyRow colSpan={6}>No balance records found for team.</EmptyRow>
            ) : (
              balances.map((b, i) => (
                <tr key={i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-800">{b.employeeName || 'Employee'}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{b.leaveTypeDisplayName}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{b.allocatedDays}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-rose-600">{b.usedDays}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-amber-600">{b.pendingDays}</td>
                  <td className="px-5 py-3.5 text-base font-extrabold text-indigo-600">{b.remainingDays}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
