import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);

      //Extract user info from JWT token
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);
        const email = decoded.sub;
        const name = decoded.name;
        const role = decoded.role || 'USER';
        if (email) {
          localStorage.setItem('userEmail', email);
        }
        if (name) {
          localStorage.setItem('userName', name);
        }
        localStorage.setItem('userRole', role);
      } catch (error) {
        console.error('Failed to decode token:', error);
      }

      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="loader-container">
          <div className="loader" />
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
          Signing you in...
        </p>
      </div>
    </div>
  );
}
