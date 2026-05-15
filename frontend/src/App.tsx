import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { PremiumProvider } from './contexts/PremiumContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthSuccess from './pages/OAuthSuccess';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budgets from './pages/Budgets';
import Recurring from './pages/Recurring';
import PremiumSummary from './pages/PremiumSummary';
import PaymentRazorpay from './pages/PaymentRazorpay';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  console.log('[AdminRoute] isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
}

function UserRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  console.log('[UserRoute] isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (isAdmin) return <Navigate to="/admin" />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  console.log('[PublicRoute] isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);
  if (!isAuthenticated) return <>{children}</>;
  console.log('[PublicRoute] Redirecting to:', isAdmin ? "/admin" : "/dashboard");
  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} />;
}

export default function App() {
  return (
    <PremiumProvider>
      <Routes>
      {/* Landing Page */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />

      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      {/* User Routes (USER only) */}
      <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
      <Route path="/expenses" element={<UserRoute><Expenses /></UserRoute>} />
      <Route path="/income" element={<UserRoute><Income /></UserRoute>} />
      <Route path="/budgets" element={<UserRoute><Budgets /></UserRoute>} />
            <Route path="/recurring" element={<UserRoute><Recurring /></UserRoute>} />
      <Route path="/payment-razorpay" element={<UserRoute><PaymentRazorpay /></UserRoute>} />
      <Route path="/premium-summary" element={<UserRoute><PremiumSummary /></UserRoute>} />
      <Route path="/notifications" element={<UserRoute><Notifications /></UserRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
      <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </PremiumProvider>
  );
}
