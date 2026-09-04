export function Table({ children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  );
}

export function Thead({ children }) {
  return (
    <thead>
      <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase">
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children, className = '' }) {
  return <th className={`px-5 py-3.5 ${className}`}>{children}</th>;
}

export function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-12 text-center text-sm text-slate-400">
        {children}
      </td>
    </tr>
  );
}
