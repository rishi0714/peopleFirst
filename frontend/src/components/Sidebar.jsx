import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';

const linkBase =
  'group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-all duration-150 hover:bg-slate-100/70 hover:text-slate-900';
const linkActive =
  'bg-indigo-50/80 text-indigo-700 font-semibold hover:bg-indigo-50/90 hover:text-indigo-700 shadow-xs';

function NavItem({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
      {({ isActive }) => (
        <>
          <span
            className={`absolute top-1/2 left-0 h-5 w-1 -translate-y-1/2 rounded-r-full bg-indigo-600 transition-all duration-200 ${
              isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'
            }`}
          />
          <Icon
            name={icon}
            className={`h-[18px] w-[18px] shrink-0 transition-colors ${
              isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
            }`}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="px-3.5 pt-4 pb-1.5 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
      {children}
    </div>
  );
}

export default function Sidebar() {
  const { isManager, isAdmin } = useAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xs shadow-indigo-600/30">
          <Icon name="leaf" className="h-5 w-5" strokeWidth={2.2} />
        </span>
        <div className="leading-tight">
          <div className="text-[15px] font-bold tracking-tight text-slate-900">peopleFirst</div>
          <div className="text-[11px] font-medium text-slate-400">Wellbeing &amp; Leave</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        <SectionLabel>My Workplace</SectionLabel>
        <NavItem to="/dashboard" icon="dashboard" label="Dashboard" />
        <NavItem to="/apply-leave" icon="plus" label="Apply for Leave" />
        <NavItem to="/my-leaves" icon="calendarDays" label="My Leave History" />
        <NavItem to="/policies" icon="document" label="Company Policies" />
        <NavItem to="/tickets" icon="ticket" label="Support Tickets" />
        <NavItem to="/wellness" icon="sparkles" label="Wellness Concierge" />

        {isManager && (
          <>
            <SectionLabel>Management Hub</SectionLabel>
            <NavItem to="/approvals" icon="checkCircle" label="Team Approvals" />
            <NavItem to="/team-balances" icon="users" label="Team Balances" />
            <NavItem to="/on-leave" icon="calendarDays" label="Who's on Leave" />
          </>
        )}

        {isAdmin && (
          <>
            <SectionLabel>Administration</SectionLabel>
            <NavItem to="/admin/leaves" icon="shield" label="Org Leaves & Direct Edit" />
            <NavItem to="/admin/audit" icon="scroll" label="System Audit Logs" />
            <NavItem to="/admin/balances" icon="globe" label="Org-Wide Balances" />
            <NavItem to="/admin/on-leave" icon="calendarDays" label="Who's on Leave" />
          </>
        )}
      </nav>

      <div className="border-t border-slate-100 px-4 py-3.5">
        <div className="flex items-center justify-between rounded-xl bg-slate-50/80 px-3 py-2 border border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <span className="text-slate-500">Concierge:</span>
            <strong className="font-semibold text-slate-800">Kura</strong>
          </div>
          <span className="rounded-md bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 shadow-2xs">
            v2026.1
          </span>
        </div>
      </div>
    </aside>
  );
}
