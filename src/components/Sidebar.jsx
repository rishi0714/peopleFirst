import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Icon from './Icon.jsx';

const linkBase =
  'group relative flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900';
const linkActive = 'bg-slate-100 text-slate-900 hover:bg-slate-100 hover:text-slate-900';

function NavItem({ to, icon, label }) {
  return (
    <NavLink to={to} className={({ isActive }) => `${linkBase} ${isActive ? linkActive : ''}`}>
      {({ isActive }) => (
        <>
          <span
            className={`absolute top-1/2 left-0 h-4 w-0.5 -translate-y-1/2 rounded-full bg-slate-900 transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <Icon name={icon} className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-500'}`} />
          {label}
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="px-3.5 pt-4 pb-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
      {children}
    </div>
  );
}

export default function Sidebar() {
  const { isManager, isAdmin } = useAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
          <Icon name="leaf" className="h-5 w-5" strokeWidth={2} />
        </span>
        <div className="leading-tight">
          <div className="text-[15px] font-bold text-slate-900">peopleFirst</div>
          <div className="text-[11px] font-medium text-slate-400">Wellbeing Concierge</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-3">
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
            <NavItem to="/admin/on-leave" icon="calendarDays" label="Who's on Leave" />
            <NavItem to="/admin/audit" icon="scroll" label="System Audit Logs" />
            <NavItem to="/admin/balances" icon="globe" label="Org-Wide Balances" />
          </>
        )}
      </nav>

      <div className="border-t border-slate-200 px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Icon name="sparkles" className="h-3.5 w-3.5 text-slate-500" />
            AI Concierge <strong className="font-semibold text-slate-700">Kura</strong>
          </div>
          <span className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-600">
            v2026.1
          </span>
        </div>
      </div>
    </aside>
  );
}
