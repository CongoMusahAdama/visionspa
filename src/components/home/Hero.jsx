import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-bg-accent hero-bg-accent-1"></div>
      <div className="hero-bg-accent hero-bg-accent-2"></div>

      <img src="/hero1.png" alt="Vision Spa Elite Eyewear" className="hero-image" />
      <div className="hero-overlay"></div>

      <div className="hero-content-wrapper">
        <div className="hero-content">
          <span className="hero-tagline fade-in">Curated Luxury Experience</span>
          <h1 className="hero-slogan serif fade-in-delayed">
            Everything looks beautiful from a distance with <span className="text-teal-italic">enhanced vision.</span>
          </h1>
          <div className="hero-actions fade-in-delayed-more">
            <Link to="/shop" className="cta-button-premium">
              <span>Browse The Collection</span>
              <ArrowRight size={18} />
            </Link>
            <Link to="/shop" className="hero-secondary-link">Shop Now</Link>
          </div>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <span>Scroll to explore</span>
      </div>
    </section>
  );
};

export default Hero;
