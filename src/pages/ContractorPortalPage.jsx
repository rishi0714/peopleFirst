import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useAgentChat } from '../hooks/useAgentChat.js';
import ChatMessage from '../components/ChatMessage.jsx';
import Alert from '../components/Alert.jsx';
import Icon from '../components/Icon.jsx';

function ContractorLoginForm() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('contractor1');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const result = await authApi.login(username.trim(), password, 'AGENT');
      flushSync(() => setUser(result.user, result.accessToken, result.refreshToken));
      if (!result.user.contractor) {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  }

  return (
    <div className="mx-auto max-w-md p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30">
        <Icon name="sparkles" className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Kura AI Agent Portal</h2>
      <p className="mb-6 text-sm text-slate-500">Contractor Leave Management &amp; Wellbeing Concierge</p>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4.5 text-left">
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold tracking-wide text-slate-700 uppercase">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:from-indigo-500 hover:to-indigo-600 hover:shadow-md hover:shadow-indigo-500/25 active:scale-[0.99]"
        >
          Authenticate with Kura Agent
        </button>
      </form>

      <div className="mt-6 text-xs text-slate-400">
        Note: Contractors access peopleFirst services exclusively through the AI Agent interface.
      </div>
    </div>
  );
}

function ContractorChatInterface() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  const { messages, quickReplies, sending, sendMessage } = useAgentChat({
    greeting: `Hello ${currentUser.fullName}! I am **Kura**, your autonomous leave and wellbeing assistant at peopleFirst. As a contractor, you can manage your Sick, Paid, and LOP leaves, check quotas, read leave policies, or explore campus health amenities directly through our conversation.`,
    quickReplies: ['My Balances', 'Apply Sick Leave', 'Contractor Policies', 'Wellness Amenities'],
    conversationId: 'contractor-agent-session',
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    sendMessage(text);
  }

  function handleSignOut() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="flex h-screen flex-col bg-white">
      <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-3.5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-xs shadow-indigo-600/30">
            <Icon name="sparkles" className="h-5.5 w-5.5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="font-bold text-slate-900">Kura AI Concierge — Contractor Portal</div>
            <div className="text-xs text-slate-400">
              Logged in as <strong className="text-slate-700">{currentUser.fullName}</strong> ({currentUser.contractor ? 'Contractor Partner' : currentUser.role})
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!currentUser.contractor && (
            <button onClick={() => navigate('/dashboard')} className="cursor-pointer rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors">
              Return to Web Portal &rarr;
            </button>
          )}
          <button onClick={handleSignOut} className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-6 py-6">
        {messages.map((m, i) => (
          <ChatMessage key={i} {...m} />
        ))}
        {sending && <ChatMessage role="agent" text="Kura is processing..." />}
        <div ref={endRef} />
      </div>

      {quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-6 py-3">
          {quickReplies.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="cursor-pointer rounded-full border border-indigo-100 bg-indigo-50/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 transition-all hover:bg-indigo-100 active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 border-t border-slate-100 bg-white px-6 py-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Type a message or instruction for Kura..."
          autoComplete="off"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
        />
        <button type="submit" className="cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:from-indigo-500 hover:to-indigo-600 active:scale-95">
          Send &rarr;
        </button>
      </form>
    </div>
  );
}

export default function ContractorPortalPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {isAuthenticated ? <ContractorChatInterface /> : <ContractorLoginForm />}
    </div>
  );
}
