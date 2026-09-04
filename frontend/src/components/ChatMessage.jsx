import { formatReply } from '../utils/formatReply.js';
import Icon from './Icon.jsx';

export default function ChatMessage({ role, text, suggestions, error }) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
          isUser
            ? 'rounded-br-xs bg-indigo-600 text-white'
            : `rounded-bl-xs border bg-white ${error ? 'border-rose-200 text-rose-700 bg-rose-50/50' : 'border-slate-200/90 text-slate-800'}`
        }`}
      >
        {isUser ? text : <span dangerouslySetInnerHTML={{ __html: formatReply(text) }} />}

        {suggestions && suggestions.length > 0 && (
          <div className="mt-2.5 space-y-2">
            {suggestions.map((sug, i) => (
              <div key={i} className="rounded-xl border border-emerald-200 bg-emerald-50/90 p-2.5 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <Icon name="leaf" className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} /> {sug.title}
                </div>
                <div className="mt-1 text-xs text-slate-700 leading-relaxed">{sug.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
