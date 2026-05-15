import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { summaryAPI, paymentAPI, analyticsAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import '../styles/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface SummaryData {
  totalIncome?: number;
  totalExpense?: number;
  balance?: number;
  categoryBreakdown?: Record<string, number>;
  monthlyComparison?: { month: string; income: number; expense: number }[];
  monthlySpending?: number;
  topCategory?: string;
  overspendingAmount?: number;
  advice?: string;
}

interface ActivityLog {
  id: number;
  expenseId?: number;
  userEmail: string;
  description: string;
  amount: number;
  categoryId?: number;
  paymentMethod: string;
  expenseDate: string;
  eventType: string;
  eventTime: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<SummaryData | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await summaryAPI.get();
        setData(response.data);
      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        showToast('Failed to load dashboard data', 'error');
        // Set fallback data to ensure charts display
        setData({
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          categoryBreakdown: {},
          monthlyComparison: [],
        });
      }
    };

    const fetchActivityLogs = async () => {
      try {
        const response = await analyticsAPI.getActivityLogs();
        setActivityLogs(response.data || []);
      } catch (error: any) {
        console.error('Failed to load activity logs:', error);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSummary(), fetchActivityLogs()]);
      setLoading(false);
    };

    loadData();
  }, [showToast]);

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

  if (!data) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content dashboard-page-container">
            <div className="dashboard-page-welcome">
            <h1>Welcome back!</h1>
            <p>Here's your financial overview</p>
          </div>
          <div className="dashboard-summary-cards">
            <div className="dashboard-summary-card income">
              <div className="dashboard-card-icon">
                <ArrowUpRight size={24} />
              </div>
              <div className="dashboard-label">Total Income</div>
              <div className="dashboard-value income">₹0</div>
            </div>
            <div className="dashboard-summary-card expense">
              <div className="dashboard-card-icon">
                <ArrowDownRight size={24} />
              </div>
              <div className="dashboard-label">Total Expense</div>
              <div className="dashboard-value expense">₹0</div>
            </div>
            <div className="dashboard-summary-card balance">
              <div className="dashboard-card-icon">
                <Wallet size={24} />
              </div>
              <div className="dashboard-label">Current Balance</div>
              <div className="dashboard-value">₹0</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const barData = {
    labels: (data?.monthlyComparison || []).map((m) => m?.month || 'No Data'),
    datasets: [
      {
        label: 'Income',
        data: (data?.monthlyComparison || []).map((m) => m?.income || 0),
        backgroundColor: '#34c759',
        borderRadius: 4,
      },
      {
        label: 'Expense',
        data: (data?.monthlyComparison || []).map((m) => m?.expense || 0),
        backgroundColor: '#ff3b30',
        borderRadius: 4,
      },
    ],
  };

  const pieData = {
    labels: Object.keys(data?.categoryBreakdown || {}).length > 0 
      ? Object.keys(data?.categoryBreakdown || {}) 
      : ['No Data'],
    datasets: [
      {
        data: Object.values(data?.categoryBreakdown || {}).length > 0 
          ? Object.values(data?.categoryBreakdown || {}) 
          : [1],
        backgroundColor: Object.keys(data?.categoryBreakdown || {}).length > 0 
          ? ['#b92121', '#34c759', '#ff9500', '#b4049c', '#4340f2', '#0f4f93', '#ff2d5384', '#5ac8fa', '#206a01']
          : ['#333333'],
        borderWidth: 0,
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { family: 'Inter', size: 12 },
          color: '#a0a0a0',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ₹${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#a0a0a0',
          font: { family: 'Inter', size: 11 },
        },
        grid: {
          color: '#333333',
        },
      },
      y: {
        ticks: {
          color: '#a0a0a0',
          font: { family: 'Inter', size: 11 },
        },
        grid: {
          color: '#333333',
        },
      },
    },
  };

  // Calculate total expense
  Object.values(data?.categoryBreakdown || {}).reduce((a: number, b: number) => a + b, 0);

  const pieChartOptions = {
    ...chartOptions,
    cutout: '60%',
    plugins: {
      ...chartOptions.plugins,
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { family: 'Inter', size: 11 },
          color: '#a0a0a0',
        },
      },
    },
    onClick: (_event: any, elements: any[]) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const category = Object.keys(data?.categoryBreakdown || {})[index];
        if (category) {
          // Navigate to expenses filtered by category
          navigate(`/expenses?category=${encodeURIComponent(category)}`);
        }
      }
    },
  };

  const formatActivityDate = (value?: string) => {
    if (!value) return '';

    const normalized = value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') : value;
    const parsed = new Date(normalized);
    if (Number.isNaN(parsed.getTime())) return value;

    return parsed.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content dashboard-page-container">

        <div className="dashboard-page-welcome">
          <h1>Financial Dashboard</h1>
          <p>Track your income, expenses, and savings with comprehensive insights and analytics.</p>
        </div>

        {/* Overspending Warning Banner */}
        {data.balance !== undefined && data.balance < 0 && (
          <div className="overspending-warning-banner">
            <div className="overspending-warning-icon">⚠</div>
            <div className="overspending-warning-content">
              <div className="overspending-warning-title">Overspending Alert</div>
              <div className="overspending-warning-message">
                You are overspending by ₹{Math.abs(data.balance).toLocaleString()}. {data.advice}
              </div>
            </div>
          </div>
        )}

        <button
          className="dashboard-view-summary-btn"
          onClick={async () => {
            try {
              const res = await paymentAPI.getPremiumStatus();
              if (res.data.isPremium) {
                window.location.href = "/premium-summary";
              } else {
                navigate('/payment-razorpay');
              }
            } catch (error) {
              navigate('/payment-razorpay');
            }
          }}
        >
          <TrendingUp size={18} />
          View Full Summary
        </button>

        <div className="dashboard-summary-section">
          <h2 className="dashboard-section-title">Financial Overview</h2>
          <p className="dashboard-section-description">Your current financial status at a glance</p>
          <div className="dashboard-summary-cards">
            <div className="dashboard-summary-card income">
              <div className="dashboard-card-icon">
                <ArrowUpRight size={24} />
              </div>
              <div className="dashboard-label">Total Income</div>
              <div className="dashboard-value income">₹{(data.totalIncome || 0).toLocaleString()}</div>
            </div>
            <div className="dashboard-summary-card expense">
              <div className="dashboard-card-icon">
                <ArrowDownRight size={24} />
              </div>
              <div className="dashboard-label">Total Expense</div>
              <div className="dashboard-value expense">₹{(data.totalExpense || 0).toLocaleString()}</div>
            </div>
            <div className="dashboard-summary-card balance">
              <div className="dashboard-card-icon">
                <Wallet size={24} />
              </div>
              <div className="dashboard-label">Current Balance</div>
              <div className="dashboard-value">₹{(data.balance || 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-charts-section">
          <h2 className="dashboard-section-title">Spending Analytics</h2>
          <p className="dashboard-section-description">Visualize your financial patterns and trends</p>
          <div className="dashboard-charts-grid">
            <div className="dashboard-chart-card">
              <h3>Monthly Comparison</h3>
              <p className="dashboard-chart-description">Income vs expenses over time</p>
              <div className="dashboard-chart-wrapper">
                <Bar data={barData} options={chartOptions}/>
              </div>
            </div>
            <div className="dashboard-chart-card">
              <h3>Category Breakdown</h3>
              <p className="dashboard-chart-description">Where your money goes each month</p>
              <div className="dashboard-chart-wrapper">
                <Pie data={pieData} options={pieChartOptions}/> 
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-activity-section">
          <div className="dashboard-section-header">
            <div>
              <h2 className="dashboard-section-title">Recent Activity</h2>
              <p className="dashboard-section-description">Live events analytics stream.</p>
            </div>
          </div>

          <div className="dashboard-activity-card">
            {activityLogs.length === 0 ? (
              <div className="empty-state">
                <p>No recent activity logs yet. Create an expense to see analytics flow.</p>
              </div>
            ) : (
              <div className="activity-list">
                {activityLogs.slice(0, 6).map((log) => (
                  <div key={log.id} className="activity-item">
                    <div>
                      <div className="activity-item-title">{log.description || 'Expense created'}</div>
                      <div className="activity-item-meta">{formatActivityDate(log.expenseDate || log.eventTime)}</div>
                    </div>
                    <div className="activity-item-values">
                      <div className="activity-item-amount">₹{log.amount?.toLocaleString()}</div>
                      <div className="activity-item-tag">{log.eventType}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}