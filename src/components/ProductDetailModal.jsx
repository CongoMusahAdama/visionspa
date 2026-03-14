import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ShoppingBag, MessageCircle, Instagram, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useModal } from '../context/ModalContext';
import { getFullImageUrl } from '../utils/api';

const ProductDetailModal = () => {
  const { selectedProduct, closeProduct } = useModal();
  const { addToCart, setIsCartOpen } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (selectedProduct) {
      setQty(1);
      
      // Track recently viewed
      try {
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const filtered = recentlyViewed.filter(p => (p._id || p.id) !== (selectedProduct._id || selectedProduct.id));
        const updated = [selectedProduct, ...filtered].slice(0, 5); // Keep last 5
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      } catch (e) {
        console.error('Error tracking recently viewed:', e);
      }
    }
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addToCart(selectedProduct);
    }
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      closeProduct();
      setIsCartOpen(true);
    }, 800);
  };

  const { name, price, discountPrice, discountPercentage, badge, image, comesWithPouch, sku } = selectedProduct;
  const finalDiscountPrice = discountPrice || (discountPercentage > 0 ? (price * (1 - discountPercentage / 100)).toFixed(2) : null);

  return (
    <div className="product-modal-backdrop" onClick={closeProduct}>
      <div className="product-modal-window" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={closeProduct}><X size={24} /></button>

        <div className="modal-scroll-area">
          <div className="modal-image-container">
            <img src={image} alt={name} />
            {badge && <div className="modal-badge">{badge}</div>}
          </div>

          <div className="modal-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title serif">{name}</h2>
              {sku && <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, background: '#f8fafc', padding: '4px 10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>ID: {sku}</span>}
            </div>
            <p className="modal-price">
              {finalDiscountPrice ? (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.85em', marginRight: '0.5rem' }}>GH₵{price}</span>
                  <span style={{ color: '#ef4444' }}>GH₵{finalDiscountPrice}</span>
                </>
              ) : (
                `GH₵${price}`
              )}
            </p>
            {comesWithPouch && (
              <p style={{ color: '#008080', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', marginBottom: '1rem' }}>
                <CheckCircle size={14} /> Includes Vision Spa Protective Pouch
              </p>
            )}

            <div className="modal-qty-selector">
              <span>Quantity</span>
              <div className="modal-qty-controls">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="modal-qty-btn"><Minus size={18} /></button>
                <span className="modal-qty-num">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="modal-qty-btn"><Plus size={18} /></button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className={`modal-add-btn ${justAdded ? 'success' : ''}`}
                onClick={handleAdd}
              >
                {justAdded ? <><CheckCircle size={20} /> In Your Cart!</> : <><ShoppingBag size={20} /> Add to Cart</>}
              </button>

              <div className="modal-quick-order-label" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textAlign: 'center', margin: '1rem 0 0.5rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                — Instant Order —
              </div>
              <div className="modal-social-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                {(() => {
                  const waMsg = `Hi Vision Spa! I'm interested in ordering ${qty} x ${name}${sku ? ` (ID: ${sku})` : ''} (GH₵${discountPrice || price} each).

Image: ${getFullImageUrl(image)}

Can you help me?`;
                  return (
                    <a
                      href={`https://wa.me/233552739280?text=${encodeURIComponent(waMsg)}`}
                      target="_blank" rel="noreferrer"
                      className="modal-social-btn wa"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: '#25D366', 
                        color: 'white', 
                        padding: '1rem', 
                        borderRadius: '14px', 
                        gap: '0.5rem', 
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.2)'
                      }}
                    >
                      <MessageCircle size={20} /> Quick Order via WhatsApp
                    </a>
                  );
                })()}
                <a
                  href="https://ig.me/m/the_vision_spa"
                  target="_blank" rel="noreferrer"
                  className="modal-social-btn ig"
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', 
                    color: 'white', 
                    padding: '1rem', 
                    borderRadius: '14px', 
                    gap: '0.5rem', 
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(220, 39, 67, 0.2)'
                  }}
                >
                  <Instagram size={20} /> Inquiry on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
