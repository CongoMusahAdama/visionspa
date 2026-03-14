import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const addToast = (name) => {
    setToast(name);
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id || i.id === product._id);
      const productId = product.id || product._id;
      if (existing) return prev.map(i => (i.id === productId) ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, id: productId, qty: 1 }];
    });
    addToast(product.name);
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => (i.id || i._id) !== id));

  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(i => (i.id || i._id) === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);

  return (
    <CartContext.Provider value={{ 
        cartItems, 
        cartCount, 
        cartTotal, 
        addToCart, 
        removeFromCart, 
        updateQty, 
        clearCart, 
        isCartOpen, 
        setIsCartOpen, 
        toast, 
        setToast 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
