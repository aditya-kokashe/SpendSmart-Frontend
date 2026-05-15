import React, { useEffect, useState } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { paymentAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';

interface PaymentMethod {
  id: number;
  method: string;
  description: string;
  lastFour: string;
  isDefault: boolean;
  createdAt: string;
}

export default function Payments() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toasts, showToast } = useToast();

  const [formData, setFormData] = useState({
    method: 'CREDIT_CARD',
    description: '',
    lastFour: '',
    isDefault: false,
  });

  const fetchData = async () => {
    try {
      const response = await paymentAPI.getAll();
      setMethods(response.data);
    } catch (error) {
      showToast('Failed to load payment methods', 'error');
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
      await paymentAPI.create(formData);
      showToast('Payment method added', 'success');
      setFormData({ method: 'CREDIT_CARD', description: '', lastFour: '', isDefault: false });
      fetchData();
    } catch (error) {
      showToast('Failed to add payment method', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">

        <div className="card form-card">
          <h3>Add Payment Method</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Method Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HDFC Credit Card"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  className="form-select"
                  value={formData.method}
                  onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                  required
                >
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="CASH">Cash</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Last 4 Digits</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1234"
                  maxLength={4}
                  value={formData.lastFour}
                  onChange={(e) => setFormData({ ...formData, lastFour: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Default Method</label>
                <select
                  className="form-select"
                  value={formData.isDefault.toString()}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.value === 'true' })}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              <Plus size={18} />
              {submitting ? 'Adding...' : 'Add Method'}
            </button>
          </form>
        </div>

        <div className="page-header">
          <h2>Saved Methods</h2>
        </div>

        {loading ? (
          <Loader />
        ) : methods.length === 0 ? (
          <EmptyState title="No payment methods" message="Add a method to start tracking your expenses." />
        ) : (
          <div className="data-list">
            {methods.map((method) => (
              <div key={method.id} className="data-item">
                <div className="data-item-left">
                  <div className="data-item-icon neutral">
                    <CreditCard size={18} />
                  </div>
                  <div className="data-item-info">
                    <h4>{method.description || method.method}</h4>
                    <p>{(method.method || '').replace('_', ' ')} {method.isDefault ? '(Default)' : ''}</p>
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
