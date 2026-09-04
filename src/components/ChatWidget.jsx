import { useEffect, useRef, useState } from 'react';
import { useAgentChat } from '../hooks/useAgentChat.js';
import ChatMessage from './ChatMessage.jsx';
import Icon from './Icon.jsx';

const DEFAULT_QUICK_REPLIES = ['What are my leave balances?', 'Company leave policies', 'Campus amenities'];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  const { messages, quickReplies, sending, sendMessage } = useAgentChat({
    greeting:
      'Hello! I am **Kura**, your leave management and wellbeing concierge. Ask me about your leave balances, policies, or campus health amenities!',
    quickReplies: DEFAULT_QUICK_REPLIES,
    conversationId: 'web-chat-session',
  });

  useEffect(() => {
    if (isOpen) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input;
    setInput('');
    sendMessage(text);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-raised)] transition-transform hover:scale-[1.03] hover:bg-indigo-700"
      >
        <Icon name="sparkles" className="h-4 w-4" />
        Chat with Kura
      </button>

      {isOpen && (
        <div className="fixed right-6 bottom-24 z-40 flex h-[520px] w-[360px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-indigo-600 px-4 py-3.5 text-white">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <Icon name="sparkles" className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-bold">Kura AI Concierge</div>
                <div className="text-[11px] opacity-90">Grounded on company policies</div>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white" aria-label="Close chat">
              <Icon name="close" className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto bg-slate-50 px-3.5 py-3.5">
            {messages.map((m, i) => (
              <ChatMessage key={i} {...m} />
            ))}
            {sending && <ChatMessage role="agent" text="Kura is thinking..." />}
            <div ref={endRef} />
          </div>

          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-200 bg-white px-3 py-2">
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Message Kura..."
              autoComplete="off"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex items-center justify-center rounded-lg bg-indigo-600 px-3.5 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!input.trim()}
            >
              <Icon name="send" className="h-4 w-4" strokeWidth={2} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
