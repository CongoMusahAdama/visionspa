import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const CollectionsPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('active'));
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="collections-page">
      <section className="collections-hero">
        <div className="collections-hero-bg"></div>
        <div className="container center-text reveal">
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.5em', fontSize: '0.9rem' }}>Vision Spa</span>
          <h1 className="serif" style={{ fontSize: '5rem', marginTop: '1rem' }}>Our Collections</h1>
        </div>
      </section>

      <section className="section-padding container">
        <div className="flex justify-between items-end reveal" style={{ marginBottom: '4rem' }}>
          <div style={{ maxWidth: '600px' }}>
            <h2 className="serif" style={{ fontSize: '3.5rem' }}>The Art of Vision</h2>
            <p style={{ marginTop: '1.5rem', color: '#666', fontSize: '1.1rem', lineHeight: '1.8' }}>
              Explore our curated selection of high-end eyewear, where each collection tells a unique story of craftsmanship, elegance, and cultural heritage.
            </p>
          </div>
        </div>

        <div className="collections-main-grid">
          <div className="large-collection-card reveal">
            <img src="/women_elite.png" alt="Women's Elite Collection" />
            <div className="hero-overlay" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}></div>
            <div className="collection-overlay-content">
              <span className="collection-type">Editorial</span>
              <h3 className="serif" style={{ fontSize: '3rem' }}>Women’s Elite</h3>
              <p style={{ margin: '1rem 0 2rem', opacity: 0.8 }}>Graceful lines and timeless elegance for the modern woman.</p>
              <Link to="/shop" className="cta-button" style={{ display: 'inline-block' }}>Explore Collection</Link>
            </div>
          </div>

          <div className="large-collection-card reveal">
            <img src="/men.png" alt="Men's Standard Collection" />
            <div className="hero-overlay" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}></div>
            <div className="collection-overlay-content">
              <span className="collection-type">Classic</span>
              <h3 className="serif" style={{ fontSize: '3rem' }}>Men’s Standard</h3>
              <p style={{ margin: '1rem 0 2rem', opacity: 0.8 }}>Precision-engineered frames defined by strength and character.</p>
              <Link to="/shop" className="cta-button" style={{ display: 'inline-block' }}>Explore Collection</Link>
            </div>
          </div>

          <div className="large-collection-card reveal" style={{ gridColumn: 'span 2', height: '600px' }}>
            <img src="/hero1.png" alt="Luxuries Fashion Collection" />
            <div className="hero-overlay" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}></div>
            <div className="collection-overlay-content" style={{ maxWidth: '600px' }}>
              <span className="collection-type">Premium Selection</span>
              <h3 className="serif" style={{ fontSize: '3.5rem' }}>Luxury Fashion</h3>
              <p style={{ margin: '1rem 0 2rem', opacity: 0.8 }}>Our most exclusive collection, featuring avant-garde designs and unparalleled artisanal quality.</p>
              <Link to="/shop" className="cta-button-premium">Explore Collection</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CollectionsPage;
