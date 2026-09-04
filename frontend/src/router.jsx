import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.jsx';
import RoleRoute from './components/RoleRoute.jsx';

import LoginPage from './pages/LoginPage.jsx';
import ContractorPortalPage from './pages/ContractorPortalPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ApplyLeavePage from './pages/ApplyLeavePage.jsx';
import LeaveHistoryPage from './pages/LeaveHistoryPage.jsx';
import ApprovalsPage from './pages/ApprovalsPage.jsx';
import TeamBalancesPage from './pages/TeamBalancesPage.jsx';
import AdminLeavesPage from './pages/AdminLeavesPage.jsx';
import AdminAuditPage from './pages/AdminAuditPage.jsx';
import PolicyPage from './pages/PolicyPage.jsx';
import TicketsPage from './pages/TicketsPage.jsx';
import WellnessPage from './pages/WellnessPage.jsx';
import OnLeavePage from './pages/OnLeavePage.jsx';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/contractor', element: <ContractorPortalPage /> },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'apply-leave', element: <ApplyLeavePage /> },
      { path: 'my-leaves', element: <LeaveHistoryPage /> },
      { path: 'policies', element: <PolicyPage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'wellness', element: <WellnessPage /> },
      {
        element: <RoleRoute requireManager />,
        children: [
          { path: 'approvals', element: <ApprovalsPage /> },
          { path: 'team-balances', element: <TeamBalancesPage /> },
          { path: 'on-leave', element: <OnLeavePage /> },
        ],
      },
      {
        element: <RoleRoute requireAdmin />,
        children: [
          { path: 'admin/leaves', element: <AdminLeavesPage /> },
          { path: 'admin/audit', element: <AdminAuditPage /> },
          { path: 'admin/balances', element: <TeamBalancesPage /> },
          { path: 'admin/on-leave', element: <OnLeavePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
