import React from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const NavCartButton = () => {
  const { cartCount, setIsCartOpen } = useCart();
  const [isBumped, setIsBumped] = React.useState(false);

  React.useEffect(() => {
    if (cartCount === 0) return;
    setIsBumped(true);
    const timer = setTimeout(() => setIsBumped(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);

  return (
    <button
      className={`icon-link nav-cart-btn flex items-center gap-2 ${isBumped ? 'bump' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCartOpen(true);
      }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', position: 'relative' }}
    >
      <span className="nav-icon-label">Bag</span>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <ShoppingBag 
          size={20} 
          strokeWidth={1.2} 
          style={{ 
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            transform: isBumped ? 'scale(1.2)' : 'scale(1)'
          }} 
        />
        {cartCount > 0 && (
          <span 
            className={`nav-cart-badge ${isBumped ? 'bump' : ''}`}
            style={{
              transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: isBumped ? 'scale(1.2)' : 'scale(1)'
            }}
          >
            {cartCount}
          </span>
        )}
      </span>
    </button>
  );
};

export default NavCartButton;
