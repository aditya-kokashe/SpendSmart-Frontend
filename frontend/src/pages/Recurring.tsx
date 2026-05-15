import React, { useEffect, useState } from 'react';
import { Repeat, Pencil, Trash2 } from 'lucide-react';
import { recurringAPI, categoryAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';

interface RecurringRule {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  type: string;
  nextDate: string;
  startDate: string;
  endDate?: string;
  categoryId: number;
}

export default function Recurring() {
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, showToast } = useToast();

  // Month filter state
  const currentMonth = new Date().getMonth();
  const monthNames = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonth + 1]);

  // Filter logic for recurring data (using startDate)
  const filteredRules = rules.filter((rule) => {
    if (selectedMonth === 'All') return true;
    
    const ruleDate = new Date(rule.startDate);
    const itemMonth = ruleDate.getMonth();
    const selectedMonthIndex = monthNames.indexOf(selectedMonth) - 1; // Subtract 1 because "All" is at index 0
    
    return itemMonth === selectedMonthIndex;
  });

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    categoryId: '',
    frequency: 'MONTHLY',
    type: 'EXPENSE',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    customCategoryName: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [recRes, catRes] = await Promise.all([
        recurringAPI.getAll(),
        categoryAPI.getAll(),
      ]);
      setRules(recRes.data);
      setCategories(catRes.data.filter((c: any) => c.type === 'EXPENSE' || c.type === 'BOTH'));
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
      if (editingId) {
        await recurringAPI.update(editingId, {
          ...formData,
          amount: parseFloat(formData.amount),
          categoryId: parseInt(formData.categoryId),
        });
        showToast('Recurring rule updated', 'success');
      } else {
        await recurringAPI.create({
          ...formData,
          amount: parseFloat(formData.amount),
          categoryId: parseInt(formData.categoryId),
        });
        showToast('Recurring rule created', 'success');
      }
      setFormData({
        name: '',
        amount: '',
        categoryId: '',
        frequency: 'MONTHLY',
        type: 'EXPENSE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        customCategoryName: '',
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      showToast(editingId ? 'Failed to update rule' : 'Failed to create rule', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (rule: RecurringRule) => {
    setFormData({
      name: rule.name,
      amount: rule.amount.toString(),
      categoryId: rule.categoryId.toString(),
      frequency: rule.frequency,
      type: rule.type,
      startDate: rule.startDate,
      endDate: rule.endDate || '',
      customCategoryName: '',
    });
    setEditingId(rule.id);
  };

  const handleCancelEdit = () => {
    setFormData({
      name: '',
      amount: '',
      categoryId: '',
      frequency: 'MONTHLY',
      type: 'EXPENSE',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      customCategoryName: '',
    });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await recurringAPI.delete(id);
      showToast('Recurring rule deleted', 'success');
      setRules(rules.filter((r) => r.id !== id));
    } catch (error) {
      showToast('Failed to delete rule', 'error');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem' }}>
          {/* Left Side - Recurring Rules Data */}
          <div style={{ flex: '1', minWidth: '0' }}>
            <div className="page-header">
              <h2>Your Rules</h2>
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
            ) : filteredRules.length === 0 ? (
              <EmptyState title="No recurring rules found" message={selectedMonth === 'All' ? "No recurring rules set yet. Create your first recurring rule above." : `No recurring rules found for ${selectedMonth}. Try selecting a different month or create a new rule.`} />
            ) : (
              <div className="data-list">
                {filteredRules.map((rule) => (
                  <div key={rule.id} className="data-item">
                    <div className="data-item-left">
                      <div className="data-item-icon neutral">
                        <Repeat size={18} />
                      </div>
                      <div className="data-item-info">
                        <h4>{rule.name}</h4>
                        <p>{rule.frequency} • {rule.type} • Next: {new Date(rule.nextDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="data-item-right">
                      <div className="data-item-amount">₹{rule.amount.toLocaleString()}</div>
                      <div className="data-item-actions">
                        <button className="edit-btn" onClick={() => handleEdit(rule)} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(rule.id)} title="Delete">
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
              <h3>{editingId ? 'Edit Recurring Rule' : 'Set Up Recurring Rule'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Netflix Subscription"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      className="form-select"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      required
                    >
                      <option value="EXPENSE">Expense</option>
                      <option value="INCOME">Income</option>
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
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
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
                <div className="form-row">
                  <div className="form-group" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                    {editingId && (
                      <button type="button" className="btn btn-secondary" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      <Repeat size={18} />
                      {submitting ? 'Saving...' : (editingId ? 'Update Rule' : 'Set Recurring')}
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
