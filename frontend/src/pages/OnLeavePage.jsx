import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { leaveApi } from '../api/leaveApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Card from '../components/Card.jsx';
import Icon from '../components/Icon.jsx';
import Button from '../components/Button.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

export default function OnLeavePage() {
  const { user, isAdmin, isManager } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedDept, setSelectedDept] = useState('');
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOnLeave = async (date, dept) => {
    setLoading(true);
    setError(null);
    try {
      const data = await leaveApi.getEmployeesOnLeave(date, dept || undefined);
      setLeaves(data || []);
    } catch (err) {
      console.error('Failed to load on-leave records:', err);
      setError(err.message || 'Failed to load employees on leave.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnLeave(selectedDate, selectedDept);
  }, [selectedDate, selectedDept]);

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  const setTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Who's on Leave"
        subtitle={
          isAdmin
            ? 'Organization-wide live oversight of employees currently on approved leave.'
            : `Live oversight of employees in the ${user?.department || 'your'} department on approved leave.`
        }
      />

      {/* Filter Toolbar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="target-date" className="text-xs font-semibold text-slate-600">
                Date:
              </label>
              <input
                id="target-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant={isToday ? 'primary' : 'secondary'}
                size="sm"
                onClick={setToday}
              >
                Today
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={setTomorrow}
              >
                Tomorrow
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <label htmlFor="dept-filter" className="text-xs font-semibold text-slate-600">
                  Department:
                </label>
                <select
                  id="dept-filter"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Departments (Org-Wide)</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Executive">Executive</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                <Icon name="building" className="h-3.5 w-3.5" />
                <span>Department: {user?.department || 'My Department'}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Status banner / Count */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-medium text-slate-600">
          Showing active leaves for <strong className="text-slate-900">{selectedDate}</strong>
          {selectedDept && <span> in <strong className="text-slate-900">{selectedDept}</strong></span>}
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {leaves.length} on leave
        </span>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      {/* Leaves List */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent mr-2.5"></div>
            Loading active leaves...
          </div>
        ) : leaves.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Icon name="checkCircle" className="h-6 w-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800">No Employees on Leave</h3>
            <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
              No employees {isManager && !isAdmin ? `in ${user?.department || 'your department'}` : ''} have approved leave scheduled for {selectedDate}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Leave Type</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Days</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700 text-xs">
                          {leave.employeeName?.charAt(0) || 'E'}
                        </div>
                        <div>
                          <div>{leave.employeeName}</div>
                          {leave.employeeEmail && (
                            <div className="text-xs font-normal text-slate-400">{leave.employeeEmail}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {leave.department || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{leave.leaveTypeDisplayName || leave.leaveType}</div>
                      {leave.halfDay && (
                        <span className="text-[11px] font-semibold text-amber-600">
                          Half Day ({leave.halfDaySession})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {leave.startDate} to {leave.endDate}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {leave.totalDays} {leave.totalDays === 1 ? 'day' : 'days'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title={leave.reason}>
                      {leave.reason ? `"${leave.reason}"` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={leave.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
