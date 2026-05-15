import React, { useEffect, useState } from 'react';
import { Trash2, Plus, Pencil } from 'lucide-react';
import { expenseAPI, categoryAPI, analyticsAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';

const PAYMENT_METHODS = ['CASH', 'CARD', 'UPI', 'BANK', 'WALLET'];

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  paymentMethod: string;
}

interface Category {
  id: number;
  name: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, showToast } = useToast();

  // Month filter state
  const currentMonth = new Date().getMonth();
  const monthNames = ['All', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [selectedMonth, setSelectedMonth] = useState(monthNames[currentMonth + 1]);

  // Filter logic for expense data
  const filteredExpenses = expenses.filter((expense) => {
    if (selectedMonth === 'All') return true;
    
    const itemMonth = new Date(expense.date).getMonth();
    const selectedMonthIndex = monthNames.indexOf(selectedMonth) - 1; // Subtract 1 because "All" is at index 0
    
    return itemMonth === selectedMonthIndex;
  });

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    categoryId: '',
    paymentMethod: 'CASH',
    customCategoryName: '',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    frequency: 'MONTHLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [expRes, catRes] = await Promise.all([
        expenseAPI.getAll(),
        categoryAPI.getByType('EXPENSE'),
      ]);
      setExpenses(expRes.data);
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
      if (!formData.categoryId || formData.categoryId === '') {
        throw new Error('Please select a category');
      }
      
      if (formData.categoryId === 'custom' && (!formData.customCategoryName || formData.customCategoryName.trim() === '')) {
        throw new Error('Please enter a custom category name');
      }

      const payload = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        categoryId: formData.categoryId === 'custom' ? 1 : parseInt(formData.categoryId),
        paymentMethod: formData.paymentMethod,
        customCategoryName: formData.categoryId === 'custom' ? formData.customCategoryName : null,
        date: formData.date,
        isRecurring: formData.isRecurring,
        frequency: formData.isRecurring ? formData.frequency : null,
        startDate: formData.isRecurring ? formData.startDate : null,
        endDate: formData.isRecurring ? formData.endDate || null : null,
      };

      if (editingId) {
        await expenseAPI.update(editingId, payload);
        showToast('Expense updated successfully', 'success');
      } else {
        const response = await expenseAPI.create(payload);
        showToast('Expense added successfully', 'success');
        analyticsAPI.publishExpenseActivity({
          expenseId: response.data?.id,
          description: payload.description,
          amount: payload.amount,
          categoryId: payload.categoryId,
          paymentMethod: payload.paymentMethod,
          date: payload.date,
          eventType: 'EXPENSE_CREATED',
          eventTime: new Date().toISOString(),
        }).catch(() => {
          console.warn('Analytics publish failed, continuing without interrupting expense creation');
        });
      }
      setFormData({
        description: '',
        amount: '',
        categoryId: '',
        paymentMethod: 'CASH',
        customCategoryName: '',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        frequency: 'MONTHLY',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
      });
      setEditingId(null);
      fetchData();
    } catch (error) {
      showToast(editingId ? 'Failed to update expense' : 'Failed to add expense', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      categoryId: expense.categoryId.toString(),
      paymentMethod: expense.paymentMethod,
      customCategoryName: '',
      date: expense.date.split('T')[0],
      isRecurring: false,
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setEditingId(expense.id);
  };

  const handleCancelEdit = () => {
    setFormData({
      description: '',
      amount: '',
      categoryId: '',
      paymentMethod: 'CASH',
      customCategoryName: '',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false,
      frequency: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    });
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    try {
      await expenseAPI.delete(id);
      showToast('Expense deleted', 'success');
      fetchData();
    } catch (error) {
      showToast('Failed to delete expense', 'error');
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
          {/* Left Side - Expense Data */}
          <div style={{ flex: '1', minWidth: '0' }}>
            <div className="page-header">
              <h2>Expense History</h2>
              <p>Review and manage your past expenses</p>
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
            ) : filteredExpenses.length === 0 ? (
              <EmptyState title="No expenses found" message={selectedMonth === 'All' ? "No expenses recorded yet. Start tracking your spending by adding your first expense above." : `No expenses found for ${selectedMonth}. Try selecting a different month or add new expense.`} />
            ) : (
              <div className="data-list">
                {filteredExpenses.map((expense) => (
                  <div key={expense.id} className="data-item">
                    <div className="data-item-left">
                      <div className="data-item-icon expense">
                        <Trash2 size={18} />
                      </div>
                      <div className="data-item-info">
                        <h4>{expense.description}</h4>
                        <p>{getCategoryName(expense.categoryId)} • {expense.paymentMethod} • {new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="data-item-right">
                      <div className="data-item-amount expense">-₹{expense.amount.toLocaleString()}</div>
                      <div className="data-item-actions">
                        <button className="edit-btn" onClick={() => handleEdit(expense)} title="Edit">
                          <Pencil size={16} />
                        </button>
                        <button className="delete-btn" onClick={() => handleDelete(expense.id)} title="Delete">
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
              <h3>{editingId ? 'Edit Expense' : 'Add New Expense'}</h3>
              <p className="form-description">Record your daily expenses and track where your money goes</p>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Description</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="What did you spend on?"
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
                    <label>Payment Method</label>
                    <select
                      className="form-select"
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      required
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>{method}</option>
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
                      {submitting ? 'Saving...' : (editingId ? 'Update Expense' : 'Add Expense')}
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
