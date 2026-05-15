import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { summaryAPI, incomeAPI, expenseAPI, paymentAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';
import '../styles/PremiumSummary.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
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
  expenses?: any[];
}

export default function PremiumSummary() {
  const [data, setData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [premiumChecked, setPremiumChecked] = useState(false);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    if (!premiumChecked) {
      checkPremium();
      setPremiumChecked(true);
    }
  }, [premiumChecked]);

  const checkPremium = async () => {
    try {
      const res = await paymentAPI.getPremiumStatus();
      
      // Temporarily disabled to debug redirect loop
      // if (!res.data.isPremium) {
      //   window.location.href = "/payment-razorpay";
      // }
      console.log('Premium status:', res.data.isPremium);
    } catch (error) {
      console.error('Error checking premium status:', error);
      // Don't redirect on error to prevent infinite loops
    }
  };

  const handleCancel = async () => {
    await paymentAPI.cancelPremium();
    window.location.href = "/payment-razorpay";
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const [summaryResponse, incomesResponse, expensesResponse] = await Promise.all([
        summaryAPI.get(),
        incomeAPI.getAll(),
        expenseAPI.getAll(),
      ]);

      const summaryData = summaryResponse.data;
      const incomes = incomesResponse.data || [];
      const expenses = expensesResponse.data || [];

      // Calculate totals from actual data
      const totalIncome = incomes.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
      const totalExpense = expenses.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);

      // Calculate category breakdown
      const categoryBreakdown: Record<string, number> = {};
      expenses.forEach((expense: any) => {
        const category = expense.categoryName || 'Uncategorized';
        categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (expense.amount || 0);
      });

      // Calculate monthly comparison
      const monthlyMap: Record<string, { income: number; expense: number }> = {};
      incomes.forEach((income: any) => {
        const month = new Date(income.date).toLocaleString('default', { month: 'short' });
        if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
        monthlyMap[month].income += income.amount || 0;
      });
      expenses.forEach((expense: any) => {
        const month = new Date(expense.date).toLocaleString('default', { month: 'short' });
        if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
        monthlyMap[month].expense += expense.amount || 0;
      });

      const monthlyComparison = Object.entries(monthlyMap).map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
      }));

      setData({
        totalIncome: totalIncome || summaryData.totalIncome || 0,
        totalExpense: totalExpense || summaryData.totalExpense || 0,
        balance: (totalIncome - totalExpense) || summaryData.balance || 0,
        categoryBreakdown: Object.keys(summaryData?.categoryBreakdown || {}).length > 0 ? summaryData.categoryBreakdown : categoryBreakdown,
        monthlyComparison: (summaryData?.monthlyComparison?.length || 0) > 0 ? summaryData.monthlyComparison : monthlyComparison,
        monthlySpending: summaryData.monthlySpending || 0,
        topCategory: summaryData.topCategory || 'None',
        overspendingAmount: summaryData.overspendingAmount || 0,
        advice: summaryData.advice || 'You are within budget. Keep it up!',
        expenses: expenses || [],
      });
    } catch (error: any) {
      console.error('Failed to load summary data:', error);
      showToast('Failed to load summary data', 'error');
      setData({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        categoryBreakdown: {},
        monthlyComparison: [],
        expenses: [],
      });
    } finally {
      setLoading(false);
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

  // ---- Premium Financial Insights ----
  const totalIncome = data?.totalIncome || 0;
  const totalExpense = data?.totalExpense || 0;
  const balance = data?.balance || 0;
  const categoryBreakdown = data?.categoryBreakdown || {};
  const monthlyComparison = data?.monthlyComparison || [];
  const topCategory = data?.topCategory || 'None';

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;
  const topCategoryAmount = Object.entries(categoryBreakdown).find(([k]) => k === topCategory)?.[1] || 0;
  const topCategoryPercent = totalExpense > 0 ? (topCategoryAmount / totalExpense) * 100 : 0;

  const latestMonth = monthlyComparison[monthlyComparison.length - 1];
  const prevMonth = monthlyComparison.length > 1 ? monthlyComparison[monthlyComparison.length - 2] : null;
  const monthTrend = latestMonth && prevMonth
    ? ((latestMonth.expense - prevMonth.expense) / (prevMonth.expense || 1)) * 100
    : 0;

  const advicePoints: { label: string; value: string; detail: string; type: 'good' | 'warning' | 'danger' | 'neutral' }[] = [];

  // 1. Overall Health
  if (balance >= 0) {
    advicePoints.push({
      label: 'Financial Health',
      value: 'Healthy',
      detail: `You have a surplus of ₹${balance.toLocaleString()}. Your income comfortably covers expenses.`,
      type: 'good',
    });
  } else {
    advicePoints.push({
      label: 'Financial Health',
      value: 'Needs Attention',
      detail: `You are overspending by ₹${Math.abs(balance).toLocaleString()}. Expenses exceed income by ${expenseRatio.toFixed(1)}%.`,
      type: 'danger',
    });
  }

  // 2. Savings Rate
  if (savingsRate >= 20) {
    advicePoints.push({
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      detail: 'Excellent! You are saving more than 20% of your income. Keep building your emergency fund.',
      type: 'good',
    });
  } else if (savingsRate >= 10) {
    advicePoints.push({
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      detail: 'Good start. Aim to increase savings to 20% for better financial security.',
      type: 'neutral',
    });
  } else if (savingsRate > 0) {
    advicePoints.push({
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      detail: 'Your savings are low. Try to cut discretionary spending to build a safety net.',
      type: 'warning',
    });
  } else {
    advicePoints.push({
      label: 'Savings Rate',
      value: `${savingsRate.toFixed(1)}%`,
      detail: 'You are spending more than you earn. Immediate budget review recommended.',
      type: 'danger',
    });
  }

  // 3. Top Category
  if (topCategory !== 'None' && topCategoryPercent > 0) {
    advicePoints.push({
      label: 'Top Spending',
      value: topCategory,
      detail: `${topCategoryPercent.toFixed(1)}% of total expenses (₹${topCategoryAmount.toLocaleString()}). ${topCategoryPercent > 40 ? 'This category dominates your spending.' : 'Reasonably distributed across categories.'}`,
      type: topCategoryPercent > 50 ? 'warning' : 'neutral',
    });
  }

  // 4. Monthly Trend
  if (monthlyComparison.length > 1) {
    const trendLabel = monthTrend > 0 ? '↑ Increasing' : monthTrend < 0 ? '↓ Decreasing' : '→ Stable';
    advicePoints.push({
      label: 'Spending Trend',
      value: trendLabel,
      detail: `Last month vs previous: ${Math.abs(monthTrend).toFixed(1)}% ${monthTrend > 0 ? 'increase' : 'decrease'}. ${monthTrend > 10 ? 'Watch out — spending is rising fast.' : monthTrend < -5 ? 'Great job controlling expenses!' : 'Spending is fairly stable.'}`,
      type: monthTrend > 15 ? 'danger' : monthTrend > 5 ? 'warning' : monthTrend < -5 ? 'good' : 'neutral',
    });
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
          ? ['#6c63ff', '#34c759', '#ff9500', '#ff3b30', '#5856d6', '#007aff']
          : ['#333333'],
        borderWidth: 0,
      },
    ],
  };

  // Expense Timeline — all individual expenses plotted by date
  const sortedExpenses = (data?.expenses || [])
    .filter((e: any) => e.date && e.amount)
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const expenseTimelineLabels = sortedExpenses.map((e: any) => {
    const d = new Date(e.date);
    return `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
  });

  const expenseTimelineData = {
    labels: expenseTimelineLabels.length > 0 ? expenseTimelineLabels : ['No Data'],
    datasets: [
      {
        label: 'Individual Expenses',
        data: sortedExpenses.length > 0 ? sortedExpenses.map((e: any) => e.amount) : [0],
        borderColor: '#ff4444',
        backgroundColor: 'rgba(255, 68, 68, 0.15)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: sortedExpenses.map((e: any) => {
          const amt = e.amount || 0;
          const avg = sortedExpenses.length > 0
            ? sortedExpenses.reduce((s: number, ex: any) => s + (ex.amount || 0), 0) / sortedExpenses.length
            : 0;
          return amt > avg * 1.5 ? '#ff4444' : amt > avg * 0.8 ? '#ff9500' : '#34c759';
        }),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: sortedExpenses.map((e: any) => {
          const amt = e.amount || 0;
          const max = Math.max(...sortedExpenses.map((ex: any) => ex.amount || 0), 1);
          return 4 + (amt / max) * 6;
        }),
        pointHoverRadius: 10,
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

  const timelineOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const idx = context.dataIndex;
            const exp = sortedExpenses[idx];
            if (!exp) return '';
            const cat = exp.categoryName || exp.category || 'Uncategorized';
            return [`Amount: ₹${(exp.amount || 0).toLocaleString()}`, `Category: ${cat}`, `Date: ${exp.date}`];
          },
        },
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        titleColor: '#ffffff',
        bodyColor: '#a0a0a0',
        padding: 12,
      },
    },
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">

        <div className="premium-summary-container">
          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <button onClick={handleCancel} style={{
              backgroundColor: '#ff3b30',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              Cancel Premium
            </button>
          </div>

          {/* ===== SECTION 1: FINANCIAL OVERVIEW & HEALTH ===== */}
          <div className="premium-section-divider">
            <h2 className="premium-section-title">Financial Overview & Health</h2>
            
            {/* Financial Overview Cards */}
            <div className="premium-summary-cards">
              <div className="premium-summary-card">
                <div className="premium-label">Total Income</div>
                <div className="premium-value income">₹{(data?.totalIncome || 0).toLocaleString()}</div>
              </div>
              <div className="premium-summary-card">
                <div className="premium-label">Total Expense</div>
                <div className="premium-value expense">₹{(data?.totalExpense || 0).toLocaleString()}</div>
              </div>
              <div className="premium-summary-card">
                <div className="premium-label">Current Balance</div>
                <div className="premium-value">₹{(data?.balance || 0).toLocaleString()}</div>
              </div>
            </div>

            {/* Financial Health Advisory */}
            {advicePoints[0] && (
              <div className="premium-documentation-section">
                <h4 className="premium-documentation-heading">{advicePoints[0].label}</h4>
                <div className="premium-documentation-content">
                  <span className={`premium-documentation-status ${advicePoints[0].type}`}>{advicePoints[0].value}</span>
                  <p className="premium-documentation-text">{advicePoints[0].detail}</p>
                </div>
              </div>
            )}
          </div>

          {/* ===== SECTION 2: FINANCIAL INSIGHTS & ANALYSIS ===== */}
          <div className="premium-section-divider">
            <h2 className="premium-section-title">Financial Insights & Analysis</h2>
            
            {/* Financial Insights Grid */}
            <div className="premium-insights-grid">
              <div className="premium-insight-card">
                <div className="premium-insight-label">Monthly Spending</div>
                <div className="premium-insight-value">₹{(data?.monthlySpending || 0).toLocaleString()}</div>
              </div>
              <div className="premium-insight-card">
                <div className="premium-insight-label">Top Category</div>
                <div className="premium-insight-value">{data?.topCategory || 'None'}</div>
              </div>
              <div className="premium-insight-card">
                <div className="premium-insight-label">Overspending</div>
                <div className="premium-insight-value expense">
                  {data?.overspendingAmount && data?.overspendingAmount > 0
                    ? `₹${data?.overspendingAmount.toLocaleString()}`
                    : '₹0'}
                </div>
              </div>
            </div>

            {/* Savings Analysis */}
            {advicePoints[1] && (
              <div className="premium-documentation-section">
                <h4 className="premium-documentation-heading">{advicePoints[1].label}</h4>
                <div className="premium-documentation-content">
                  <span className={`premium-documentation-status ${advicePoints[1].type}`}>{advicePoints[1].value}</span>
                  <p className="premium-documentation-text">{advicePoints[1].detail}</p>
                </div>
              </div>
            )}

            {/* Spending Charts */}
            <div className="premium-charts-grid">
              <div className="premium-chart-card">
                <h3>Income vs Expense</h3>
                <div className="premium-chart-wrapper">
                  <Bar data={barData} options={chartOptions} />
                </div>
              </div>
              <div className="premium-chart-card">
                <h3>Expense Breakdown</h3>
                <div className="premium-chart-wrapper">
                  <Pie data={pieData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* ===== SECTION 3: CATEGORY & TIMELINE ANALYSIS ===== */}
          <div className="premium-section-divider">
            <h2 className="premium-section-title">Category & Timeline Analysis</h2>
            
            {/* Category Analysis */}
            {advicePoints[2] && (
              <div className="premium-documentation-section">
                <h4 className="premium-documentation-heading">{advicePoints[2].label}</h4>
                <div className="premium-documentation-content">
                  <span className={`premium-documentation-status ${advicePoints[2].type}`}>{advicePoints[2].value}</span>
                  <p className="premium-documentation-text">{advicePoints[2].detail}</p>
                </div>
              </div>
            )}

            {/* Spending Trend Analysis */}
            {advicePoints[3] && (
              <div className="premium-documentation-section">
                <h4 className="premium-documentation-heading">{advicePoints[3].label}</h4>
                <div className="premium-documentation-content">
                  <span className={`premium-documentation-status ${advicePoints[3].type}`}>{advicePoints[3].value}</span>
                  <p className="premium-documentation-text">{advicePoints[3].detail}</p>
                </div>
              </div>
            )}
          </div>

          {/* ===== SECTION 4: EXPENSE GRAPHS & TIMELINE ===== */}
          <div className="premium-section-divider">
            <h2 className="premium-section-title">Expense Graphs & Timeline</h2>
            
            {/* Expense Timeline Chart */}
            <div className="premium-chart-card full-width">
              <h3>Expense Timeline — All Transactions</h3>
              <div className="premium-chart-wrapper">
                <Line data={expenseTimelineData} options={timelineOptions} />
              </div>
            </div>
            
          </div>
        </div>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}