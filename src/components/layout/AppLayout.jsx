import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Sidebar from '../Sidebar.jsx';
import Navbar from '../Navbar.jsx';
import ChatWidget from '../ChatWidget.jsx';

export default function AppLayout() {
  const { isAuthenticated, isContractor } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isContractor) return <Navigate to="/contractor" replace />;

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}
