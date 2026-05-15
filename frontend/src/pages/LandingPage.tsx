import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import Analytics from '../components/landing/Analytics';
import PremiumSection from '../components/landing/PremiumSection';
import Footer from '../components/landing/Footer';
import '../styles/LandingPage.css';

const LandingPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="landing-page">
        <Hero />
        <Features />
        <Analytics />
        <PremiumSection />
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;

