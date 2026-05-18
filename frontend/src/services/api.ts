import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://100.48.97.64:8080';

const api = axios.create({
  baseURL: API_BASE,
});

// Attach JWT and user email to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const email = localStorage.getItem('userEmail');
  const role = localStorage.getItem('userRole') || 'USER';
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (email) {
    config.headers['X-User-Email'] = email;
  }
  
  config.headers['X-User-Role'] = role;
  
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', {
      url: err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
      data: err.response?.data,
      message: err.message
    });
    
    // Auto-logout on 401 for all endpoints
    if (err.response?.status === 401) {
      console.warn('401 Unauthorized - clearing auth and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

//AUTH
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/api/auth/register', data),
  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/api/auth/verify-otp', data),
  resendOtp: (data: { email: string }) =>
    api.post('/api/auth/resend-otp', data),
};

//EXPENSES 
export const expenseAPI = {
  getAll: () => api.get('/api/expenses'),
  create: (data: Record<string, unknown>) => api.post('/api/expenses', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/api/expenses/${id}`),
};

//INCOMES
export const incomeAPI = {
  getAll: () => api.get('/api/incomes'),
  create: (data: Record<string, unknown>) => api.post('/api/incomes', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/incomes/${id}`, data),
  delete: (id: number) => api.delete(`/api/incomes/${id}`),
};

//BUDGETS
export const budgetAPI = {
  getAll: () => api.get('/api/budgets'),
  create: (data: Record<string, unknown>) => api.post('/api/budgets', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/budgets/${id}`, data),
  delete: (id: number) => api.delete(`/api/budgets/${id}`),
};

//CATEGORIES
export const categoryAPI = {
  getAll: () => api.get('/api/categories'),
  getByType: (type: 'EXPENSE' | 'INCOME' | 'BOTH') => api.get(`/api/categories/type/${type}`),
  create: (data: Record<string, unknown>) => api.post('/api/categories', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/categories/${id}`, data),
  delete: (id: number) => api.delete(`/api/categories/${id}`),
};

//RECURRING
export const recurringAPI = {
  getAll: () => api.get('/api/recurring'),
  create: (data: Record<string, unknown>) => api.post('/api/recurring', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/recurring/${id}`, data),
  delete: (id: number) => api.delete(`/api/recurring/${id}`),
};

//PAYMENTS
export const paymentAPI = {
  // Payment Methods CRUD
  getAll: () => api.get('/api/payment-methods'),
  create: (data: Record<string, unknown>) => api.post('/api/payment-methods', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/api/payment-methods/${id}`, data),
  delete: (id: number) => api.delete(`/api/payment-methods/${id}`),
  
  //Razorpay Gateway
  createOrder: () => api.post('/api/payments/create-order'),
  verifyPayment: (data: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    api.post('/api/payments/verify', data),
  getPremiumStatus: () => api.get('/api/payments/premium-status'),
  cancelPremium: () => api.post('/api/payments/cancel-premium'),
};

//SUMMARY
export const summaryAPI = {
  get: () => api.get('/api/summary'),
};

export const analyticsAPI = {
  publishExpenseActivity: (data: Record<string, unknown>) => api.post('/api/analytics/activity-events', data),
  getActivityLogs: () => api.get('/api/analytics/activity-logs'),
};

//NOTIFICATIONS
export const notificationAPI = {
  getAll: () => api.get('/api/notifications'),
  markAsRead: (id: number) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  delete: (id: number) => api.delete(`/api/notifications/${id}`),
  getUnreadCount: () => api.get('/api/notifications/unread-count'),
};

//ADMIN
export const adminAPI = {
  // User Management
  getUsers: () => api.get('/api/admin/users'),
  updateUserStatus: (id: number, status: string) => api.put(`/api/admin/users/${id}/status`, status, {
    headers: {
      'Content-Type': 'text/plain'
    }
  }),
  deleteUser: (id: number) => api.delete(`/api/admin/users/${id}`),
  
  // Category Management
  getAllCategories: () => api.get('/api/admin/categories'),
  getUserCategories: (userEmail: string) => api.get(`/api/admin/categories/user/${userEmail}`),
  deleteAnyCategory: (id: number) => api.delete(`/api/admin/categories/${id}`),
  
  //Dashboard Analytics
  getDashboardStats: () => api.get('/api/admin/dashboard'),
};

export default api;
