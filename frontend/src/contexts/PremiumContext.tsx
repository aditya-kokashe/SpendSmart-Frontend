import React, { createContext, useContext, useState, useEffect } from 'react';
import { paymentAPI } from '../services/api';

interface PremiumContextType {
  isPremium: boolean;
  loading: boolean;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPremiumStatus = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsPremium(false);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const res = await paymentAPI.getPremiumStatus();
      setIsPremium(res.data.isPremium);
    } catch (error) {
      console.error('Failed to check premium status:', error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshPremiumStatus = async () => {
    await checkPremiumStatus();
  };

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, loading, refreshPremiumStatus }}>
      {children}
    </PremiumContext.Provider>
  );
};
