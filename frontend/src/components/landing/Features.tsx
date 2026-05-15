import React from 'react';
import { 
  TrendingUp, 
  Users, 
  ArrowRight
} from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: TrendingUp,
      title: 'Real-Time Conversion',
      description: 'Convert currencies instantly with live exchange rates. Get the best rates and save money on international transactions.',
      stats: '250+ Countries',
      details: 'Real-time exchange rates'
    },
    {
      icon: Users,
      title: 'Worldwide Presence',
      description: 'Join millions of users who trust SpendSmart for their financial management needs.',
      stats: '4.8/5 Rating',
      details: 'Trusted globally'
    },
    {
      icon: ArrowRight,
      title: 'Instant Transfers',
      description: 'Send money instantly to anyone, anywhere. No delays, no hassles.',
      stats: 'Transfer Success',
      details: 'Download receipt'
    }
  ];

  return (
    <section id="features" className="landing-features">
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Simple Steps to Smarter Finance</h2>
          <p className="section-subtitle">
            Master your money with our powerful features designed to give you complete financial clarity.
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrapper">
                <feature.icon className="feature-icon" />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-stats">
                <div className="feature-stat-value">{feature.stats}</div>
                <div className="feature-stat-details">{feature.details}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

