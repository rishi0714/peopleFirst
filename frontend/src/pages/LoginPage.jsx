import { useState } from 'react';
import { flushSync } from 'react-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';

const DEMO_ACCOUNTS = [
  { username: 'employee1', icon: 'user', label: 'Employee', portal: 'Employee Dashboard' },
  { username: 'manager1', icon: 'briefcase', label: 'Manager', portal: 'Manager Approvals' },
  { username: 'admin1', icon: 'shield', label: 'Admin', portal: 'Admin Governance' },
  { username: 'contractor1', icon: 'wrench', label: 'Contractor', portal: 'Contractor Kura Agent', accent: true },
];

function previewForUsername(username) {
  const lower = (username || '').toLowerCase().trim();
  if (lower.includes('contractor')) return { text: 'Destination: Kura AI Concierge (Contractor Portal)', icon: 'wrench', color: 'bg-amber-50 text-amber-800 ring-amber-600/20' };
  if (lower.includes('admin')) return { text: 'Destination: Admin Governance Portal', icon: 'shield', color: 'bg-sky-50 text-sky-800 ring-sky-600/20' };
  if (lower.includes('manager')) return { text: 'Destination: Manager Approvals Portal', icon: 'briefcase', color: 'bg-indigo-50 text-indigo-800 ring-indigo-600/20' };
  if (lower.includes('employee')) return { text: 'Destination: Employee Leave Dashboard', icon: 'user', color: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20' };
  return null;
}

export default function LoginPage() {
  const { isAuthenticated, isContractor, setUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusText, setStatusText] = useState('Sign In');

  if (isAuthenticated) {
    return <Navigate to={isContractor ? '/contractor' : '/dashboard'} replace />;
  }

  function fillDemo(account) {
    setUsername(account.username);
    setPassword('password123');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    setStatusText('Authenticating & verifying status...');

    try {
      let result;
      try {
        result = await authApi.login(username.trim(), password, 'WEB');
      } catch (webErr) {
        if (webErr.status === 403 && webErr.message?.toLowerCase().includes('contractor')) {
          result = await authApi.login(username.trim(), password, 'AGENT');
        } else {
          throw webErr;
        }
      }

      // Flush synchronously so the role-guarded routes (RoleRoute) see the
      // new auth state before the navigate() call below triggers a transition.
      flushSync(() => setUser(result.user, result.accessToken, result.refreshToken));
      const user = result.user;
      const isContractorUser = user.contractor === true || user.role === 'CONTRACTOR';

      if (isContractorUser) {
        setStatusText('Redirecting to Contractor Portal...');
        navigate('/contractor', { replace: true });
        return;
      }
      if (user.role === 'ADMIN') {
        setStatusText('Redirecting to Admin Portal...');
        navigate('/admin/leaves', { replace: true });
        return;
      }
      if (user.role === 'MANAGER') {
        setStatusText('Redirecting to Manager Approvals...');
        navigate('/approvals', { replace: true });
        return;
      }
      setStatusText('Redirecting to Leave Dashboard...');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setSubmitting(false);
      setStatusText('Sign In');
      setError(err.message || 'Invalid username or password.');
    }
  }

  const preview = previewForUsername(username);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 15%, rgb(99 102 241 / 0.12), transparent 45%), radial-gradient(circle at 90% 85%, rgb(16 185 129 / 0.08), transparent 45%)',
        }}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-8 pt-9 pb-7 text-center">
          <div className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30">
            <Icon name="leaf" className="h-6 w-6" strokeWidth={2.2} />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">peopleFirst</h1>
          <p className="mt-1 text-sm text-slate-500">Unified Gateway &bull; Leave &amp; Wellbeing Concierge</p>
        </div>

        <div className="p-8">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4.5">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase" htmlFor="loginUsername">
                Username
              </label>
              <input
                id="loginUsername"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username (e.g. employee1, contractor1)"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase" htmlFor="loginPassword">
                Password
              </label>
              <input
                id="loginPassword"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>

            {preview && (
              <div className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-center text-xs font-semibold ring-1 ring-inset ${preview.color}`}>
                <Icon name={preview.icon} className="h-3.5 w-3.5" strokeWidth={2} />
                {preview.text}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:from-indigo-500 hover:to-indigo-600 hover:shadow-md hover:shadow-indigo-500/25 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {statusText}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-5">
            <div className="mb-3 text-center text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              1-Click Demo Accounts &middot; password123
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.username}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150 active:scale-95 ${
                    account.accent
                      ? 'border-amber-200 bg-amber-50/80 text-amber-800 hover:bg-amber-100 shadow-2xs'
                      : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900 shadow-2xs'
                  }`}
                >
                  <Icon name={account.icon} className="h-3.5 w-3.5" strokeWidth={2} />
                  {account.label}
                </button>
              ))}
            </div>
            <p className="mt-3.5 text-center text-xs leading-relaxed text-slate-400">
              Single unified sign-in: Automatically detects your role and redirects to your dedicated portal.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
