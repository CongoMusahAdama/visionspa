import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Quote } from 'lucide-react';
import Hero from '../components/home/Hero';
import CollectionCard from '../components/home/CollectionCard';
import ProductCard from '../components/home/ProductCard';

const HomePage = ({ products = [], categories = [] }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categoryTabs = [
    { id: 'all', label: 'All Collections' },
    ...categories.map(c => typeof c === 'object' ? c : { id: c.toLowerCase(), label: c })
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('active'));
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory]);

  const filteredFeatured = products
    .filter(product => {
      const isSoldOut = product.status === 'Sold Out' || product.stock === 0 || !!product.soldOutAt;
      if (isSoldOut && product.soldOutAt) {
        const soldDate = new Date(product.soldOutAt);
        const daysSoldOut = (new Date() - soldDate) / (1000 * 60 * 60 * 24);
        if (daysSoldOut > 3) return false;
      }
      if (activeCategory !== 'all' && product.category?.toLowerCase() !== activeCategory.toLowerCase()) return false;
      const img = product.image || '';
      if (img.startsWith('blob:')) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 16);

  return (
    <div className="home-page">
      <Hero />
      <section id="collections" className="section-padding container">
        <div className="flex justify-between items-end mb-8">
          <div className="reveal">
            <span className="text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>Luxury Selection</span>
            <h2 className="serif" style={{ fontSize: '3rem', marginTop: '0.5rem' }}>Curated Collections</h2>
          </div>
          <Link to="/shop" className="nav-link reveal" style={{ marginBottom: '1rem' }}>Explore Collection</Link>
        </div>
        <div className="collection-grid">
          <CollectionCard
            title="Women’s Elite"
            image="/women_elite.png"
            link="/shop"
          />
          <CollectionCard
            title="Men’s Standard"
            image="/men.png"
            link="/shop"
          />
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <div className="center-text reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>Elite Products</span>
            <h2 className="serif" style={{ fontSize: '3rem', marginTop: '0.5rem' }}>Featured Eyewear</h2>
            <p className="reveal" style={{ 
              fontSize: '0.9rem', 
              color: '#008080', 
              fontWeight: 800, 
              marginTop: '1.5rem', 
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              animation: 'subtlePulse 3s infinite ease-in-out'
            }}>
              New Luxury Goods Arriving Soon
            </p>
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes subtlePulse {
                0%, 100% { opacity: 0.6; transform: scale(0.98); }
                50% { opacity: 1; transform: scale(1); }
              }
            `}} />

            <div className="flex justify-center gap-8 mt-8">
              {categoryTabs.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    cursor: 'pointer',
                    color: activeCategory === cat.id ? 'var(--teal-primary)' : '#999',
                    position: 'relative',
                    paddingBottom: '8px',
                    transition: '0.3s'
                  }}
                >
                  {cat.label}
                  {activeCategory === cat.id && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '25%',
                      width: '50%',
                      height: '2px',
                      background: 'var(--teal-primary)'
                    }}></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="product-grid">
            {filteredFeatured.map(product => (
              <ProductCard key={product._id || product.id} {...product} />
            ))}
          </div>
          <div className="flex justify-center" style={{ marginTop: '5rem' }}>
            <Link to="/shop" className="cta-button-premium reveal">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      <section className="section-padding container">
        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div className="reveal" style={{ padding: '2rem', border: '1px solid #eee' }}>
            <img src="/hero.png" alt="Elite Craftsmanship" style={{ width: '100%', height: '500px', objectFit: 'cover' }} />
          </div>
          <div className="reveal">
            <h2 className="serif" style={{ fontSize: '3.5rem', marginBottom: '2rem' }}>Define Your Vision With African Excellence.</h2>
            <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2.5rem' }}>
              At Vision Spa, we believe that high-end eyewear is more than just a tool for sight—it's a statement of identity. Our curated collections are designed for those who demand precision, luxury, and cultural resonance.
            </p>
            <button className="cta-button">Learn Our Story</button>
          </div>
        </div>
      </section>

      <section className="testimonial-section">
        <div className="container">
          <div className="center-text reveal" style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>Testimonials</span>
            <h2 className="serif" style={{ fontSize: '3.5rem', marginTop: '0.5rem' }}>Voices of Vision</h2>
          </div>

          <div className="testimonial-grid">
            <div className="testimonial-card reveal">
              <Quote className="text-teal" size={40} strokeWidth={1} style={{ marginBottom: '2rem', opacity: 0.8 }} />
              <p className="testimonial-text">"The most exquisite eyewear collection I've ever seen. The attention to detail and African craftsmanship is truly world-class. Vision Spa is where precision meets prestige."</p>
              <div className="testimonial-author">
                <strong>Ama Serwaa</strong>
                <span>Executive Director</span>
              </div>
            </div>

            <div className="testimonial-card reveal" style={{ transitionDelay: '0.2s' }}>
              <Quote className="text-teal" size={40} strokeWidth={1} style={{ marginBottom: '2rem', opacity: 0.8 }} />
              <p className="testimonial-text">"Vision Spa transformed how I view myself. The cultural resonance in their designs is unmatched. I don't just see better; I look more like who I'm meant to be."</p>
              <div className="testimonial-author">
                <strong>Kofi Mensah</strong>
                <span>Lead Architect</span>
              </div>
            </div>

            <div className="testimonial-card reveal" style={{ transitionDelay: '0.4s' }}>
              <Quote className="text-teal" size={40} strokeWidth={1} style={{ marginBottom: '2rem', opacity: 0.8 }} />
              <p className="testimonial-text">"Exceptional service. They didn't just sell me glasses; they helped me define my identity. Every visit to Vision Spa feels like a curated luxury experience."</p>
              <div className="testimonial-author">
                <strong>Sarah Baidoo</strong>
                <span>Fashion Designer</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
