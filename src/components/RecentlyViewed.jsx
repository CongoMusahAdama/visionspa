import React, { useState, useEffect } from 'react';
import ProductCard from './home/ProductCard';

const RecentlyViewed = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadRecentlyViewed = () => {
      try {
        const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        setItems(stored);
      } catch (e) {
        console.error('Error loading recently viewed:', e);
      }
    };

    loadRecentlyViewed();
    
    // Listen for storage changes in same tab (custom event)
    const interval = setInterval(loadRecentlyViewed, 2000);
    return () => clearInterval(interval);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="recently-viewed-section reveal" style={{ padding: '4rem 0', background: '#f8fafc' }}>
      <div className="container">
        <h2 className="serif" style={{ fontSize: '2rem', marginBottom: '2rem', textAlign: 'center' }}>Recently Viewed</h2>
        <div className="product-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
          gap: '2rem' 
        }}>
          {items.map(item => (
            <ProductCard key={item._id || item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
