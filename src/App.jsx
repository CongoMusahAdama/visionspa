import React, { useState, useEffect, useContext, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, ArrowRight, Instagram, Facebook, Twitter, Shield, Globe, Award, Mail, Phone, MessageCircle, Headset, X, Quote, Plus, Minus, Trash2, CheckCircle, Send, Menu, LayoutGrid, List } from 'lucide-react';
import './App.css';
import './mobile.css';

// --- CART CONTEXT ---
const CartContext = createContext(null);

const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const addToast = (name) => {
    setToast(name);
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    addToast(product.name);
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));

  const updateQty = (id, delta) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.qty, 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, cartTotal, addToCart, removeFromCart, updateQty, clearCart, isCartOpen, setIsCartOpen, toast, setToast }}>
      {children}
      <Toast />
    </CartContext.Provider>
  );
};

const Toast = () => {
  const { toast, setToast, setIsCartOpen } = useCart();
  if (!toast) return null;

  return (
    <div className="cart-toast fade-in-up" onClick={() => { setIsCartOpen(true); setToast(null); }}>
      <div className="toast-content">
        <div className="toast-icon"><CheckCircle size={18} /></div>
        <div className="toast-text">
          <p><strong>{toast}</strong> added to bag</p>
          <button className="toast-view-link">View Bag</button>
        </div>
        <button className="toast-close" onClick={(e) => { e.stopPropagation(); setToast(null); }}><X size={14} /></button>
      </div>
    </div>
  );
};

const useCart = () => useContext(CartContext);

// --- PRODUCT MODAL CONTEXT ---
const ModalContext = createContext(null);

const ModalProvider = ({ children }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const openProduct = (product) => setSelectedProduct(product);
  const closeProduct = () => setSelectedProduct(null);

  return (
    <ModalContext.Provider value={{ selectedProduct, openProduct, closeProduct }}>
      {children}
      <ProductDetailModal />
    </ModalContext.Provider>
  );
};

const useModal = () => useContext(ModalContext);

const ProductDetailModal = () => {
  const { selectedProduct, closeProduct } = useModal();
  const { addToCart, setIsCartOpen } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (selectedProduct) setQty(1);
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

  const { name, price, badge, image } = selectedProduct;

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
            <h2 className="modal-title serif">{name}</h2>
            <p className="modal-price">GH₵{price}</p>

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

              <div className="modal-social-grid">
                <a
                  href={`https://wa.me/233552739280?text=${encodeURIComponent(`Hi Vision Spa! I'm interested in ordering ${qty} x ${name} (GH₵${price} each). Can you help me?`)}`}
                  target="_blank" rel="noreferrer"
                  className="modal-social-btn wa"
                >
                  <MessageCircle size={20} /> WhatsApp
                </a>
                <a
                  href="https://ig.me/m/the_vision_spa"
                  target="_blank" rel="noreferrer"
                  className="modal-social-btn ig"
                >
                  <Instagram size={20} /> Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Asset imports (using the paths we set up)
const heroImg = '/hero1.png';
import collectionWomen from './assets/images/collection_women.png';
import productMidnight from './assets/images/product_midnight.png';

// --- DATA ---
const luxuryProducts = [
  { id: 1, name: "Midnight Artisan", price: "170.00", badge: "With Pouch", image: "/luxuriesfashion.png" },
  { id: 2, name: "Teal Horizon Pilot", price: "170.00", badge: "With Pouch", image: "/luxuriesfashion1.png" },
  { id: 3, name: "Executive Charcoal", price: "170.00", badge: "With Pouch", image: "/luxuriesfashion2.png" },
  { id: 4, name: "Elite Azure Frame", price: "170.00", badge: "With Pouch", image: "/luxuriesfashion3.png" },
  { id: 5, name: "Royal Obsidian", price: "170.00", badge: "With Pouch", image: "/luxuries-fashin4.png" },
  { id: 6, name: "Golden Heritage", price: "170.00", badge: "With Pouch", image: "/luxuriesfashion6.png" },
];

const eliteProducts = [
  { id: 7, name: "Elite Onyx", price: "200.00", badge: "With Case", image: "/elite.png" },
  { id: 8, name: "Elite Sapphire", price: "200.00", badge: "With Case", image: "/elite1.png" },
  { id: 10, name: "Elite Frost", price: "200.00", badge: "With Case", image: "/elite3.png" },
  { id: 11, name: "Elite Midnight", price: "200.00", badge: "With Case", image: "/elite4.png" },
  { id: 12, name: "Elite Rose", price: "200.00", badge: "With Case", image: "/elite5.png" },
  { id: 13, name: "Elite Shadow", price: "200.00", badge: "With Case", image: "/elite6.png" },
  { id: 14, name: "Elite Sun", price: "200.00", badge: "With Case", image: "/elite7.png" },
  { id: 15, name: "Elite Wood", price: "200.00", badge: "With Case", image: "/elite8.png" },
];

const menProducts = [
  { id: 16, name: "Classic Maverick", price: "200.00", badge: "With Case", image: "/men.png" },
  { id: 17, name: "Urban Explorer", price: "200.00", badge: "With Case", image: "/men1.png" },
  { id: 18, name: "Executive Pilot", price: "200.00", badge: "With Case", image: "/men2.png" },
  { id: 19, name: "Modern Gent", price: "200.00", badge: "With Case", image: "/men3.png" },
  { id: 20, name: "Elite Voyager", price: "200.00", badge: "With Case", image: "/men5.png" },
];

const categories = [
  { id: 'all', label: 'All Collections' },
  { id: 'luxury', label: 'Luxury Fashion' },
  { id: 'elite', label: 'Elite Collection' },
  { id: 'men', label: "Men's Collection" }
];

const allProducts = [...luxuryProducts, ...eliteProducts, ...menProducts];

const featuredProducts = [
  ...luxuryProducts.slice(0, 4),
  ...eliteProducts.slice(0, 4)
];

// --- COMPONENTS ---

const NavCartButton = () => {
  const { cartCount, setIsCartOpen } = useCart();
  return (
    <button
      className="icon-link nav-cart-btn flex items-center gap-2"
      onClick={() => setIsCartOpen(true)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
    >
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <ShoppingBag size={20} strokeWidth={1.2} />
        {cartCount > 0 && (
          <span className="nav-cart-badge">{cartCount}</span>
        )}
      </span>
    </button>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on location change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header className={`header ${isScrolled || !isHome ? 'scrolled' : ''}`}>
        <div className="container flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="logo"><img src="/logo.jpeg" alt="Vision Spa" className="logo-img" /></Link>
            <nav className="nav-menu desktop-only">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/shop" className="nav-link">Shop</Link>
              <Link to="/collections" className="nav-link">Collections</Link>
              <Link to="/about" className="nav-link">About</Link>
            </nav>
          </div>

          <div className="nav-icons">
            <Link to="/shop" className="icon-link desktop-only"><Search size={20} strokeWidth={1.2} /></Link>
            <a href="#" className="icon-link desktop-only"><User size={20} strokeWidth={1.2} /></a>
            <a href="#" className="icon-link desktop-only"><Heart size={20} strokeWidth={1.2} /></a>
            <NavCartButton />
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <div className={`mobile-nav-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <Link to="/" className="logo" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="/logo.jpeg" alt="Vision Spa" className="logo-img" />
          </Link>
          <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>
        <nav className="mobile-nav-links">
          <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link to="/collections" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
          <Link to="/about" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>About</Link>
        </nav>
        <div className="mobile-nav-footer">
          <div className="mobile-social-links">
            <a href="#"><Instagram size={20} /></a>
            <a href="#"><Facebook size={20} /></a>
            <a href="#"><Twitter size={20} /></a>
          </div>
          <p>© 2024 Vision Spa. Luxury Eyewear.</p>
        </div>
      </div>
      {isMobileMenuOpen && <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)} />}
    </>
  );
};

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-bg-accent hero-bg-accent-1"></div>
      <div className="hero-bg-accent hero-bg-accent-2"></div>

      <img src={heroImg} alt="Vision Spa Elite Eyewear" className="hero-image" />
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

const CollectionCard = ({ title, image, link }) => (
  <div className="collection-card reveal">
    <img src={image} alt={title} />
    <div className="collection-info">
      <h3 className="collection-title serif">{title}</h3>
      <a href={link} className="collection-link">Discover More</a>
    </div>
  </div>
);

const ProductCard = ({ id, name, price, badge, image }) => {
  const { cartItems, addToCart } = useCart();
  const { openProduct } = useModal();
  const cartItem = cartItems.find(i => i.id === id);
  const inCart = !!cartItem;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClick = (e) => {
    // Open modal on click (always good for mobile viewing)
    if (isMobile || window.innerWidth <= 767) {
      openProduct({ id, name, price, badge, image });
    }
  };

  return (
    <div className="product-card reveal" onClick={handleClick}>
      <div className="product-image-container">
        {badge && <div className="product-badge">{badge}</div>}
        {/* Price badge removed for mobile redesign */}
        {!isMobile && <div className="product-price-badge">GH₵{price}</div>}
        {inCart && (
          <div className="product-in-cart-badge">
            <CheckCircle size={14} />
            <span>In Cart</span>
          </div>
        )}
        <img src={image} alt={name} className="product-main-image" />
        <img src={image} alt={name} className="product-hover-image" style={{ filter: 'brightness(0.95)' }} />
      </div>
      <div className="product-details">
        <h4 className="product-name">{name}</h4>

        {/* Mobile subtitle using badge or short description */}
        {isMobile && <p className="product-mobile-subtitle">{badge || "VISION SPA EXCLUSIVE"}</p>}

        {/* Hide complex details on mobile, show only on desktop */}
        {!isMobile && (
          <div className="product-desktop-actions">
            <p className="product-price">GH₵{price}</p>
            <button className="add-to-cart-btn" onClick={(e) => { e.stopPropagation(); addToCart({ id, name, price, badge, image }); }}>
              <Plus size={16} /> Add to Cart
            </button>
            <div className="product-social-buy">
              <a href={`https://wa.me/233552739280`} target="_blank" rel="noreferrer" className="direct-wa-button">
                Direct WhatsApp Order
              </a>
            </div>
          </div>
        )}

        {isMobile && (
          <div className="product-mobile-actions-wrapper">
            <div className="mobile-buy-info">
              <span className="direct-buy-msg">
                <MessageCircle size={10} style={{ marginRight: '4px' }} />
                Order direct on WhatsApp & IG
              </span>
            </div>
            <div className="product-mobile-actions">
              <span className="mobile-price">₵ {price}</span>
              <button className="mobile-add-btn" onClick={(e) => { e.stopPropagation(); addToCart({ id, name, price, badge, image }); }}>
                <Plus size={18} color="white" strokeWidth={3} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- CART DRAWER ---
const CartDrawer = () => {
  const { cartItems, cartCount, cartTotal, removeFromCart, updateQty, clearCart, isCartOpen, setIsCartOpen } = useCart();

  const buildOrderMessage = () => {
    if (cartItems.length === 0) return '';
    const lines = cartItems.map(i => `• ${i.name} x${i.qty} — GH₵${(parseFloat(i.price) * i.qty).toFixed(2)}`);
    return `Hi Vision Spa! I'd like to place an order:\n\n${lines.join('\n')}\n\n*Total: GH₵${cartTotal.toFixed(2)}*\n\nPlease confirm my order. Thank you! 🙏`;
  };

  const msg = buildOrderMessage().replace(/GH₵/g, 'GHS');
  const waUrl = `https://wa.me/233552739280?text=${encodeURIComponent(msg)}`;
  const fbUrl = `https://m.me/TheVisionSpa?ref=${encodeURIComponent('ORDER_CART')}`;
  const igUrl = `https://ig.me/m/the_vision_spa`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(waUrl)}`;

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && <div className="cart-backdrop" onClick={() => setIsCartOpen(false)} />}

      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <div className="flex items-center gap-3">
            <ShoppingBag size={22} strokeWidth={1.5} />
            <h3 className="serif" style={{ margin: 0, fontSize: '1.4rem' }}>Your Order</h3>
            {cartCount > 0 && <span className="cart-count-badge">{cartCount}</span>}
          </div>
          <button className="cart-close-btn" onClick={() => setIsCartOpen(false)}><X size={22} /></button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <ShoppingBag size={56} strokeWidth={0.8} style={{ opacity: 0.2, marginBottom: '1.5rem' }} />
              <p style={{ opacity: 0.5, fontSize: '1rem' }}>Your cart is empty</p>
              <p style={{ opacity: 0.4, fontSize: '0.85rem', marginTop: '0.5rem' }}>Browse our collections and add items to order via WhatsApp, Facebook, or Instagram.</p>
            </div>
          ) : (
            <>
              <div className="cart-social-banner">
                <Send size={14} />
                <span>Quick Social Checkout — <strong>No Account Needed!</strong></span>
              </div>
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.name}</p>
                    <p className="cart-item-price">GH₵{parseFloat(item.price).toFixed(2)}</p>
                    <div className="cart-item-controls">
                      <button className="qty-btn-sm" onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                      <span className="qty-sm">{item.qty}</span>
                      <button className="qty-btn-sm" onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                    </div>
                  </div>
                  <div className="cart-item-right">
                    <p className="cart-item-subtotal">GH₵{(parseFloat(item.price) * item.qty).toFixed(2)}</p>
                    <button className="cart-remove-btn" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-total-row">
              <span className="cart-total-label">Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
              <span className="cart-total-price">GH₵{cartTotal.toFixed(2)}</span>
            </div>

            <p className="cart-checkout-label">Send order directly to:</p>

            <div className="cart-checkout-btns">
              <a href={waUrl} target="_blank" rel="noreferrer" className="checkout-social-btn checkout-whatsapp" onClick={() => setTimeout(clearCart, 1000)}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                <span>WhatsApp</span>
              </a>
              <a href={fbUrl} target="_blank" rel="noreferrer" className="checkout-social-btn checkout-facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                <span>Facebook</span>
              </a>
              <a href={igUrl} target="_blank" rel="noreferrer" className="checkout-social-btn checkout-instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                <span>Instagram</span>
              </a>
            </div>

            {/* QR Code Section */}
            <div className="cart-qr-section">
              <div className="cart-qr-container">
                <img
                  src={qrImageUrl}
                  alt="WhatsApp Order QR"
                  className="cart-qr-img"
                  loading="lazy"
                />
              </div>
              <div className="cart-qr-text">
                <p className="qr-title">Scan to Order</p>
                <p className="qr-desc">Scan this QR code to complete your purchase on WhatsApp instantly.</p>
              </div>
            </div>

            <button className="cart-clear-btn" onClick={clearCart}>
              <Trash2 size={14} /> Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div>
          <a href="/" className="logo footer-logo"><img src="/logo.jpeg" alt="Vision Spa" className="footer-logo-img" /></a>
          <p className="footer-desc">Defined by elegance, worn by the elite. Vision Spa brings you the finest selection of luxury fashion glasses.</p>
          <div className="flex flex-col gap-3" style={{ marginTop: '2rem' }}>
            <div className="flex items-center gap-3 footer-desc">
              <Phone size={16} className="text-teal" />
              <span>+233 544477261</span>
            </div>
            <div className="flex items-center gap-3 footer-desc">
              <MessageCircle size={16} className="text-teal" />
              <span>+233 552739280 (WhatsApp)</span>
            </div>
            <div className="flex items-center gap-3 footer-desc">
              <Mail size={16} className="text-teal" />
              <span style={{ fontSize: '0.85rem' }}>flourenceeshun6352@gmail.com</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="footer-heading">Collections</h4>
          <ul className="footer-links">
            <li><Link to="/shop">Women's Elite</Link></li>
            <li><Link to="/shop">Men's Standard</Link></li>
            <li><Link to="/shop">Luxury Fashion</Link></li>
            <li><Link to="/shop">All Collections</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Connect With Us</h4>
          <ul className="footer-links">
            <li><a href="#" className="flex items-center gap-2"><Instagram size={16} /> @The-Vision-Spa</a></li>
            <li><a href="#" className="flex items-center gap-2"><Facebook size={16} /> @The-Vision-Spa</a></li>
            <li><a href="#" className="flex items-center gap-2"><span style={{ fontWeight: 800 }}>T</span> TikTok @The-Vision-Spa</a></li>
            <li><a href="#" className="flex items-center gap-2"><span style={{ fontWeight: 800 }}>S</span> Snapchat @The-Vision-Spa</a></li>
          </ul>
        </div>

        <div>
          <h4 className="footer-heading">Newsletter</h4>
          <p className="footer-desc" style={{ marginBottom: '1rem' }}>Join the elite. Get exclusive access to new drops.</p>
          <div className="flex">
            <input
              type="text"
              placeholder="YOUR EMAIL"
              style={{ padding: '0.8rem', background: '#222', border: 'none', color: 'white', width: '100%' }}
            />
            <button className="bg-teal" style={{ padding: '0 1rem', color: 'white' }}>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Vision Spa. All rights reserved.</p>
        <div className="flex gap-8">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
);

// --- PAGE COMPONENTS ---

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState('all');

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

  const filteredFeatured = allProducts.filter(product => {
    if (activeCategory === 'all') return featuredProducts.some(fp => fp.id === product.id);
    if (activeCategory === 'luxury') return luxuryProducts.some(p => p.id === product.id);
    if (activeCategory === 'elite') return eliteProducts.some(p => p.id === product.id);
    if (activeCategory === 'men') return menProducts.some(p => p.id === product.id);
    return false;
  }).slice(0, 8);

  return (
    <>
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
            image={collectionWomen}
            link="#"
          />
          <CollectionCard
            title="Men’s Standard"
            image="/men.png"
            link="#"
          />
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <div className="center-text reveal" style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>Elite Products</span>
            <h2 className="serif" style={{ fontSize: '3rem', marginTop: '0.5rem' }}>Featured Eyewear</h2>

            {/* Category Filter Tabs */}
            <div className="flex justify-center gap-8 mt-8">
              {categories.map(cat => (
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
              <ProductCard key={product.id} {...product} />
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
    </>
  );
};

const AboutPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('active'));
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container center-text reveal">
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.5em', fontSize: '0.9rem' }}>The Vision Spa</span>
          <h1 className="serif" style={{ fontSize: '5rem', marginTop: '1rem' }}>Our Heritage</h1>
        </div>
      </section>

      <section className="section-padding container">
        <div className="about-story-grid">
          <div className="reveal">
            <span className="text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>Since 2025</span>
            <h2 className="serif" style={{ fontSize: '3.5rem', marginTop: '1rem', marginBottom: '2rem' }}>A Legacy of Excellence in Vision.</h2>
            <p style={{ fontSize: '1.2rem', color: '#666', lineHeight: '1.8', marginBottom: '2rem' }}>
              Vision Spa was born from a simple yet profound realization: that high-end eyewear is the ultimate intersection of medical precision and personal style. For over a decade, we have been at the forefront of luxury eyewear in Africa.
            </p>
            <p style={{ color: '#666', lineHeight: '1.8' }}>
              Our journey began with a small boutique focused on artisanal craftsmanship. Today, we are proud to be the premier destination for those who seek eyewear that reflects their ambition, their culture, and their uncompromising taste.
            </p>
          </div>
          <div className="heritage-image-wrapper reveal">
            <img src="/hero.png" alt="Vision Spa Craftsmanship" style={{ width: '100%', height: '600px', objectFit: 'cover' }} />
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <div className="center-text reveal" style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span className="text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>Our Philosophy</span>
            <h2 className="serif" style={{ fontSize: '3.5rem', marginTop: '1rem' }}>Values That Define Us</h2>
          </div>

          <div className="values-grid">
            <div className="value-card reveal">
              <div className="value-icon">
                <Shield size={30} strokeWidth={1.5} />
              </div>
              <h4 className="serif" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Unmatched Quality</h4>
              <p style={{ color: '#666', lineHeight: '1.6' }}>We source only the finest materials, from Italian acetate to Japanese titanium, ensuring every frame is built to last.</p>
            </div>

            <div className="value-card reveal" style={{ transitionDelay: '0.2s' }}>
              <div className="value-icon">
                <Globe size={30} strokeWidth={1.5} />
              </div>
              <h4 className="serif" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Cultural Pride</h4>
              <p style={{ color: '#666', lineHeight: '1.6' }}>Our designs are inspired by African excellence, merging traditional resonance with modern global fashion trends.</p>
            </div>

            <div className="value-card reveal" style={{ transitionDelay: '0.4s' }}>
              <div className="value-icon">
                <Award size={30} strokeWidth={1.5} />
              </div>
              <h4 className="serif" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Client Care</h4>
              <p style={{ color: '#666', lineHeight: '1.6' }}>Vision Spa is not just a store; it's a sanctuary for your sight. We provide personalized service for every elite client.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding" style={{ backgroundColor: '#fff' }}>
        <div className="container">
          <div className="center-text reveal" style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <span className="text-teal" style={{ textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: '0.8rem' }}>Get in Touch</span>
            <h2 className="serif" style={{ fontSize: '3.5rem', marginTop: '1rem' }}>Contact Vision Spa</h2>
          </div>

          <div className="contact-grid">
            <div className="contact-info-card reveal">
              <h3 className="serif" style={{ fontSize: '2.2rem', marginBottom: '1.5rem' }}>Connect with Us</h3>
              <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '3rem' }}>
                We are dedicated to providing you with an enhanced vision and a premium experience. Reach out to us for orders, styling advice, or exclusive support.
              </p>

              <div className="flex flex-col gap-4">
                <div className="contact-method-item">
                  <div className="contact-icon-box">
                    <Phone size={22} strokeWidth={1.5} />
                  </div>
                  <div className="contact-detail">
                    <p>Phone Support</p>
                    <p>+233 544477261</p>
                  </div>
                </div>

                <div className="contact-method-item">
                  <div className="contact-icon-box">
                    <MessageCircle size={22} strokeWidth={1.5} />
                  </div>
                  <div className="contact-detail">
                    <p>Direct WhatsApp</p>
                    <p>+233 552739280</p>
                  </div>
                </div>

                <div className="contact-method-item">
                  <div className="contact-icon-box">
                    <Mail size={22} strokeWidth={1.5} />
                  </div>
                  <div className="contact-detail">
                    <p>Email Address</p>
                    <p style={{ fontSize: '0.95rem !important' }}>flourenceeshun6352@gmail.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="reveal">
              <h3 className="serif" style={{ fontSize: '2.2rem', marginBottom: '1.5rem', paddingLeft: '1rem' }}>Our Social Media</h3>
              <div className="social-luxury-grid">
                <a href="#" className="social-luxury-card">
                  <div className="social-icon-circle"><Instagram size={20} /></div>
                  <div className="social-info">
                    <h4>Instagram</h4>
                    <p>@The-Vision-Spa</p>
                  </div>
                  <span className="social-follow-btn">Follow Us <ArrowRight size={14} /></span>
                </a>

                <a href="#" className="social-luxury-card">
                  <div className="social-icon-circle"><Facebook size={20} /></div>
                  <div className="social-info">
                    <h4>Facebook</h4>
                    <p>@The-Vision-Spa</p>
                  </div>
                  <span className="social-follow-btn">Join Us <ArrowRight size={14} /></span>
                </a>

                <a href="#" className="social-luxury-card">
                  <div className="social-icon-circle"><span style={{ fontWeight: 900 }}>T</span></div>
                  <div className="social-info">
                    <h4>TikTok</h4>
                    <p>@The-Vision-Spa</p>
                  </div>
                  <span className="social-follow-btn">Watch <ArrowRight size={14} /></span>
                </a>

                <a href="#" className="social-luxury-card">
                  <div className="social-icon-circle"><span style={{ fontWeight: 900 }}>S</span></div>
                  <div className="social-info">
                    <h4>Snapchat</h4>
                    <p>@The-Vision-Spa</p>
                  </div>
                  <span className="social-follow-btn">Share <ArrowRight size={14} /></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="section-padding container">
        <div className="center-text reveal" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
          <h2 className="serif" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Experience Vision Spa Today.</h2>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>Join the thousands of individuals who have defined their personality through our curated collections.</p>
          <Link to="/shop" className="cta-button-premium">Explore Collection</Link>
        </div>
      </section>
    </div>
  );
};

const CollectionsPage = ({ collectionWomen }) => {
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
            <img src={collectionWomen} alt="Women's Elite Collection" />
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

const ShopPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('Recommended');
  const [maxPrice, setMaxPrice] = useState(300);

  const filteredProducts = allProducts
    .filter(product => {
      const matchesCategory = activeCategory === 'all' ||
        (activeCategory === 'luxury' && luxuryProducts.find(p => p.id === product.id)) ||
        (activeCategory === 'elite' && eliteProducts.find(p => p.id === product.id)) ||
        (activeCategory === 'men' && menProducts.find(p => p.id === product.id));

      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = parseFloat(product.price) <= maxPrice;

      return matchesCategory && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === 'Price: High to Low') return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    });

  useEffect(() => {
    window.scrollTo(0, 0);
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('active'));
    }, observerOptions);
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [activeCategory, searchQuery, sortBy, maxPrice]);

  return (
    <div className="shop-page-wrapper">
      {/* Shop Sub-hero - Hidden on Mobile via CSS */}
      <section className="shop-hero">
        <div className="center-text reveal">
          <span className="shop-hero-brand">The Vision Spa</span>
          <h1 className="serif shop-hero-title">Exquisite Eyewear</h1>
        </div>
      </section>

      <section className="shop-section">
        <div className="container">
          <div className="shop-layout">

            {/* Desktop Sidebar / Mobile Filter Drawer Wrapper */}
            <aside className={`shop-sidebar ${showFilters ? 'mobile-open' : ''}`}>
              <div className="sidebar-inner">
                <div className="sidebar-header mobile-only">
                  <h3 className="serif">Filter & Sort</h3>
                  <button className="close-filters" onClick={() => setShowFilters(false)}><X size={24} /></button>
                </div>

                <div className="sidebar-section">
                  <h4 className="sidebar-title">Search</h4>
                  <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Find your vision..."
                      className="search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="sidebar-section">
                  <h4 className="sidebar-title">Collections</h4>
                  <div className="category-list">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategory(cat.id);
                          if (window.innerWidth <= 767) setShowFilters(false);
                        }}
                        className={`category-item-btn ${activeCategory === cat.id ? 'active' : ''}`}
                      >
                        <span className="cat-icon">
                          {cat.id === 'all' && <ShoppingBag size={18} />}
                          {cat.id === 'luxury' && <Award size={18} />}
                          {cat.id === 'elite' && <Shield size={18} />}
                          {cat.id === 'men' && <User size={18} />}
                        </span>
                        <span className="cat-label">{cat.label}</span>
                        <span className="cat-count">
                          {cat.id === 'all' ? allProducts.length :
                            cat.id === 'luxury' ? luxuryProducts.length :
                              cat.id === 'elite' ? eliteProducts.length : menProducts.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sidebar-section">
                  <h4 className="sidebar-title">Price Range</h4>
                  <div className="price-filter">
                    <div className="price-labels">
                      <span>GH₵0</span>
                      <span>GH₵{maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="300"
                      step="10"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="price-slider"
                    />
                    <p className="price-hint">Under GH₵{maxPrice}</p>
                  </div>
                </div>

                <div className="sidebar-section mobile-only">
                  <h4 className="sidebar-title">Sort By</h4>
                  <div className="mobile-sort-options">
                    {['Recommended', 'Price: Low to High', 'Price: High to Low'].map(opt => (
                      <button
                        key={opt}
                        className={`sort-option-btn ${sortBy === opt ? 'active' : ''}`}
                        onClick={() => {
                          setSortBy(opt);
                          setShowFilters(false);
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sidebar-footer mobile-only">
                  <button className="apply-btn" onClick={() => setShowFilters(false)}>Show {filteredProducts.length} Results</button>
                </div>
              </div>
            </aside>

            {/* Main Product Area */}
            <div className="shop-content">
              {/* Mobile Only Header Actions */}
              <div className="mobile-shop-header mobile-only">
                <div className="mobile-page-title-area">
                  <h1 className="mobile-shop-title">Our Menu</h1>
                  <p className="mobile-shop-subtitle">Vision Spa — All items available online</p>
                </div>

                <div className="mobile-search-bar">
                  <input
                    type="text"
                    placeholder="Search items..."
                    className="mobile-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search size={22} className="mobile-search-icon" color="#999" />
                </div>

                <div className="mobile-filter-controls">
                  <div className="mobile-sort-select-wrapper">
                    <select
                      className="mobile-sort-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option>Recommended</option>
                      <option>Price: High to Low</option>
                      <option>Price: Low to High</option>
                    </select>
                  </div>
                  <div className="mobile-view-toggles">
                    <button className="mobile-view-btn active"><LayoutGrid size={20} /></button>
                    <button className="mobile-view-btn"><List size={20} /></button>
                  </div>
                </div>

                <div className="mobile-category-filters">
                  <p className="mobile-filter-label">FILTER BY CATEGORY</p>
                  <div className="mobile-category-scroll-row">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`mobile-cat-pill ${activeCategory === cat.id ? 'active' : ''}`}
                      >
                        {activeCategory === cat.id && (
                          <div className="cat-icon-circle">
                            <ShoppingBag size={12} color="#008080" />
                          </div>
                        )}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mobile-item-count">
                  Showing <b>{filteredProducts.length}</b> items
                </div>
              </div>

              {/* Desktop Only Controls */}
              <div className="shop-toolbar desktop-only reveal">
                <div className="results-info">
                  Showing <span className="highlight">{filteredProducts.length}</span> luxury frames
                </div>
                <div className="toolbar-actions">
                  <label>Sort By:</label>
                  <select
                    className="premium-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option>Recommended</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                </div>
              </div>

              {/* Active Filters Chips */}
              {(activeCategory !== 'all' || searchQuery || maxPrice < 300) && (
                <div className="active-filters-row">
                  {activeCategory !== 'all' && (
                    <div className="filter-chip">
                      {categories.find(c => c.id === activeCategory)?.label}
                      <X size={14} onClick={() => setActiveCategory('all')} />
                    </div>
                  )}
                  {searchQuery && (
                    <div className="filter-chip">
                      "{searchQuery}"
                      <X size={14} onClick={() => setSearchQuery('')} />
                    </div>
                  )}
                  {maxPrice < 300 && (
                    <div className="filter-chip">
                      Under GH₵{maxPrice}
                      <X size={14} onClick={() => setMaxPrice(300)} />
                    </div>
                  )}
                </div>
              )}

              <div className="shop-results-container">
                {filteredProducts.length > 0 ? (
                  <div className="product-grid-shop fade-in">
                    {filteredProducts.map(p => <ProductCard key={p.id} {...p} />)}
                  </div>
                ) : (
                  <div className="no-results reveal">
                    <div className="no-results-icon"><Search size={48} /></div>
                    <h3>No frames match your criteria</h3>
                    <p>Try adjusting your filters or searching for something else.</p>
                    <button
                      className="clear-all-btn"
                      onClick={() => { setSearchQuery(''); setActiveCategory('all'); setMaxPrice(300); }}
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Sidebar Backdrop */}
      {showFilters && <div className="mobile-sidebar-backdrop" onClick={() => setShowFilters(false)}></div>}
    </div>
  );
};

const SupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`support-bot-container ${isOpen ? 'open' : ''}`}>
      <div className="support-window">
        <div className="support-header">
          <div className="flex items-center gap-3">
            <div className="support-avatar">
              <Headset size={20} />
            </div>
            <div>
              <h4 className="serif" style={{ fontSize: '1rem', margin: 0 }}>Vision Support</h4>
              <p style={{ fontSize: '0.7rem', opacity: 0.8, margin: 0 }}>Online | Active Now</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="close-support">
            <X size={18} />
          </button>
        </div>
        <div className="support-body">
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Hello! How can we help you define your vision today?</p>
          <div className="support-contact-list">
            <div className="support-contact-item">
              <Phone size={14} className="text-teal" />
              <div>
                <span>Call Us</span>
                <strong>+233 544477261</strong>
              </div>
            </div>
            <div className="support-contact-item">
              <MessageCircle size={14} className="text-teal" />
              <div>
                <span>WhatsApp</span>
                <strong>+233 552739280</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="support-footer">
          <a href="https://wa.me/233552739280" target="_blank" rel="noreferrer" className="cta-button" style={{ width: '100%', textAlign: 'center', fontSize: '0.8rem', padding: '0.6rem', display: 'block' }}>
            Chat on WhatsApp
          </a>
        </div>
      </div>
      <button className="support-trigger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
        {!isOpen && (
          <>
            <span className="support-badge"></span>
            <span className="support-tooltip">Contact Support</span>
          </>
        )}
      </button>
    </div>
  );
};

// --- MAIN APP ---

const App = () => {
  return (
    <CartProvider>
      <ModalProvider>
        <Router>
          <div className="app">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
            <Footer />
            <SupportBot />
          </div>
        </Router>
      </ModalProvider>
    </CartProvider>
  );
};

export default App;
