export function Card({ children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-200/90 bg-white shadow-card transition-all duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between rounded-t-xl border-b border-slate-100 bg-slate-50/60 px-5 py-3.5 font-semibold text-slate-800 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
