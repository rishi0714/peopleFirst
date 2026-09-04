import { useEffect, useState } from 'react';
import { leaveApi } from '../api/leaveApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DateUtils } from '../utils/dateUtils.js';
import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Alert from '../components/Alert.jsx';
import { Card, CardHeader } from '../components/Card.jsx';
import { Table, Thead, Th, EmptyRow } from '../components/Table.jsx';
import Icon from '../components/Icon.jsx';

export default function OnLeavePage() {
  const { currentUser, isAdmin, isManager } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => DateUtils.getTodayStr());
  const [selectedDept, setSelectedDept] = useState('');
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const todayStr = DateUtils.getTodayStr();
  const tomorrowStr = DateUtils.formatDateISO(DateUtils.addDays(new Date(), 1));

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const deptParam = isAdmin ? selectedDept : currentUser?.department;
      const data = await leaveApi.getEmployeesOnLeave(selectedDate, deptParam);
      setList(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load employees on leave.');
      setList([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedDept]);

  return (
    <div>
      <PageHeader
        title="👥 Who's on Leave"
        subtitle={
          isAdmin
            ? 'Organization-wide leave visibility across all departments and office locations.'
            : `Department-level leave oversight for ${currentUser?.department || 'your'} department.`
        }
      />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-end gap-1.5 pt-5">
              <Button
                variant={selectedDate === todayStr ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedDate(todayStr)}
              >
                Today
              </Button>
              <Button
                variant={selectedDate === tomorrowStr ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedDate(tomorrowStr)}
              >
                Tomorrow
              </Button>
            </div>

            {isAdmin ? (
              <div className="ml-2">
                <label className="mb-1 block text-xs font-medium text-slate-700">Department Filter</label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Executive">Executive</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>
            ) : (
              <div className="ml-2 pt-5">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
                  <Icon name="users" className="h-3.5 w-3.5" />
                  Scoped to: {currentUser?.department || 'Department'}
                </span>
              </div>
            )}
          </div>

          <div className="pt-5">
            <Button variant="secondary" size="sm" onClick={loadData} disabled={loading}>
              <Icon name="sparkles" className="h-3.5 w-3.5" />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <span>Active Leaves on {DateUtils.formatDate(selectedDate)}</span>
          {list !== null && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                list.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {list.length} on leave
            </span>
          )}
        </CardHeader>

        <Table>
          <Thead>
            <Th>Employee</Th>
            {isAdmin && <Th>Department</Th>}
            <Th>Leave Type</Th>
            <Th>Dates & Duration</Th>
            <Th>Session</Th>
            <Th>Reason</Th>
            <Th className="text-right">Status</Th>
          </Thead>
          <tbody>
            {loading && list === null ? (
              <EmptyRow colSpan={isAdmin ? 7 : 6}>Loading employee leave schedule...</EmptyRow>
            ) : list === null || list.length === 0 ? (
              <EmptyRow colSpan={isAdmin ? 7 : 6}>
                No approved leaves scheduled on {DateUtils.formatDate(selectedDate)}{' '}
                {isAdmin
                  ? selectedDept
                    ? `in ${selectedDept}`
                    : 'organization-wide'
                  : `in ${currentUser?.department || 'your'} department`}
                .
              </EmptyRow>
            ) : (
              list.map((l) => (
                <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{l.employeeName || 'Employee'}</div>
                    <div className="text-xs text-slate-500">{l.employeeEmail || ''}</div>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {l.department || '—'}
                      </span>
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{l.leaveTypeDisplayName || l.leaveType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      {DateUtils.formatDate(l.startDate)} &rarr; {DateUtils.formatDate(l.endDate)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {l.totalDays} day{l.totalDays > 1 ? 's' : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {l.halfDay ? (
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                        Half Day ({l.halfDaySession || 'First Half'})
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Full Day</span>
                    )}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-xs text-slate-600 italic">
                    {l.reason ? `"${l.reason}"` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      Approved
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
