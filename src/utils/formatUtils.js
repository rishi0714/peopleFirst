export const STATUS_BADGES = {
  PENDING: { label: 'Pending Approval', className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' },
  APPROVED: { label: 'Approved', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' },
  REJECTED: { label: 'Rejected', className: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20' },
  RETURNED: { label: 'Returned / Send Back', className: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/15' },
};

export function getStatusBadge(status) {
  return STATUS_BADGES[status] || { label: status, className: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/15' };
}

export function getRoleBadge(role, isContractor) {
  if (isContractor) {
    return { label: 'Contractor', className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' };
  }
  switch (role) {
    case 'ADMIN':
      return { label: 'Admin', className: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20' };
    case 'MANAGER':
      return { label: 'Manager', className: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20' };
    default:
      return { label: 'Employee', className: 'bg-slate-900 text-white' };
  }
}
