export const STATUS_BADGES = {
  PENDING: { label: 'Pending Approval', className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/25 font-medium' },
  APPROVED: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/25 font-medium' },
  REJECTED: { label: 'Rejected', className: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/25 font-medium' },
  RETURNED: { label: 'Returned / Send Back', className: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/25 font-medium' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-400/20 font-medium' },
};

export function getStatusBadge(status) {
  return STATUS_BADGES[status] || { label: status, className: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-400/20 font-medium' };
}

export function getRoleBadge(role, isContractor) {
  if (isContractor) {
    return { label: 'Contractor', className: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-600/25 font-semibold' };
  }
  switch (role) {
    case 'ADMIN':
      return { label: 'Admin', className: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/25 font-semibold' };
    case 'MANAGER':
      return { label: 'Manager', className: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/25 font-semibold' };
    default:
      return { label: 'Employee', className: 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-300 font-semibold' };
  }
}
