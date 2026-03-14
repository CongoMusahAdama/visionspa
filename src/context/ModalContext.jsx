import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const openProduct = (product) => setSelectedProduct(product);
  const closeProduct = () => setSelectedProduct(null);

  return (
    <ModalContext.Provider value={{ selectedProduct, openProduct, closeProduct }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
