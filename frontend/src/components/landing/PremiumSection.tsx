import React from 'react';
import { Star } from 'lucide-react';

const PremiumSection: React.FC = () => {
  

  const testimonials = [
    {
      text: "SpendSmart has completely changed how I look at my money. The insights are incredible!",
      author: "Alex Johnson",
      role: "Financial Analyst"
    },
    {
      text: "The best finance app I've ever used. Clean, fast, and the AI predictions are spot on.",
      author: "Sarah Chen",
      role: "Entrepreneur"
    },
    {
      text: "Finally, a tracker that actually helps me save instead of just listing my expenses.",
      author: "Michael Ross",
      role: "Software Engineer"
    }
  ];

  return (
    <section id="pricing" className="premium-section">
      <div className="section-container">

        <div id="testimonials" className="testimonials">
          <div className="section-header">
            <h2 className="section-title">Success Stories From Our Users</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, index) => (
              <div key={index} className="testimonial-card">
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#F58220" color="#F58220" />)}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author-wrapper">
                  <div className="author-avatar"></div>
                  <div className="author-info">
                    <h4>{t.author}</h4>
                    <p>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PremiumSection;

