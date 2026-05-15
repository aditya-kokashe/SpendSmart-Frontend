import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/Toast';
import { Trash2, UserCheck, UserX } from 'lucide-react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await adminAPI.getUsers();
        setUsers(response.data);
      } catch (error: any) {
        console.error('Failed to load users:', error);
        showToast('Failed to load users', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [showToast]);

  const handleUpdateUserStatus = async (userId: number, newStatus: string) => {
    try {
      setActionLoading(userId);
      await adminAPI.updateUserStatus(userId, newStatus);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      showToast(`User status updated to ${newStatus}`, 'success');
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      showToast(error.response?.data?.message || 'Failed to update user status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(userId);
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(user => user.id !== userId));
      showToast('User deleted successfully', 'success');
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      showToast(error.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
            <Loader />
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">

        <div className="dashboard-page-welcome">
          <h1>User Management</h1>
          <p>Manage user accounts, permissions, and activity across the platform</p>
        </div>

        <div className="card">
          <div className="data-list">
            {users.length === 0 ? (
              <div className="empty-state">
                <UserX size={48} />
                <h3>No Users Found</h3>
                <p>The platform is ready for new registrations.</p>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="data-item">
                  <div className="data-item-left">
                    <div className="data-item-icon neutral">
                      <UserCheck size={20} />
                    </div>
                    <div className="data-item-info">
                      <h4>{user.name}</h4>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <div className="data-item-right">
                    <span className={`role-badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                    <span className={`status-badge ${user.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                      {user.status}
                    </span>
                    <div className="data-item-actions">
                      {user.status === 'ACTIVE' ? (
                        <button
                          className="edit-btn"
                          onClick={() => handleUpdateUserStatus(user.id, 'INACTIVE')}
                          disabled={actionLoading === user.id}
                          title="Deactivate User"
                        >
                          <UserX size={16} />
                        </button>
                      ) : (
                        <button
                          className="edit-btn"
                          onClick={() => handleUpdateUserStatus(user.id, 'ACTIVE')}
                          disabled={actionLoading === user.id}
                          title="Activate User"
                        >
                          <UserCheck size={16} />
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={actionLoading === user.id}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
