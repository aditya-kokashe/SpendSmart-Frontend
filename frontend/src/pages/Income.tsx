import React, { useEffect, useState } from 'react';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { incomeAPI, categoryAPI } from '../services/api';

const INCOME_SOURCES = ['SALARY', 'FREELANCE', 'BUSINESS', 'INVESTMENT', 'GIFT', 'OTHER'];
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';

interface Income {
  id: number;
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  source: string;
  isRecurring: boolean;
}

export default function Income() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, showToast } = useToast();

  // Month filter state
  const currentMonth = new Date().getMonth();
  const monthNames = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonth + 1]);

  // Filter logic for income data
  const filteredIncomes = incomes.filter((income) => {
    if (selectedMonth === 'All') return true;
    
    const itemMonth = new Date(income.date).getMonth();
    const selectedMonthIndex = monthNames.indexOf(selectedMonth) - 1; // Subtract 1 because "All" is at index 0
    
    return itemMonth === selectedMonthIndex;
  });

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    source: 'SALARY',
    customCategoryName: '',
    isRecurring: false,
    date: new Date().toISOString().split('T')[0],
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [incRes, catRes] = await Promise.all([
        incomeAPI.getAll(),
        categoryAPI.getByType('INCOME'),
      ]);
      setIncomes(incRes.data);
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
      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        source: formData.source,
        customCategoryName: formData.customCategoryName || null,
        isRecurring: formData.isRecurring,
        date: formData.date,
        frequency: formData.isRecurring ? formData.frequency : null,
        startDate: formData.isRecurring ? formData.startDate : null,
        endDate: formData.isRecurring ? formData.endDate || null : null,
      };

      if (editingId) {
        await incomeAPI.update(editingId, payload);
        showToast('Income updated successfully', 'success');
      } else {
        await incomeAPI.create(payload);
        showToast('Income added successfully', 'success');
      }
      setFormData({
        description: '',
        amount: '',
        categoryId: '',
        source: 'SALARY',
        customCategoryName: '',
        isRecurring: false,
        date: new Date().toISOString().split('T')[0],
        frequency: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      showToast(editingId ? 'Failed to update income' : 'Failed to add income', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (income: Income) => {
    setFormData({
      description: income.description,
      amount: income.amount.toString(),
      categoryId: income.categoryId.toString(),
      source: income.source,
      customCategoryName: '',
      isRecurring: income.isRecurring,
      date: income.date.split('T')[0],
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setEditingId(income.id);
  };

  const handleCancelEdit = () => {
    setFormData({
      description: '',
      amount: '',
      categoryId: '',
      source: 'SALARY',
      customCategoryName: '',
      isRecurring: false,
      date: new Date().toISOString().split('T')[0],
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await incomeAPI.delete(id);
      showToast('Income deleted', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to delete income', 'error');
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Unknown';
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
          {/* Left Side - Income Data */}
          <div style={{ flex: '1', minWidth: '0' }}>
            <div className="page-header">
              <h2>Income History</h2>
              <p>Review your earnings and track income patterns over time</p>
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
            ) : filteredIncomes.length === 0 ? (
              <EmptyState title="No income found" message={selectedMonth === 'All' ? "No income recorded yet. Start tracking your earnings by adding your first income source above." : `No income found for ${selectedMonth}. Try selecting a different month or add new income.`} />
            ) : (
              <div className="data-list">
                {filteredIncomes.map((income) => (
                  <div key={income.id} className="data-item">
                    <div className="data-item-left">
                      <div className="data-item-icon income">
                        <Plus size={18} />
                      </div>
                      <div className="data-item-info">
                        <h4>{income.description}</h4>
                        <p>{getCategoryName(income.categoryId)} • {income.source} • {income.isRecurring ? '🔄' : ''} • {new Date(income.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="data-item-right">
                      <div className="data-item-amount income">+₹{income.amount.toLocaleString()}</div>
                      <div className="data-item-actions">
                        <button className="edit-btn" onClick={() => handleEdit(income)} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(income.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Form */}
          <div style={{ width: '400px', flexShrink: 0 }}>
            <div className="card form-card">
              <h3>{editingId ? 'Edit Income' : 'Add New Income'}</h3>
              <p className="form-description">Track your earnings and monitor your income sources</p>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Monthly Salary"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      className="form-select"
                      value={formData.categoryId}
                      onChange={(e) => {
                        setFormData({ ...formData, categoryId: e.target.value, customCategoryName: '' });
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
                    <label>Source</label>
                    <select
                      className="form-select"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      required
                    >
                      {INCOME_SOURCES.map((source) => (
                        <option key={source} value={source}>{source}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {formData.categoryId === 'custom' && (
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
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Recurring</label>
                    <select
                      className="form-select"
                      value={formData.isRecurring.toString()}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.value === 'true' })}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </div>
                {formData.isRecurring && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Frequency</label>
                        <select
                          className="form-select"
                          value={formData.frequency}
                          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                          required
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="MONTHLY">Monthly</option>
                          <option value="YEARLY">Yearly</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Start Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>End Date (Optional)</label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
                <div className="form-row">
                  <div className="form-group" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {editingId && (
                      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      <Plus size={18} />
                      {submitting ? 'Saving...' : (editingId ? 'Update Income' : 'Add Income')}
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
