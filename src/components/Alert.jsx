const VARIANTS = {
  danger: 'bg-rose-50 border-rose-200 text-rose-800',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  info: 'bg-indigo-50 border-indigo-200 text-indigo-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
};

export default function Alert({ variant = 'info', children, className = '' }) {
  return (
    <div className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${VARIANTS[variant]} ${className}`}>
      {children}
    </div>
  );
}
