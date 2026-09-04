import { getRoleBadge } from '../utils/formatUtils.js';

export default function RoleBadge({ role, isContractor }) {
  const { label, className } = getRoleBadge(role, isContractor);
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
}
