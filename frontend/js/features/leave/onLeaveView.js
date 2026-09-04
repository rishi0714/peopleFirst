import { leaveApi } from '../../api/leaveApi.js';
import { Auth } from '../../core/auth.js';
import { DateUtils } from '../../utils/dateUtils.js';

export const OnLeaveView = {
  selectedDate: null,
  selectedDept: '',

  render() {
    const user = Auth.getCurrentUser();
    const isAdmin = Auth.isAdmin();
    const isManager = Auth.isManager();
    const dept = user?.department || '';

    const todayStr = DateUtils.formatDateISO(new Date());
    if (!this.selectedDate) {
      this.selectedDate = todayStr;
    }

    return `
      <div class="view-header">
        <div>
          <h2 class="view-title">👥 Who's on Leave</h2>
          <p class="view-subtitle">
            ${isAdmin 
              ? 'Organization-wide leave visibility across all departments and locations.' 
              : `Department-level leave oversight for <strong>${dept}</strong> department.`}
          </p>
        </div>
      </div>

      <div class="card" style="margin-bottom: 1.5rem;">
        <div class="card-body" style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between;">
          <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center;">
            <div>
              <label class="form-label" style="margin-bottom: 0.25rem; font-size: 0.75rem;">Select Date</label>
              <input type="date" id="onLeaveDateInput" class="form-input" style="padding: 0.4rem 0.75rem; width: auto;" value="${this.selectedDate}" onclick="try{this.showPicker()}catch(e){}" />
            </div>

            <div style="display: flex; gap: 0.35rem; align-items: flex-end; padding-top: 1.25rem;">
              <button class="btn btn-sm btn-outline date-quick-btn" data-date="${todayStr}">Today</button>
              <button class="btn btn-sm btn-outline date-quick-btn" data-date="${DateUtils.formatDateISO(DateUtils.addDays(new Date(), 1))}">Tomorrow</button>
            </div>

            ${isAdmin ? `
              <div style="margin-left: 1rem;">
                <label class="form-label" style="margin-bottom: 0.25rem; font-size: 0.75rem;">Department Filter</label>
                <select id="onLeaveDeptSelect" class="form-select" style="padding: 0.4rem 0.75rem; width: auto;">
                  <option value="">All Departments</option>
                  <option value="Engineering" ${this.selectedDept === 'Engineering' ? 'selected' : ''}>Engineering</option>
                  <option value="Product" ${this.selectedDept === 'Product' ? 'selected' : ''}>Product</option>
                  <option value="Executive" ${this.selectedDept === 'Executive' ? 'selected' : ''}>Executive</option>
                  <option value="Human Resources" ${this.selectedDept === 'Human Resources' ? 'selected' : ''}>Human Resources</option>
                </select>
              </div>
            ` : `
              <div style="margin-left: 1rem; padding-top: 1.25rem;">
                <span class="badge badge-primary" style="font-size: 0.8125rem; padding: 0.35rem 0.75rem;">
                  🏢 Scoped to: ${dept} Department
                </span>
              </div>
            `}
          </div>

          <div style="padding-top: 1.25rem;">
            <button id="refreshOnLeaveBtn" class="btn btn-sm btn-secondary">🔄 Refresh</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
          <span id="onLeaveCardTitle">Active Leaves on ${DateUtils.formatDate(this.selectedDate)}</span>
          <span id="onLeaveCountBadge" class="badge badge-neutral">Loading...</span>
        </div>
        <div class="card-body" style="padding: 0;">
          <div id="onLeaveContentContainer">
            <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
              Loading employee leave schedule...
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async attachEvents() {
    const dateInput = document.getElementById('onLeaveDateInput');
    const deptSelect = document.getElementById('onLeaveDeptSelect');
    const refreshBtn = document.getElementById('refreshOnLeaveBtn');

    if (dateInput) {
      dateInput.addEventListener('change', () => {
        this.selectedDate = dateInput.value;
        this.loadData();
      });
    }

    if (deptSelect) {
      deptSelect.addEventListener('change', () => {
        this.selectedDept = deptSelect.value;
        this.loadData();
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.loadData();
      });
    }

    document.querySelectorAll('.date-quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const d = btn.getAttribute('data-date');
        if (d && dateInput) {
          dateInput.value = d;
          this.selectedDate = d;
          this.loadData();
        }
      });
    });

    await this.loadData();
  },

  async loadData() {
    const container = document.getElementById('onLeaveContentContainer');
    const titleEl = document.getElementById('onLeaveCardTitle');
    const countBadge = document.getElementById('onLeaveCountBadge');
    if (!container) return;

    if (titleEl) {
      titleEl.textContent = `Active Leaves on ${DateUtils.formatDate(this.selectedDate)}`;
    }

    try {
      const user = Auth.getCurrentUser();
      const isAdmin = Auth.isAdmin();
      const deptParam = isAdmin ? this.selectedDept : user?.department;

      const list = await leaveApi.getEmployeesOnLeave(this.selectedDate, deptParam);

      if (countBadge) {
        countBadge.textContent = `${list.length} on leave`;
        countBadge.className = list.length > 0 ? 'badge badge-warning' : 'badge badge-success';
      }

      if (!list || list.length === 0) {
        const scopeLabel = isAdmin 
          ? (this.selectedDept ? `in the **${this.selectedDept}** department` : 'organization-wide')
          : `in the **${user?.department || 'your'}** department`;

        container.innerHTML = `
          <div style="padding: 3rem 1.5rem; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏖️</div>
            <h4 style="margin-bottom: 0.25rem; font-weight: 600;">No Employees on Leave</h4>
            <p style="color: var(--text-muted); font-size: 0.875rem;">
              There are no approved leaves scheduled ${scopeLabel} on <strong>${DateUtils.formatDate(this.selectedDate)}</strong>.
            </p>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="table-container" style="border:none;">
          <table class="table">
            <thead>
              <tr>
                <th>Employee Name</th>
                ${isAdmin ? '<th>Department</th>' : ''}
                <th>Leave Type</th>
                <th>Dates & Duration</th>
                <th>Session</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(l => `
                <tr>
                  <td>
                    <div style="font-weight: 600; color: var(--text-primary);">${l.employeeName || 'Employee'}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${l.employeeEmail || ''}</div>
                  </td>
                  ${isAdmin ? `
                    <td>
                      <span class="badge badge-neutral" style="font-size: 0.75rem;">${l.department || 'N/A'}</span>
                    </td>
                  ` : ''}
                  <td>
                    <span style="font-weight: 500;">${l.leaveTypeDisplayName || l.leaveType}</span>
                  </td>
                  <td>
                    <div><strong>${DateUtils.formatDate(l.startDate)}</strong> to <strong>${DateUtils.formatDate(l.endDate)}</strong></div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${l.totalDays} day${l.totalDays > 1 ? 's' : ''}</div>
                  </td>
                  <td>
                    ${l.halfDay 
                      ? `<span class="badge badge-info" style="font-size: 0.75rem;">Half Day (${l.halfDaySession || 'First Half'})</span>` 
                      : '<span style="color: var(--text-muted); font-size: 0.8125rem;">Full Day</span>'}
                  </td>
                  <td>
                    <span style="font-size: 0.8125rem; color: var(--text-secondary); font-style: italic;">
                      ${l.reason ? `"${l.reason}"` : '—'}
                    </span>
                  </td>
                  <td>
                    <span class="badge badge-success">Approved</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } catch (err) {
      console.error(err);
      container.innerHTML = `
        <div style="padding: 1.5rem;">
          <div class="alert alert-danger">Failed to load on-leave records: ${err.message}</div>
        </div>
      `;
    }
  }
};
