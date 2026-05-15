import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet} from 'lucide-react';

const Navbar: React.FC = () => {
  const [isMenuOpen] = React.useState(false);

  return (
    <nav className="landing-navbar">
      <div className="landing-navbar-container">
        <Link to="/" className="navbar-logo">
          <Wallet className="landing-logo-icon" />
          <span className="logo-text">SpendSmart</span>
        </Link>

        <div className={`navbar-links ${isMenuOpen ? 'open' : ''}`}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#analytics" className="nav-link">Analytics</a>
          <a href="#testimonials" className="nav-link">Testimonials</a>
        </div>

        <div className="navbar-actions">
          <Link to="/login" className="btn-login">Login</Link>
          <Link to="/register" className="btn-signup">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

