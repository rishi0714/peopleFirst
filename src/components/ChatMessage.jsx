import { formatReply } from '../utils/formatReply.js';
import Icon from './Icon.jsx';

export default function ChatMessage({ role, text, suggestions, error }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'rounded-br-sm bg-indigo-600 text-white'
            : `rounded-bl-sm border bg-white ${error ? 'border-rose-300 text-rose-700' : 'border-slate-200 text-slate-700'}`
        }`}
      >
        {isUser ? text : <span dangerouslySetInnerHTML={{ __html: formatReply(text) }} />}

        {suggestions && suggestions.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {suggestions.map((sug, i) => (
              <div key={i} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                <div className="flex items-center gap-1 text-xs font-semibold text-emerald-800">
                  <Icon name="leaf" className="h-3.5 w-3.5" strokeWidth={2} /> {sug.title}
                </div>
                <div className="mt-0.5 text-xs text-slate-700">{sug.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
