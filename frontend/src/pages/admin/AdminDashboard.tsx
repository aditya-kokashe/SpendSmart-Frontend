import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, Folder } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { adminAPI } from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getDashboardStats();
        setStats(response.data);
      } catch (err: any) {
        console.error('Failed to load dashboard stats:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const dashboardStats = [
    {
      title: 'Total Users',
      value: stats?.totalUsers?.toString() || '0',
      subtitle: `${stats?.activeUsers || 0} active, ${stats?.inactiveUsers || 0} inactive`,
      icon: Users,
      color: '#6c63ff',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers?.toString() || '0',
      subtitle: 'Currently active accounts',
      icon: UserCheck,
      color: '#34c759',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Inactive Users',
      value: stats?.inactiveUsers?.toString() || '0',
      subtitle: 'Inactive accounts',
      icon: UserX,
      color: '#ff3b30',
      onClick: () => navigate('/admin/users'),
    },
    {
      title: 'Categories',
      value: 'Manage',
      subtitle: 'View all categories',
      icon: Folder,
      color: '#007AFF',
      onClick: () => navigate('/admin/categories'),
    },
  ];

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="loading-spinner"></div>
            <p>Loading dashboard statistics...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
            <div style={{ padding: '2rem' }}>
            <div className="card" style={{ backgroundColor: '#fff5f5', borderColor: '#feb2b2' }}>
              <h3 style={{ color: '#c53030' }}>Error Loading Dashboard</h3>
              <p>{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">

        <div className="dashboard-page-welcome">
          <h1>Platform Overview</h1>
          <p>Monitor system activity and user engagement across the entire platform</p>
        </div>

        <div className="dashboard-summary-cards">
          {dashboardStats.map((stat) => (
            <div
              key={stat.title}
              className="dashboard-summary-card"
              onClick={stat.onClick}
              style={{ cursor: 'pointer' }}
            >
              <div className="dashboard-card-icon" style={{ backgroundColor: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div className="dashboard-label">{stat.title}</div>
              <div className="dashboard-value">{stat.value}</div>
              <div className="dashboard-subtitle">{stat.subtitle}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h3>Administrative Actions</h3>
          <p>Manage platform resources efficiently</p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/admin/categories')}
            >
              Manage Categories
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
