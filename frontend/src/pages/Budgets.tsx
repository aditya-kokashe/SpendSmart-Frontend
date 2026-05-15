import React, { useEffect, useState } from 'react';
import { Target, Pencil, Trash2 } from 'lucide-react';
import { budgetAPI, categoryAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';

interface Budget {
  id: number;
  amount: number;
  spent: number;
  categoryId: number;
  categoryName: string;
  name: string;
  percentageUsed: number;
  status: string;
  statusColor: string;
  createdAt: string;
  startDate?: string; // Optional field for budget period start date
}

export default function Budgets() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, showToast } = useToast();

  // Month filter state
  const currentMonth = new Date().getMonth();
  const monthNames = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonth + 1]);

  // Filter logic for budget data (special case using startDate)
  const filteredBudgets = budgets.filter((budget) => {
    if (selectedMonth === 'All') return true;
    
    // Use startDate date for filtering budgets (more relevant than createdAt)
    const budgetDate = new Date(budget.startDate || budget.createdAt);
    const itemMonth = budgetDate.getMonth();
    const selectedMonthIndex = monthNames.indexOf(selectedMonth) - 1; // Subtract 1 because "All" is at index 0
    
    return itemMonth === selectedMonthIndex;
  });

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: '',
    customCategoryName: '',
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
  });

  // Helper function to get last day of month
  const getLastDayOfMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year, month, 0).getDate(); // month is 1-based, so month+1 and day 0 gives last day of previous month
  };
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [budRes, catRes] = await Promise.all([
        budgetAPI.getAll(),
        categoryAPI.getByType('EXPENSE'),
      ]);
      setBudgets(budRes.data);
      setCategories(catRes.data);
    } catch (error) {
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Validate that either a category is selected or custom category is provided
      if (!formData.category || formData.category === '') {
        throw new Error('Please select a category');
      }
      
      if (formData.category === 'custom' && (!formData.customCategoryName || formData.customCategoryName.trim() === '')) {
        throw new Error('Please enter a custom category name');
      }

      const lastDay = getLastDayOfMonth(formData.month);
      const payload = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        categoryId: formData.category === 'custom' ? null : parseInt(formData.category),
        customCategoryName: formData.category === 'custom' ? formData.customCategoryName : null,
        startDate: formData.month + '-01',
        endDate: formData.month + '-' + lastDay.toString().padStart(2, '0'),
      };

      if (editingId) {
        await budgetAPI.update(editingId, payload);
        showToast('Budget updated successfully', 'success');
      } else {
        await budgetAPI.create(payload);
        showToast('Budget created successfully', 'success');
      }
      setFormData({
        name: '',
        amount: '',
        category: '',
        customCategoryName: '',
        month: new Date().toISOString().slice(0, 7),
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      showToast(editingId ? 'Failed to update budget' : 'Failed to create budget', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      name: budget.name,
      amount: budget.amount.toString(),
      category: budget.categoryId.toString(),
      customCategoryName: '',
      month: new Date().toISOString().slice(0, 7),
    });
    setEditingId(budget.id);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: '',
      amount: '',
      category: '',
      customCategoryName: '',
      month: new Date().toISOString().slice(0, 7),
    });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await budgetAPI.delete(id);
      showToast('Budget deleted', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to delete budget', 'error');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
          {/* Left Side - Budget Data */}
          <div style={{ flex: '1', minWidth: '0' }}>
            <div className="page-header">
              <h2>Active Budgets</h2>
              <p>Monitor your spending limits and track progress towards your financial goals</p>
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
            ) : filteredBudgets.length === 0 ? (
              <EmptyState title="No budgets found" message={selectedMonth === 'All' ? "No budgets set yet. Start managing your finances by creating your first budget above." : `No budgets found for ${selectedMonth}. Try selecting a different month or create a new budget.`} />
            ) : (
              <div className="data-list">
                {filteredBudgets.map((budget) => (
                  <div key={budget.id} className="card" style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div className="data-item-info">
                        <h4>{budget.name}</h4>
                        <p>Budget for {budget.categoryName}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="data-item-amount">₹{(budget.spent || 0).toLocaleString()} / ₹{(budget.amount || 0).toLocaleString()}</div>
                          <p style={{ fontSize: '12px', color: budget.statusColor === 'red' ? 'var(--red)' : 'var(--text-secondary)' }}>
                            {budget.status === 'EXCEEDED' ? 'Over budget!' : `${Math.round(budget.percentageUsed)}% used`}
                          </p>
                        </div>
                        <div className="data-item-actions">
                          <button className="edit-btn" onClick={() => handleEdit(budget)} title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(budget.id)} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      backgroundColor: '#2a2a2a', 
                      borderRadius: '4px', 
                      height: '12px', 
                      overflow: 'hidden',
                      border: '1px solid #333'
                    }}>
                      <div
                        style={{
                          width: `${Math.min(budget.percentageUsed, 100)}%`,
                          height: '100%',
                          background: budget.statusColor === 'red' 
                            ? 'linear-gradient(90deg, #dc2626 0%, #ef4444 50%, #f87171 100%)'
                            : budget.statusColor === 'orange' 
                            ? 'linear-gradient(90deg, #ea580c 0%, #f97316 50%, #fb923c 100%)'
                            : 'linear-gradient(90deg, #16a34a 0%, #22c55e 50%, #4ade80 100%)',
                          transition: 'width 0.3s ease',
                          borderRadius: '3px'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Form */}
          <div style={{ width: '400px', flexShrink: 0 }}>
            <div className="card form-card">
              <h3>{editingId ? 'Edit Budget' : 'Set New Budget'}</h3>
              <p className="form-description">Create spending limits and track your budget progress with visual indicators</p>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Budget Name</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Monthly Food Budget"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => {
                        setFormData({ ...formData, category: e.target.value, customCategoryName: '' });
                      }}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="custom">+ Add Custom Category</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Budget Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Month</label>
                    <input
                      type="month"
                      className="form-input"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      required
                    />
                  </div>
                </div>
                {formData.category === 'custom' && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Custom Category Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter category name"
                        value={formData.customCategoryName}
                        onChange={(e) => setFormData({ ...formData, customCategoryName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {editingId && (
                      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      <Target size={18} />
                      {submitting ? 'Saving...' : (editingId ? 'Update Budget' : 'Create Budget')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
