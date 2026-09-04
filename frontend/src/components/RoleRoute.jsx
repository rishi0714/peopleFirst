import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RoleRoute({ requireManager = false, requireAdmin = false }) {
  const { isManager, isAdmin } = useAuth();

  if (requireAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;
  if (requireManager && !isManager) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
