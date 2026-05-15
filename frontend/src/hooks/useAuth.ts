import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '../contexts/PremiumContext';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => !!localStorage.getItem('token')
  );
  const [userEmail, setUserEmail] = useState<string>(
    () => localStorage.getItem('userEmail') || ''
  );
  const [userName, setUserName] = useState<string>(
    () => localStorage.getItem('userName') || ''
  );
  const [userRole, setUserRole] = useState<string>(
    () => localStorage.getItem('userRole') || 'USER'
  );
  const navigate = useNavigate();
  const { refreshPremiumStatus } = usePremium();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail') || '';
    const name = localStorage.getItem('userName') || '';
    const role = localStorage.getItem('userRole') || 'USER';
    setIsAuthenticated(!!token);
    setUserEmail(email);
    setUserName(name);
    setUserRole(role);
  }, []);

  const login = useCallback(
    async (token: string, email: string, name: string, role: string = 'USER') => {
      localStorage.setItem('token', token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userName', name);
      localStorage.setItem('userRole', role);
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserName(name);
      setUserRole(role);
      
      // Refresh premium status after login
      await refreshPremiumStatus();
      
      // Small delay to ensure state updates before navigation
      setTimeout(() => {
        navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
      }, 100);
    },
    [navigate, refreshPremiumStatus]
  );

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUserEmail('');
    setUserName('');
    setUserRole('USER');
    navigate('/login');
  }, [navigate]);

  const isAdmin = userRole === 'ADMIN';

  return { isAuthenticated, userEmail, userName, userRole, isAdmin, login, logout };
}
