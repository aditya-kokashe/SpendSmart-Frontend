import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Target,
  Repeat,
  Bell,
  LogOut,
  Shield,
  Users,
  Wallet,
  Crown,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';
import { usePremium } from '../contexts/PremiumContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/expenses', label: 'Expenses', icon: ArrowDownCircle },
  { to: '/income', label: 'Income', icon: ArrowUpCircle },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
  { to: '/notifications', label: 'Notifications', icon: Bell },
];

const adminNavItems = [
  { to: '/admin', label: 'Admin Dashboard', icon: Shield },
  { to: '/admin/users', label: 'Manage Users', icon: Users },
];

export default function Sidebar() {
  const { logout, userName, isAdmin } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationAPI.getUnreadCount();
        setUnreadCount(res.data);
      } catch (e) {
        console.error('Failed to fetch unread count', e);
      }
    };
    fetchUnread();

    window.addEventListener('notifications_updated', fetchUnread);
    return () => window.removeEventListener('notifications_updated', fetchUnread);
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Wallet className="landing-logo-icon" />
        <span>SpendSmart</span>
      </div>
      <nav className="sidebar-nav">
        {isAdmin
          ? adminNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link admin-link${isActive ? ' active' : ''}`}
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))
          : navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
              >
                <item.icon />
                {item.label}
                {item.to === '/notifications' && unreadCount > 0 && (
                  <span className="badge">{unreadCount}</span>
                )}
              </NavLink>
            ))}
      </nav>
      {!premiumLoading && isPremium && (
        <div className="sidebar-premium-section">
          <div className="premium-badge">
            <Crown className="premium-crown-icon" />
            <span className="premium-text">Premium Member</span>
          </div>
        </div>
      )}
      <div className="sidebar-user">
        <div className="user-info">
          <img 
            src="https://picsum.photos/seed/user-avatar/40/40.jpg" 
            alt="User Avatar" 
            className="user-avatar"
          />
          <span className="user-name">{userName || 'User'}</span>
        </div>
      </div>
      {userName && (
        <div className="sidebar-bottom">
          <button className="sidebar-link logout-btn" onClick={logout}>
            <LogOut />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
