import Icon from './Icon.jsx';

const ICONS = {
  CASUAL: 'calendarDays',
  SICK: 'shield',
  PAID: 'briefcase',
  MATERNITY: 'sparkles',
  LOP: 'document',
  VOLUNTEERING: 'users',
  WFH: 'building',
};

function iconFor(leaveType) {
  return ICONS[leaveType] || 'calendarDays';
}

export default function BalanceCard({ balance }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-white p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-raised)]">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{balance.leaveTypeDisplayName}</div>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
          <Icon name={iconFor(balance.leaveType)} className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">{balance.remainingDays}</div>
      <div className="mt-2.5 flex items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5 text-xs text-slate-500">
        <span>
          Used <strong className="text-slate-700">{balance.usedDays}</strong>
        </span>
        <span className="h-3 w-px bg-slate-200" />
        <span>
          Pending <strong className="text-slate-700">{balance.pendingDays}</strong>
        </span>
        <span className="h-3 w-px bg-slate-200" />
        <span>
          Alloc <strong className="text-slate-700">{balance.allocatedDays}</strong>
        </span>
      </div>
    </div>
  );
}
