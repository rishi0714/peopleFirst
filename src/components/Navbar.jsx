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
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
          {initials(currentUser.fullName)}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">{currentUser.fullName}</span>
            <RoleBadge role={currentUser.role} isContractor={currentUser.contractor} />
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Icon name="briefcase" className="h-3 w-3" />
            {currentUser.department} &bull; {currentUser.baseLocation}
          </div>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={logout}>
        <Icon name="logout" className="h-3.5 w-3.5" />
        Sign Out
      </Button>
    </header>
  );
}
