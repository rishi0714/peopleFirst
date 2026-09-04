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
      <tr className="border-b border-slate-800 bg-slate-100 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase">
        {children}
      </tr>
    </thead>
  );
}

export function Th({ children, className = '' }) {
  return <th className={`px-4 py-3 ${className}`}>{children}</th>;
}

export function EmptyRow({ colSpan, children }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-slate-500">
        {children}
      </td>
    </tr>
  );
}
