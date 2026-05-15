import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, Send, Code, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <>
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-box">
            <h2 className="cta-title">Take Control of Your Finances</h2>
            <p className="cta-desc">Join thousands of users who are already saving more and spending smarter with SpendSmart.</p>
            <Link to="/register" className="btn-cta">Get Started For Free</Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="section-container">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <Wallet className="landing-logo-icon" />
                <span className="logo-text">SpendSmart</span>
              </div>
              <p className="footer-tagline">
                The smarter way to manage your personal finances and reach your savings goals.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <Send size={20} color="#A0A0A0" cursor="pointer" />
                <Code size={20} color="#A0A0A0" cursor="pointer" />
                <Globe size={20} color="#A0A0A0" cursor="pointer" />
              </div>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-link-title">Product</h4>
              <a href="#features" className="footer-link">Features</a>
              <a href="#analytics" className="footer-link">Analytics</a>
              <a href="#pricing" className="footer-link">Pricing</a>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-link-title">Company</h4>
              <a href="#" className="footer-link">About Us</a>
              <a href="#" className="footer-link">Careers</a>
              <a href="#" className="footer-link">Privacy Policy</a>
            </div>

            <div className="footer-links-column">
              <h4 className="footer-link-title">Support</h4>
              <a href="#" className="footer-link">Help Center</a>
              <a href="#" className="footer-link">Contact</a>
              <a href="#" className="footer-link">API Docs</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 SpendSmart. All rights reserved.</p>
            <div className="footer-legal">
              <a href="#" className="footer-legal-link">Terms of Service</a>
              <a href="#" className="footer-legal-link">Privacy Policy</a>
            </div>
          </div>

          <div style={{ marginTop: '80px', textAlign: 'center', opacity: '0.1' }}>
            <h1 style={{ fontSize: '15vw', fontWeight: '900', letterSpacing: '-0.05em', color: '#FFF', margin: '0' }}>SpendSmart</h1>
          </div>
        </div>
      </footer>

    </>
  );
};

export default Footer;

