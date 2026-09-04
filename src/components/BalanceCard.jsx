import Icon from './Icon.jsx';

const LEAVE_THEMES = {
  CASUAL: { icon: 'calendarDays', bg: 'bg-indigo-50 text-indigo-600', ring: 'group-hover:border-indigo-200' },
  SICK: { icon: 'shield', bg: 'bg-rose-50 text-rose-600', ring: 'group-hover:border-rose-200' },
  PAID: { icon: 'briefcase', bg: 'bg-blue-50 text-blue-600', ring: 'group-hover:border-blue-200' },
  MATERNITY: { icon: 'sparkles', bg: 'bg-emerald-50 text-emerald-600', ring: 'group-hover:border-emerald-200' },
  LOP: { icon: 'document', bg: 'bg-slate-100 text-slate-600', ring: 'group-hover:border-slate-300' },
  VOLUNTEERING: { icon: 'users', bg: 'bg-amber-50 text-amber-600', ring: 'group-hover:border-amber-200' },
  WFH: { icon: 'building', bg: 'bg-teal-50 text-teal-600', ring: 'group-hover:border-teal-200' },
};

export default function BalanceCard({ balance }) {
  const theme = LEAVE_THEMES[balance.leaveType] || {
    icon: 'calendarDays',
    bg: 'bg-indigo-50 text-indigo-600',
    ring: 'group-hover:border-indigo-200',
  };

  return (
    <div className={`group relative rounded-xl border border-slate-200/90 bg-white p-4.5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-raised ${theme.ring}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{balance.leaveTypeDisplayName}</div>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.bg} shadow-xs transition-transform group-hover:scale-105`}>
          <Icon name={theme.icon} className="h-4 w-4" strokeWidth={2} />
        </span>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{balance.remainingDays}</span>
        <span className="text-xs font-medium text-slate-400">days left</span>
      </div>
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <div>
          Used: <span className="font-semibold text-slate-700">{balance.usedDays}</span>
        </div>
        <span className="h-3 w-px bg-slate-200" />
        <div>
          Pending: <span className="font-semibold text-amber-600">{balance.pendingDays}</span>
        </div>
        <span className="h-3 w-px bg-slate-200" />
        <div>
          Quota: <span className="font-semibold text-slate-700">{balance.allocatedDays}</span>
        </div>
      </div>
    </div>
  );
}
