export function Card({ children, className = '' }) {
  return <div className={`rounded-lg border border-slate-800 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-between rounded-t-md border-b border-slate-800 bg-slate-100 px-5 py-3.5 font-semibold text-slate-900 ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = '' }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}
