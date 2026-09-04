const VARIANTS = {
  danger: 'bg-rose-50/90 border-rose-200 border-l-rose-500 text-rose-900',
  success: 'bg-emerald-50/90 border-emerald-200 border-l-emerald-500 text-emerald-900',
  info: 'bg-indigo-50/90 border-indigo-200 border-l-indigo-500 text-indigo-900',
  warning: 'bg-amber-50/90 border-amber-200 border-l-amber-500 text-amber-900',
};

export default function Alert({ variant = 'info', children, className = '' }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border border-l-4 px-4 py-3 text-sm shadow-xs ${VARIANTS[variant]} ${className}`}>
      <div className="flex-1">{children}</div>
    </div>
  );
}
