import React, { useState, useEffect } from 'react';
import { Maximize } from 'lucide-react';
import { apiRequest } from '../utils/api';

const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchGallery();
  }, []);

  useEffect(() => {
    if (items.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
      return () => observer.disconnect();
    }
  }, [items]);

  const fetchGallery = async () => {
    const res = await apiRequest('/gallery');
    if (res.success) setItems(res.data);
    setLoading(false);
  };

  return (
    <div className="gallery-page">
      <section className="about-hero" style={{ height: '55vh', background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/collectionhero.png") center/cover no-repeat' }}>
        <div className="container center-text reveal">
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.5em', fontSize: '0.8rem', color: '#5ef0f0', fontWeight: 800 }}>Vision Spa Elite</span>
          <h1 className="serif" style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', marginTop: '0.5rem', color: 'white' }}>The Gallery</h1>
          <p className="fade-in-delayed" style={{ color: 'rgba(255,255,255,0.8)', maxWidth: '600px', margin: '1rem auto 0', fontSize: '1rem' }}>
            A curated visual journey through our most exquisite eyewear collections and the essence of luxury.
          </p>
        </div>
      </section>

      <section className="section-padding container">
        {loading ? (
          <div className="flex justify-center p-20"><div className="loader-premium"></div></div>
        ) : items.length === 0 ? (
          <div className="center-text p-20 reveal">
            <h3 className="serif text-2xl" style={{ fontSize: '2rem', color: '#111' }}>Coming Soon</h3>
            <p className="text-gray-500 mt-4">Florence is curating beautiful images for you.</p>
          </div>
        ) : (
          <div className="gallery-grid-premium">
            {items.map((item, idx) => (
              <div key={item._id} className="gallery-card-premium reveal" style={{ transitionDelay: `${(idx % 3) * 0.15}s` }}>
                <div className="gallery-image-wrapper">
                  <img src={item.image} alt={item.title} className="gallery-img-lux" />
                  <div className="gallery-overlay-lux">
                    <Maximize size={24} className="zoom-icon" />
                  </div>
                </div>
                <div className="gallery-content-lux">
                  <h4 className="serif gallery-title-lux">{item.title || "The Vision Gallery"}</h4>
                  <p className="gallery-desc-lux">{item.description || "Luxury eyewear redefined for the modern elite."}</p>
                  <div className="gallery-footer-lux">
                    <span className="gallery-date-lux">{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                    <div className="gallery-line-lux"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GalleryPage;
