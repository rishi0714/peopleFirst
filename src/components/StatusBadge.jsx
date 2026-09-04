import { getStatusBadge } from '../utils/formatUtils.js';

export default function StatusBadge({ status }) {
  const { label, className } = getStatusBadge(status);
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${className}`}>
      {label}
    </span>
  );
}
