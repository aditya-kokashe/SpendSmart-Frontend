import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/Toast';
import { Trash2, Folder, Search } from 'lucide-react';

interface Category {
  id: number;
  userId: number;
  name: string;
  type: string;
  budgetLimit: number;
  isDefault: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [userCategories, setUserCategories] = useState<Category[]>([]);
  const [showUserCategories, setShowUserCategories] = useState(false);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminAPI.getAllCategories();
        setCategories(response.data);
      } catch (error: any) {
        console.error('Failed to load categories:', error);
        showToast('Failed to load categories', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [showToast]);

  const handleSearchUserCategories = async () => {
    if (!searchEmail.trim()) {
      showToast('Please enter a user email', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.getUserCategories(searchEmail);
      setUserCategories(response.data);
      setShowUserCategories(true);
      showToast(`Found ${response.data.length} categories for ${searchEmail}`, 'success');
    } catch (error: any) {
      console.error('Failed to load user categories:', error);
      showToast(error.response?.data?.message || 'Failed to load user categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(categoryId);
      await adminAPI.deleteAnyCategory(categoryId);
      
      if (showUserCategories) {
        setUserCategories(userCategories.filter(cat => cat.id !== categoryId));
      } else {
        setCategories(categories.filter(cat => cat.id !== categoryId));
      }
      
      showToast('Category deleted successfully', 'success');
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      showToast(error.response?.data?.message || 'Failed to delete category', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const displayCategories = showUserCategories ? userCategories : categories;

  if (loading) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Navbar title="Categories Management" />
          <Loader />
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Navbar title="Categories Management" />

        <div className="dashboard-page-welcome">
          <h1>Categories Management</h1>
          <p>View and manage categories across all users in the platform</p>
        </div>

        {/* Search User Categories */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3>Search User Categories</h3>
          <p>Find categories for a specific user</p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="email"
              placeholder="Enter user email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              style={{ flex: 1, padding: '0.75rem', border: '1px solid #ddd', borderRadius: '8px' }}
            />
            <button
              className="btn btn-primary"
              onClick={handleSearchUserCategories}
              disabled={loading}
            >
              <Search size={16} style={{ marginRight: '0.5rem' }} />
              Search
            </button>
            {showUserCategories && (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowUserCategories(false);
                  setUserCategories([]);
                  setSearchEmail('');
                }}
              >
                Show All Categories
              </button>
            )}
          </div>
        </div>

        <div className="card">
          <div className="data-list">
            {displayCategories.length === 0 ? (
              <div className="empty-state">
                <Folder size={48} />
                <h3>No Categories Found</h3>
                <p>{showUserCategories ? `No categories found for ${searchEmail}` : 'No categories in the system yet.'}</p>
              </div>
            ) : (
              displayCategories.map((category) => (
                <div key={category.id} className="data-item">
                  <div className="data-item-left">
                    <div className="data-item-icon neutral">
                      <Folder size={20} />
                    </div>
                    <div className="data-item-info">
                      <h4>{category.name}</h4>
                      <p>
                        Type: <span className={`role-badge ${category.type.toLowerCase()}`}>{category.type}</span>
                        {category.isDefault && <span className="status-badge active">Default</span>}
                        {category.isDeleted && <span className="status-badge inactive">Deleted</span>}
                      </p>
                      {category.budgetLimit && (
                        <p>Budget Limit: ${category.budgetLimit.toFixed(2)}</p>
                      )}
                      <p style={{ fontSize: '0.875rem', color: '#666' }}>
                        User ID: {category.userId} | Created: {new Date(category.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="data-item-right">
                    <div className="data-item-actions">
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={actionLoading === category.id}
                        title="Delete Category"
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
