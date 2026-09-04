import { apiRequest } from './client.js';

export const leaveApi = {
  getMyLeaves() {
    return apiRequest('/api/leaves');
  },

  getLeaveById(id) {
    return apiRequest(`/api/leaves/${id}`);
  },

  applyLeave(leaveData) {
    return apiRequest('/api/leaves', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  },

  editLeave(id, leaveData) {
    return apiRequest(`/api/leaves/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leaveData),
    });
  },

  cancelLeave(id, comment) {
    const query = comment ? `?comment=${encodeURIComponent(comment)}` : '';
    return apiRequest(`/api/leaves/${id}${query}`, {
      method: 'DELETE',
    });
  },

  getBalances(scope) {
    const query = scope ? `?scope=${scope}` : '';
    return apiRequest(`/api/leaves/balances${query}`);
  },

  getPendingApprovals() {
    return apiRequest('/api/leaves/approvals/pending');
  },

  approveLeave(id, comment) {
    return apiRequest(`/api/leaves/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  rejectLeave(id, comment) {
    return apiRequest(`/api/leaves/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  sendBackLeave(id, comment) {
    return apiRequest(`/api/leaves/${id}/sendBack`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  },

  getEmployeesOnLeave(date, department) {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (department) params.append('department', department);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/leaves/on-leave${query}`);
  },

  getAllLeavesOrgWide() {
    return apiRequest('/api/admin/leaves');
  },

  adminDirectEdit(id, editData) {
    return apiRequest(`/api/admin/leaves/${id}/direct-edit`, {
      method: 'PUT',
      body: JSON.stringify(editData),
    });
  },

  getAuditLogsForLeave(id) {
    return apiRequest(`/api/admin/leaves/${id}/audit-logs`);
  },

  getAllAuditLogs() {
    return apiRequest('/api/admin/audit-logs');
  },
};
