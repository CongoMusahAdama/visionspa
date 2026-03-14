import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle, CheckCircle, PackageX } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useModal } from '../../context/ModalContext';
import { getFullImageUrl } from '../../utils/api';

const ProductCard = ({ id, _id, name, price, discountPrice, badge, image, status, stock, soldOutAt, comesWithPouch, sku }) => {
  const resolvedId = _id || id;
  const isSoldOut = status === 'Sold Out' || stock === 0 || !!soldOutAt;
  const { cartItems, addToCart } = useCart();
  const { openProduct } = useModal();
  const cartItem = cartItems.find(i => (i.id || i._id) === resolvedId);
  const inCart = !!cartItem;
  const resolvedImage = image && !image.startsWith('blob:') ? image : '/midnight.png';
  const currentPrice = discountPrice || price;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (e) => {
    if (isMobile || window.innerWidth <= 767) {
      if (!isSoldOut) openProduct({ id: resolvedId, _id: resolvedId, name, price, discountPrice, badge, image: resolvedImage, comesWithPouch, sku });
    }
  };

  return (
    <div className="product-card reveal" onClick={handleClick} style={{ opacity: isSoldOut ? 0.6 : 1, filter: isSoldOut ? 'grayscale(100%)' : 'none' }}>
      <div className="product-image-container">
        {isSoldOut ? (
          <div className="product-badge" style={{ backgroundColor: '#ef4444', color: '#fff', zIndex: 10, padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 800 }}>SOLD OUT</div>
        ) : (
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '5px', zIndex: 5 }}>
            {badge && <div className="product-badge" style={{ position: 'relative', top: 0, left: 0 }}>{badge}</div>}
            {comesWithPouch && <div className="product-badge" style={{ backgroundColor: '#008080', position: 'relative', top: 0, left: 0 }}>WITH POUCH</div>}
            {discountPrice && <div className="product-badge" style={{ backgroundColor: '#ef4444', position: 'relative', top: 0, left: 0 }}>SALE</div>}
          </div>
        )}
        {!isMobile && (
          <div className="product-price-badge" style={{ backgroundColor: discountPrice ? '#ef4444' : '#fff', color: discountPrice ? '#fff' : '#1e293b' }}>
            <span>GH₵{currentPrice}</span>
          </div>
        )}
        {inCart && (
          <div className="product-in-cart-badge">
            <CheckCircle size={14} />
            <span>In Cart</span>
          </div>
        )}
        <img src={resolvedImage} alt={name} className="product-main-image" />
        <img src={resolvedImage} alt={name} className="product-hover-image" style={{ filter: 'brightness(0.95)' }} />
      </div>
      <div className="product-details">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 className="product-name" style={{ flex: 1 }}>{name}</h4>
          {sku && (
            <span style={{
              fontSize: '0.65rem',
              color: '#94a3b8',
              background: '#f8fafc',
              padding: '2px 6px',
              borderRadius: '6px',
              fontWeight: 700,
              marginLeft: '8px',
              border: '1px solid #f1f5f9'
            }}>#{sku}</span>
          )}
        </div>
        {comesWithPouch && (
          <p style={{ fontSize: '0.7rem', color: '#008080', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.25rem' }}>
            <CheckCircle size={12} /> Includes Pouch
          </p>
        )}

        {isMobile && <p className="product-mobile-subtitle">{sku && <span style={{ fontWeight: 800, color: '#008080' }}>ID: {sku} • </span>}{badge || "VISION SPA EXCLUSIVE"}</p>}

        {!isMobile && (
          <div className="product-desktop-actions">
            <p className="product-price" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {discountPrice && <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.85em' }}>GH₵{price}</span>}
              <span style={{ color: discountPrice ? '#ef4444' : 'inherit' }}>GH₵{currentPrice}</span>
            </p>
            <button
              className="add-to-cart-btn"
              disabled={isSoldOut}
              style={{ cursor: isSoldOut ? 'not-allowed' : 'pointer', opacity: isSoldOut ? 0.6 : 1 }}
              onClick={(e) => { e.stopPropagation(); if (!isSoldOut) addToCart({ id: resolvedId, _id: resolvedId, name, price: currentPrice, badge, image: resolvedImage, sku }); }}>
              <Plus size={16} /> {isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
            <div className="product-social-buy">
              {isSoldOut ? (
                <span className="direct-wa-button" style={{ opacity: 0.5, cursor: 'not-allowed', background: '#e2e8f0', color: '#94a3b8' }}>
                  Currently Unavailable
                </span>
              ) : (() => {
                const waMsg = `Hi Vision Spa! I'm interested in ordering ${name}${sku ? ` (ID: ${sku})` : ''}.

Image: ${getFullImageUrl(resolvedImage)}

Can you help me?`;
                return (
                  <a
                    href={`https://wa.me/233552739280?text=${encodeURIComponent(waMsg)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="direct-wa-button"
                  >
                    Direct WhatsApp Order
                  </a>
                );
              })()}
            </div>
          </div>
        )}

        {isMobile && (
          <div className="product-mobile-actions-wrapper">
            <div className="mobile-buy-info">
              {isSoldOut ? (
                <span className="direct-buy-msg" style={{ color: '#ef4444' }}>
                  <PackageX size={10} style={{ marginRight: '4px' }} />
                  Currently Out of Stock
                </span>
              ) : (
                <span className="direct-buy-msg">
                  <MessageCircle size={10} style={{ marginRight: '4px' }} />
                  Order direct on WhatsApp & IG
                </span>
              )}
            </div>
            <div className="product-mobile-actions">
              <span className="mobile-price">
                {discountPrice && <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.85em', marginRight: '4px' }}>GH₵{price}</span>}
                <span style={{ color: discountPrice ? '#ef4444' : 'inherit' }}>GH₵{currentPrice}</span>
              </span>
              <button
                className="mobile-add-btn"
                disabled={isSoldOut}
                style={{ background: isSoldOut ? '#ef4444' : '' }}
                onClick={(e) => { e.stopPropagation(); if (!isSoldOut) addToCart({ id: resolvedId, _id: resolvedId, name, price: currentPrice, badge, image: resolvedImage, sku }); }}>
                {isSoldOut ? <PackageX size={18} color="white" /> : <Plus size={18} color="white" strokeWidth={3} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
