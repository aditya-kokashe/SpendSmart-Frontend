import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Wallet, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';
import '../styles/Auth.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { toasts, showToast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 8 characters with letters and numbers');
      return;
    } else {
      setPasswordError('');
    }

    setLoading(true);
    try {
      const response = await authAPI.register({ name: username, email, password });
      
      if (response.data.status === 'OTP_REQUIRED') {
        // Show OTP screen
        setShowOtpScreen(true);
        setPendingEmail(email);
        showToast(response.data.message, 'success');
      } else {
        // Direct registration (backward compatibility)
        showToast('Account created successfully!', 'success');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.verifyOtp({ email: pendingEmail, otp });
      showToast('Email verified successfully! Please login.', 'success');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Invalid OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await authAPI.resendOtp({ email: pendingEmail });
      showToast('OTP resent successfully', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to resend OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setShowOtpScreen(false);
    setOtp('');
    setPendingEmail('');
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <Link to="/" className="back-button">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
        <div className="auth-logo">
          <Wallet className="landing-logo-icon" />
          <span>SpendSmart</span>
        </div>
        
        {!showOtpScreen ? (
          <>
            <h1>Create account</h1>
            <p className="auth-subtitle">Start managing your finances smarter today</p>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${emailError ? 'input-error' : ''}`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  required
                />
                {emailError && <div className="error-message">{emailError}</div>}
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${passwordError ? 'input-error' : ''}`}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && <div className="error-message">{passwordError}</div>}
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn btn-google btn-full"
              onClick={() => {
                const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
                window.location.href = `${apiBase}/oauth2/authorization/google`;
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </>
        ) : (
          <>
            <h1>Verify Email</h1>
            <p className="auth-subtitle">Enter the 6-digit code sent to {pendingEmail}</p>
            
            <form onSubmit={handleOtpSubmit}>
              <div className="form-group">
                <label htmlFor="otp">OTP Code</label>
                <input
                  id="otp"
                  type="text"
                  className="form-input"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-full" 
                onClick={handleResendOtp}
                disabled={loading}
                style={{ marginTop: '0.5rem' }}
              >
                {loading ? 'Resending...' : 'Resend OTP'}
              </button>
              <button 
                type="button" 
                className="btn btn-link btn-full" 
                onClick={handleBackToRegister}
                style={{ marginTop: '0.5rem' }}
              >
                Back to Register
              </button>
            </form>
          </>
        )}
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
