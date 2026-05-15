import { paymentAPI } from '../services/api';
import Sidebar from '../components/Sidebar';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';
import { Lock, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import '../styles/PaymentRazorpay.css';

export default function PaymentRazorpay() {
  const { toasts, showToast } = useToast();

  const handleUnlock = async () => {
    try {
      const response = await paymentAPI.createOrder();
      const { orderId, amount, currency } = response.data;

      const options = {
        key: 'rzp_test_ShPOygkf7zPBfF',
        amount: amount,
        currency: currency,
        name: 'SpendSmart',
        description: 'Unlock Premium Summary',
        order_id: orderId,
        handler: async function (response: any) {
          console.log("Payment success");

          const verifyRes = await paymentAPI.verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature
          });

          console.log("Verify response:", verifyRes);

          // 🔥 IMPORTANT: wait for backend update
          setTimeout(() => {
            window.location.href = "/premium-summary";
          }, 500);
        },
        prefill: {
          name: '',
          email: localStorage.getItem('userEmail') || '',
          contact: '',
        },
        theme: {
          color: '#6c63ff',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Failed to create order:', error);
      showToast('Failed to initiate payment', 'error');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="payment-razorpay-container">
          <div className="payment-razorpay-lock-screen">
            <div className="payment-razorpay-lock-card">
              <div className="payment-razorpay-lock-icon">
                <Lock size={64} />
              </div>
              <h2>Unlock Full Summary</h2>
              <p className="payment-razorpay-lock-description">
                Get access to advanced analytics and insights
              </p>
              <div className="payment-razorpay-features">
                <div className="payment-razorpay-feature">
                  <TrendingUp size={24} />
                  <span>Advanced analytics</span>
                </div>
                <div className="payment-razorpay-feature">
                  <PieChart size={24} />
                  <span>Category insights</span>
                </div>
                <div className="payment-razorpay-feature">
                  <BarChart3 size={24} />
                  <span>Monthly trends</span>
                </div>
              </div>
              <button className="payment-razorpay-unlock-btn" onClick={handleUnlock}>
                Unlock for ₹20
              </button>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
