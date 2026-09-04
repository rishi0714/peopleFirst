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
        className="fixed right-6 bottom-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-3 text-sm font-semibold text-white shadow-raised transition-all duration-200 hover:scale-105 hover:shadow-indigo-500/25 active:scale-95"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
          <Icon name="sparkles" className="h-3.5 w-3.5 text-white" strokeWidth={2} />
        </span>
        <span>Chat with Kura</span>
      </button>

      {isOpen && (
        <div className="fixed right-6 bottom-24 z-40 flex h-[540px] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-popover">
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700 px-4.5 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs">
                <Icon name="sparkles" className="h-4.5 w-4.5 text-white" strokeWidth={2} />
              </span>
              <div>
                <div className="text-sm font-bold tracking-tight">Kura AI Concierge</div>
                <div className="flex items-center gap-1.5 text-[11px] text-indigo-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  <span>Grounded on company policies</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              aria-label="Close chat"
            >
              <Icon name="close" className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 px-4 py-4">
            {messages.map((m, i) => (
              <ChatMessage key={i} {...m} />
            ))}
            {sending && <ChatMessage role="agent" text="Kura is thinking..." />}
            <div ref={endRef} />
          </div>

          {quickReplies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 bg-white px-3.5 py-2.5">
              {quickReplies.map((q, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => sendMessage(q)}
                  className="rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 transition-all hover:bg-indigo-100 active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-slate-100 bg-white p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              type="text"
              placeholder="Ask Kura about leave or wellness..."
              autoComplete="off"
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
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
