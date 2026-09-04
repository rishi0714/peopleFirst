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
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
        <Icon name="sparkles" className="h-7 w-7" strokeWidth={1.75} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900">Kura AI Agent Portal</h2>
      <p className="mb-6 text-sm text-slate-500">Contractor Leave Management & Wellbeing Concierge</p>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="mt-2 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Authenticate with Kura Agent
        </button>
      </form>

      <div className="mt-6 text-xs text-slate-500">
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
    <div className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-600 text-white">
            <Icon name="sparkles" className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="font-bold text-slate-800">Kura AI Concierge — Contractor Portal</div>
            <div className="text-xs text-slate-500">
              Logged in as <strong>{currentUser.fullName}</strong> ({currentUser.contractor ? 'Contractor Partner' : currentUser.role})
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!currentUser.contractor && (
            <button onClick={() => navigate('/dashboard')} className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200">
              Return to Web Portal &rarr;
            </button>
          )}
          <button onClick={handleSignOut} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-6 py-6">
        {messages.map((m, i) => (
          <ChatMessage key={i} {...m} />
        ))}
        {sending && <ChatMessage role="agent" text="Kura is processing..." />}
        <div ref={endRef} />
      </div>

      {quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-white px-6 py-3">
          {quickReplies.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3 border-t border-slate-200 bg-white px-6 py-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          type="text"
          placeholder="Type a message or instruction for Kura..."
          autoComplete="off"
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
        />
        <button type="submit" className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          Send &rarr;
        </button>
      </form>
    </div>
  );
}

export default function ContractorPortalPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {isAuthenticated ? <ContractorChatInterface /> : <ContractorLoginForm />}
    </div>
  );
}
