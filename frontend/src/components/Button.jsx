const VARIANTS = {
  primary: 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200/90 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
  outline: 'border border-slate-200 bg-white text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
  danger: 'bg-rose-600 text-white shadow-xs hover:bg-rose-700 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2',
  success: 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
};

const SIZES = {
  sm: 'px-2.5 py-1.5 text-xs rounded-lg',
  md: 'px-3.5 py-2 text-sm rounded-lg',
};

export default function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button
      className={`inline-flex cursor-pointer items-center justify-center gap-1.5 font-semibold tracking-tight transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  );
}
