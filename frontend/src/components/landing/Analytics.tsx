import React from 'react';
import { Shield, MousePointer2, LayoutDashboard } from 'lucide-react';
import budgetImage from '../../assets/budget.png';

const Analytics: React.FC = () => {
  return (
    <section id="analytics" className="analytics">
      <div className="section-container">
        
        {/* Feature Block 2 */}
        <div className="analytics-content-block">
          <div className="analytics-visual">
            <img 
              src={budgetImage} 
              alt="Budget Control Visual" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
            />
          </div>
          <div className="analytics-text-wrapper">
            <p className="analytics-title-small">Budget Control</p>
            <h2 className="analytics-heading">Set and Monitor 
              Your Budgets</h2>
            <p className="analytics-description">
              Create custom budgets for different categories and get real-time alerts when you're approaching your limits. Take control of your spending before it gets out of hand.
            </p>
            <a href="/register" className="analytics-btn">Get Started</a>
          </div>
        </div>

        {/* 4-Grid Section */}
        <div className="how-it-works">
          <div className="section-header">
            <h2 className="section-title">Manage Your Finances Smarter</h2>
            <p className="section-subtitle">Powerful tools designed to help you reach your financial goals faster.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card" style={{ padding: '32px' }}>
              <div className="feature-icon-wrapper" style={{ width: '48px', height: '48px', marginBottom: '20px' }}>
                <MousePointer2 size={24} className="feature-icon" />
              </div>
              <h3 className="feature-title" style={{ fontSize: '20px' }}>Easy Tracking</h3>
              <p className="feature-description">One-click expense logging for busy people.</p>
            </div>
            <div className="feature-card" style={{ padding: '32px' }}>
              <div className="feature-icon-wrapper" style={{ width: '48px', height: '48px', marginBottom: '20px' }}>
                <Shield size={24} className="feature-icon" />
              </div>
              <h3 className="feature-title" style={{ fontSize: '20px' }}>Bank-Grade Security</h3>
              <p className="feature-description">Your data is encrypted and protected at all times.</p>
            </div>
            <div className="feature-card" style={{ padding: '32px' }}>
              <div className="feature-icon-wrapper" style={{ width: '48px', height: '48px', marginBottom: '20px' }}>
                <LayoutDashboard size={24} className="feature-icon" />
              </div>
              <h3 className="feature-title" style={{ fontSize: '20px' }}>Smart Dashboard</h3>
              <p className="feature-description">Everything you need in one clean view.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Analytics;

