import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { Bell, Check, Trash2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  category: string;
  createdAt: string;
  isRead: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast } = useToast();

  // Month filter state
  const currentMonth = new Date().getMonth();
  const monthNames = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonth + 1]);

  // Filter logic for notification data (using createdAt)
  const filteredNotifications = notifications.filter((notification) => {
    if (selectedMonth === 'All') return true;
    
    const notificationDate = new Date(notification.createdAt);
    const itemMonth = notificationDate.getMonth();
    const selectedMonthIndex = monthNames.indexOf(selectedMonth) - 1; // Subtract 1 because "All" is at index 0
    
    return itemMonth === selectedMonthIndex;
  });

  useEffect(() => {
    fetchNotifications();
  }, [showToast]);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data);
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (error) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
      showToast('Marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark as read', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationAPI.delete(id);
      fetchNotifications();
      showToast('Notification deleted', 'success');
    } catch (error) {
      showToast('Failed to delete notification', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">

        <div className="page-header">
          <h2>Notifications</h2>
          <p>Stay updated with budget alerts, system notifications, and important financial reminders</p>
          <div style={{ marginTop: '1rem' }}>
            <label style={{ marginRight: '0.5rem', fontSize: '0.9rem', color: '#a0a0a0' }}>Filter by month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '0.5rem',
                borderRadius: '6px',
                border: '1px solid #333',
                backgroundColor: '#2a2a2a',
                color: '#ffffff',
                fontSize: '0.9rem'
              }}
            >
              {monthNames.map((month) => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : filteredNotifications.length === 0 ? (
          <EmptyState title="No notifications found" message={selectedMonth === 'All' ? "No notifications yet. You're all caught up! New notifications will appear here." : `No notifications found for ${selectedMonth}. Try selecting a different month.`} />
        ) : (
          <div className="data-list">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`data-item ${!notification.isRead ? 'unread' : ''}`}
                style={{ opacity: notification.isRead ? 0.6 : 1 }}
              >
                <div className="data-item-left">
                  <div className={`data-item-icon ${notification.type.toLowerCase() === 'warning' ? 'expense' : 'income'}`}>
                    <Bell size={18} />
                  </div>
                  <div className="data-item-info">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <p style={{ fontSize: '12px', color: '#a0a0a0', marginTop: '4px' }}>
                      {notification.category} • {formatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="data-item-right">
                  <div className="data-item-actions">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="edit-btn"
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="delete-btn"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
