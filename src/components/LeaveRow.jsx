import { DateUtils } from '../utils/dateUtils.js';
import StatusBadge from './StatusBadge.jsx';

export default function LeaveRow({ leave, actions }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
      <td className="px-4 py-3">
        <div className="font-semibold text-slate-800">{leave.leaveTypeDisplayName}</div>
        {leave.combinedWithType && (
          <div className="text-xs text-indigo-600">+ Combined with {leave.combinedWithType}</div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="text-slate-700">
          {DateUtils.formatDate(leave.startDate)} &rarr; {DateUtils.formatDate(leave.endDate)}
        </div>
        <div className="text-xs text-slate-500">
          {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''} {leave.halfDay ? '(Half-Day)' : ''}
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={leave.status} />
      </td>
      <td className="max-w-[200px] truncate px-4 py-3 text-slate-600">{leave.reason || '—'}</td>
      <td className="px-4 py-3 text-right">{actions}</td>
    </tr>
  );
}
