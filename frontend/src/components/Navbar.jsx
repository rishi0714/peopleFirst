import { useAuth } from '../context/AuthContext.jsx';
import RoleBadge from './RoleBadge.jsx';
import Button from './Button.jsx';
import Icon from './Icon.jsx';

function initials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 py-3.5 backdrop-blur-md">
      <div className="flex items-center gap-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 text-xs font-bold text-white shadow-xs">
          {initials(currentUser.fullName)}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800">{currentUser.fullName}</span>
            <RoleBadge role={currentUser.role} isContractor={currentUser.contractor} />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Icon name="briefcase" className="h-3 w-3 text-slate-400" />
            <span>{currentUser.department}</span>
            <span>&bull;</span>
            <span>{currentUser.baseLocation}</span>
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={logout}>
        <Icon name="logout" className="h-3.5 w-3.5 text-slate-500" />
        Sign Out
      </Button>
    </header>
  );
}
