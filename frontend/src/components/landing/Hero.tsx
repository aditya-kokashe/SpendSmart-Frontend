import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';
import dashboardPreview from '../../assets/dashboard.png';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="section-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={16} />
            <span>Manage Your Finances Smarter</span>
          </div>

          <h1 className="hero-title">
            Manage Money<br />
            <i><span>Smarter, Faster,</span></i> Better
          </h1>

          <p className="hero-subtitle">
          Track expenses, manage budgets, and visualize your financial health in one powerful dashboard.
          </p>

          <div className="hero-cta">
            <Link to="/register" className="landing-btn-primary">
              Get Started
              <ArrowRight size={20} />
            </Link>
            <a href="#features" className="landing-btn-secondary">
              Learn More
              <ArrowRight size={20} />
            </a>
          </div>
        </div>

        <div className="hero-visual">
          <img 
            src={dashboardPreview} 
            alt="SpendSmart Dashboard Preview" 
            className="hero-dashboard-img"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

