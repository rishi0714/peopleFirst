import { DateUtils } from '../utils/dateUtils.js';
import StatusBadge from './StatusBadge.jsx';

export default function LeaveRow({ leave, actions }) {
  return (
    <tr className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/80">
      <td className="px-5 py-3.5">
        <div className="font-semibold text-slate-800">{leave.leaveTypeDisplayName}</div>
        {leave.combinedWithType && (
          <div className="mt-0.5 text-xs font-medium text-indigo-600">+ Combined with {leave.combinedWithType}</div>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="text-sm font-medium text-slate-700">
          {DateUtils.formatDate(leave.startDate)} &rarr; {DateUtils.formatDate(leave.endDate)}
        </div>
        <div className="text-xs text-slate-400">
          {leave.totalDays} day{leave.totalDays > 1 ? 's' : ''} {leave.halfDay ? '(Half-Day)' : ''}
        </div>
      </td>
      <td className="px-5 py-3.5">
        <StatusBadge status={leave.status} />
      </td>
      <td className="max-w-[220px] truncate px-5 py-3.5 text-sm text-slate-500">{leave.reason || '—'}</td>
      <td className="px-5 py-3.5 text-right">{actions}</td>
    </tr>
  );
}
