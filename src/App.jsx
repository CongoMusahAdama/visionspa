import React, { useState, useEffect, useContext, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, ArrowRight, Instagram, Facebook, Twitter, Shield, Globe, Award, Mail, Phone, MessageCircle, Headset, X, Quote, Plus, Minus, Trash2, CheckCircle, Send, Menu, LayoutGrid, List, LayoutDashboard, Package, Layers, ShoppingCart, BarChart3, Receipt, Settings, LogOut, Edit3, Trash, Download, Filter, Eye, MoreVertical, AlertTriangle, Sparkles, Upload, PackageX } from 'lucide-react';
import './App.css';
import './mobile.css';
import './Dashboard.css';
import Swal from 'sweetalert2';
import html2pdf from 'html2pdf.js';

const API_URL = import.meta.env.VITE_API_URL || (window.location.origin.includes('localhost') ? 'http://localhost:5000/api' : `${window.location.origin}/api`);

const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('vision_auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const config = {
    method,
    headers,
    credentials: 'include', // Important for httpOnly cookies
    ...(body && { body: JSON.stringify(body) })
  };

  try {
    const res = await fetch(`${API_URL}${endpoint}`, config);
    return await res.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { success: false, message: 'Server connection failed' };
  }
};

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
    // Explicitly open cart when adding to ensure visibility
    setIsCartOpen(true);
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
      <CartDrawer />
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

  const { name, price, discountPrice, discountPercentage, badge, image, comesWithPouch } = selectedProduct;
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
            <h2 className="modal-title serif">{name}</h2>
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

              <div className="modal-social-grid">
                <a
                  href={`https://wa.me/233552739280?text=${encodeURIComponent(`Hi Vision Spa! I'm interested in ordering ${qty} x ${name} (GH₵${discountPrice || price} each). Can you help me?`)}`}
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

// --- DATA ---
const luxuryProducts = [
  { id: 1, name: "Midnight Artisan", price: "170.00", badge: "With Pouch", image: "/midnight.png" },
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

// Dynamic categories will be fetched from backend and passed to components.

const allProducts = [
  ...luxuryProducts.map(p => ({ ...p, category: 'Luxury' })),
  ...eliteProducts.map(p => ({ ...p, category: 'Elite' })),
  ...menProducts.map(p => ({ ...p, category: 'Men' }))
];

const featuredProducts = [
  ...luxuryProducts.slice(0, 4),
  ...eliteProducts.slice(0, 4)
];

// --- CUSTOM CURRENCY ICONS ---
const ReceiptCedi = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
    <path d="M11 9v6" />
    <path d="M14 9.5a2.5 2.5 0 1 0 0 5" />
  </svg>
);

// --- COMPONENTS ---

const NavCartButton = () => {
  const { cartCount, setIsCartOpen } = useCart();
  return (
    <button
      className="icon-link nav-cart-btn flex items-center gap-2"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCartOpen(true);
      }}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', position: 'relative' }}
    >
      <span className="nav-icon-label">Bag</span>
      <span style={{ position: 'relative', display: 'inline-flex' }}>
        <ShoppingBag size={20} strokeWidth={1.2} />
        {cartCount > 0 && (
          <span className="nav-cart-badge">{cartCount}</span>
        )}
      </span>
    </button>
  );
};

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay">
      <div className="search-overlay-backdrop" onClick={onClose}></div>
      <div className="search-overlay-content">
        <button className="search-overlay-close" onClick={onClose}>
          <X size={32} strokeWidth={1.5} />
        </button>
        <div className="container center-text">
          <span className="search-overlay-label">Find Your Vision</span>
          <form onSubmit={handleSearch} className="search-overlay-form">
            <input
              type="text"
              autoFocus
              placeholder="Searching for high-end eyewear..."
              className="search-overlay-input serif"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="search-overlay-btn">
              <ArrowRight size={32} />
            </button>
          </form>
          <div className="search-overlay-suggestions">
            <p>Popular:
              <strong onClick={() => { setQuery('Elite'); navigate('/shop?q=Elite'); onClose(); }}>Elite</strong>,
              <strong onClick={() => { setQuery('Midnight'); navigate('/shop?q=Midnight'); onClose(); }}>Midnight</strong>,
              <strong onClick={() => { setQuery('Classic'); navigate('/shop?q=Classic'); onClose(); }}>Classic</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/auth' || location.pathname.startsWith('/admin');

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

  if (isAuthPage) return null;

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
            <button className="icon-link" onClick={() => setIsSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', position: 'relative' }}>
              <span className="nav-icon-label">Search</span>
              <Search size={20} strokeWidth={1.5} />
            </button>
            <a href="#" className="icon-link desktop-only"><User size={20} strokeWidth={1.5} /></a>
            <a href="#" className="icon-link desktop-only"><Heart size={20} strokeWidth={1.5} /></a>
            <NavCartButton />
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

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

      <img src="/hero1.png" alt="Vision Spa Elite Eyewear" className="hero-image" />
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
      <Link to="/shop" className="collection-link">Discover More</Link>
    </div>
  </div>
);

const ProductCard = ({ id, _id, name, price, discountPrice, badge, image, status, stock, soldOutAt, comesWithPouch }) => {
  const resolvedId = _id || id;
  const isSoldOut = status === 'Sold Out' || stock === 0 || !!soldOutAt;
  const { cartItems, addToCart } = useCart();
  const { openProduct } = useModal();
  const cartItem = cartItems.find(i => i.id === resolvedId);
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
      if (!isSoldOut) openProduct({ id: resolvedId, name, price, discountPrice, badge, image: resolvedImage, comesWithPouch });
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
        {/* Price badge removed for mobile redesign */}
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
        <h4 className="product-name">{name}</h4>
        {comesWithPouch && (
          <p style={{ fontSize: '0.7rem', color: '#008080', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.25rem' }}>
            <CheckCircle size={12} /> Includes Pouch
          </p>
        )}

        {/* Mobile subtitle using badge or short description */}
        {isMobile && <p className="product-mobile-subtitle">{badge || "VISION SPA EXCLUSIVE"}</p>}

        {/* Hide complex details on mobile, show only on desktop */}
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
              onClick={(e) => { e.stopPropagation(); if (!isSoldOut) addToCart({ id: resolvedId, name, price: currentPrice, badge, image: resolvedImage }); }}>
              <Plus size={16} /> {isSoldOut ? 'Sold Out' : 'Add to Cart'}
            </button>
            <div className="product-social-buy">
              {isSoldOut ? (
                <span className="direct-wa-button" style={{ opacity: 0.5, cursor: 'not-allowed', background: '#e2e8f0', color: '#94a3b8' }}>
                  Currently Unavailable
                </span>
              ) : (
                <a href={`https://wa.me/233552739280`} target="_blank" rel="noreferrer" className="direct-wa-button">
                  Direct WhatsApp Order
                </a>
              )}
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
                onClick={(e) => { e.stopPropagation(); if (!isSoldOut) addToCart({ id: resolvedId, name, price: currentPrice, badge, image: resolvedImage }); }}>
                {isSoldOut ? <PackageX size={18} color="white" /> : <Plus size={18} color="white" strokeWidth={3} />}
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

const Footer = () => {
  const location = useLocation();
  if (location.pathname === '/auth' || location.pathname.startsWith('/admin')) return null;

  return (
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
};

// --- PAGE COMPONENTS ---

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
      // Hide if sold out > 3 days ago
      const isSoldOut = product.status === 'Sold Out' || product.stock === 0 || !!product.soldOutAt;
      if (isSoldOut && product.soldOutAt) {
        const soldDate = new Date(product.soldOutAt);
        const daysSoldOut = (new Date() - soldDate) / (1000 * 60 * 60 * 24);
        if (daysSoldOut > 3) return false;
      }

      // Filter by category
      if (activeCategory !== 'all' && product.category?.toLowerCase() !== activeCategory.toLowerCase()) return false;
      // Filter out products with broken blob URLs (blob URLs don't persist across sessions)
      const img = product.image || '';
      if (img.startsWith('blob:')) return false;
      return true;
    })
    // Sort: DB products with real images first (createdAt), then static
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 16);

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

            {/* Category Filter Tabs */}
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
              <ProductCard key={product._id || product.id} {...product} id={product._id || product.id} />
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

const ShopPage = ({ products = [], categories = [] }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Recommended');
  const [maxPrice, setMaxPrice] = useState(300);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  const filteredProducts = products
    .filter(product => {
      // Hide if sold out > 3 days ago
      const isSoldOut = product.status === 'Sold Out' || product.stock === 0 || !!product.soldOutAt;
      if (isSoldOut && product.soldOutAt) {
        const soldDate = new Date(product.soldOutAt);
        const daysSoldOut = (new Date() - soldDate) / (1000 * 60 * 60 * 24);
        if (daysSoldOut > 3) return false;
      }

      const matchesCategory = activeCategory === 'all' ||
        product.category?.toLowerCase() === activeCategory.toLowerCase();

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

  const categoryTabs = [
    { id: 'all', label: 'All Collections' },
    ...categories.map(c => typeof c === 'object' ? c : { id: c.toLowerCase(), label: c })
  ];

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
                    {categoryTabs.map((cat) => (
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
                          {cat.id !== 'all' && <Award size={18} />}
                        </span>
                        <span className="cat-label">{cat.label}</span>
                        <span className="cat-count">
                          {cat.id === 'all' ? products.length :
                            products.filter(p => p.category?.toLowerCase() === cat.id).length}
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
                  <h1 className="mobile-shop-title">Shop Now</h1>
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
                    {categoryTabs.map((cat) => (
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
                      {categoryTabs.find(c => c.id === activeCategory)?.label}
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
                    {filteredProducts.map(p => <ProductCard key={p._id || p.id} {...p} />)}
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
  const location = useLocation();
  if (location.pathname === '/auth' || location.pathname.startsWith('/admin')) return null;


  return (
    <div className={`support-bot-container ${isOpen ? 'open' : ''}`}>
      <div className="support-window">
        <div className="support-header-premium">
          <div className="flex items-center gap-4">
            <div className="support-avatar-pulse">
              <Headset size={22} color="white" />
              <div className="online-indicator"></div>
            </div>
            <div>
              <h4 className="serif" style={{ fontSize: '1.1rem', margin: 0, letterSpacing: '0.02em' }}>Vision Support</h4>
              <p className="support-status">Online | Average response 1m</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="close-support-btn">
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="support-body-premium">
          <div className="support-msg-bubble">
            <p>Hello! Welcome to Vision Spa Luxury. How can we help you define your vision today?</p>
          </div>

          <div className="support-action-grid">
            <a href="tel:+233544477261" className="support-action-card">
              <div className="action-icon-circle tel-bg">
                <Phone size={18} />
              </div>
              <div className="action-details">
                <span>Call Us Direct</span>
                <strong>+233 544 477 261</strong>
              </div>
              <ArrowRight size={14} className="action-arrow" />
            </a>

            <a href="https://wa.me/233552739280" target="_blank" rel="noreferrer" className="support-action-card">
              <div className="action-icon-circle wa-bg">
                <MessageCircle size={18} />
              </div>
              <div className="action-details">
                <span>WhatsApp Live</span>
                <strong>+233 552 739 280</strong>
              </div>
              <ArrowRight size={14} className="action-arrow" />
            </a>
          </div>
        </div>

        <div className="support-footer-premium">
          <a href="https://wa.me/233552739280" target="_blank" rel="noreferrer" className="whatsapp-full-btn">
            <MessageCircle size={18} />
            <span>Start WhatsApp Chat</span>
          </a>
        </div>
      </div>

      <button className="support-trigger-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <div className="trigger-label">
            <span className="pulse-dot"></span>
            Chat with us
          </div>
        )}
      </button>
    </div>
  );
};

// --- FORCE VERIFICATION / PASSWORD CHANGE ---

const ForcePasswordChangeModal = ({ setUser }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await apiRequest('/auth/updatepassword', 'PUT', {
        currentPassword,
        newPassword
      });
      Swal.fire('Success', 'Password updated securely. Welcome!', 'success');
      setUser(prev => ({ ...prev, needsPasswordChange: false }));
    } catch (err) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-modal-backdrop" style={{ zIndex: 99999 }}>
      <div className="product-modal-window p-8 max-w-md w-full" style={{ padding: '2rem', maxWidth: '400px' }}>
        <h2 className="text-2xl font-bold text-center mb-6 serif">Security Requirement</h2>
        <p className="text-center mb-6 text-gray-500 text-sm">
          Welcome! Before you can access the dashboard, you must change your password from the default one provided.
        </p>

        {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 text-sm text-center font-medium border border-red-100">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008080] text-white py-3 rounded-md font-bold mt-4 hover:bg-[#007070] transition-colors"
          >
            {loading ? 'Updating...' : 'Update Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

// --- AUTH PAGE ---

const AuthPage = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const res = await apiRequest('/auth/login', 'POST', { identifier, password });

    if (res.success) {
      Swal.fire({
        title: `Welcome Back, ${(res.name && res.name !== 'Vision Admin' && res.name !== 'Admin')
          ? res.name.split(' ')[0]
          : 'Florence'
          }!`,
        text: `Success! Authenticated as ${res.name || 'Florence '}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        background: '#fff',
        color: '#1a202c',
        iconColor: '#008080',
        customClass: {
          popup: 'premium-swal-popup'
        }
      });
      onLogin(res);
      navigate('/admin');
    } else {
      setError(res.message || 'Invalid credentials');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <img src="/hero1.png" alt="Admin Background" />
        <div className="auth-overlay"></div>
      </div>

      {/* Decorative Glows */}
      <div className="auth-glow auth-glow-1"></div>
      <div className="auth-glow auth-glow-2"></div>

      <div className="auth-container">
        <div className={`auth-card glass reveal ${isLoaded ? 'active' : ''}`}>
          <div className="auth-card-header">
            <Link to="/" className="auth-logo-link">
              <img src="/logo.jpeg" alt="Vision Spa" className="auth-logo" />
            </Link>
            <h2 className="serif">Admin Portal</h2>
            <p className="auth-subtitle">Restricted Access • Secure Login</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            {error && <div className="auth-error-msg">{error}</div>}

            <div className="auth-input-wrapper">
              <label>Email or Phone</label>
              <div className="auth-input-group">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  required
                  placeholder="admin@visionspa.com or +233..."
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="auth-input-wrapper">
              <label>Password</label>
              <div className="auth-input-group">
                <Shield className="input-icon" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
              <span>{isSubmitting ? 'Authenticating...' : 'Enter Dashboard'}</span>
              {!isSubmitting && <ArrowRight size={18} />}
            </button>
          </form>

          <footer className="auth-card-footer">
            <p className="auth-footer-text">
              Secure 256-bit encrypted portal. <br />
              Authorized Vision Spa Personnel Only.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN DASHBOARD COMPONENTS ---

const AdminDashboard = ({ products, categories, orders, addProduct, updateProduct, deleteProduct, addOrder, updateOrder, setCategories, user, onLogout }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const location = useLocation();

  const handleMobileLogout = () => {
    Swal.fire({
      title: 'Sign Out?',
      text: "Are you sure you want to end your session?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#008080',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign Out'
    }).then((result) => {
      if (result.isConfirmed) {
        onLogout();
      }
    });
  };

  return (
    <div className={`dashboard-layout ${isMinimized ? 'minimized' : ''}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''} ${isMinimized ? 'minimized' : ''}`}>
        <div className="sidebar-header">
          {!isMinimized && (
            <div className="flex items-center gap-4">
              <img src="/logo.jpeg" alt="Vision Spa" className="admin-logo" />
              <div className="admin-profile-hint">
                <h2 className="serif" style={{ fontSize: '1rem', color: 'white', margin: 0 }}>Vision Spa</h2>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{user?.role || 'Admin'}</p>
              </div>
            </div>
          )}
          <button className="sidebar-minimize-toggle" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <LayoutGrid size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <Link to="/admin" className={`sidebar-link ${location.pathname === '/admin' ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            <span className="sidebar-text">Dashboard</span>
          </Link>
          <Link to="/admin/products" className={`sidebar-link ${location.pathname.startsWith('/admin/products') ? 'active' : ''}`}>
            <Package size={18} />
            <span className="sidebar-text">Products</span>
          </Link>
          <Link to="/admin/categories" className={`sidebar-link ${location.pathname.startsWith('/admin/categories') ? 'active' : ''}`}>
            <Layers size={18} />
            <span className="sidebar-text">Categories</span>
          </Link>
          <Link to="/admin/orders" className={`sidebar-link ${location.pathname.startsWith('/admin/orders') ? 'active' : ''}`}>
            <ShoppingCart size={18} />
            <span className="sidebar-text">Orders</span>
          </Link>
          <Link to="/admin/inventory" className={`sidebar-link ${location.pathname.startsWith('/admin/inventory') ? 'active' : ''}`}>
            <BarChart3 size={18} />
            <span className="sidebar-text">Inventory</span>
          </Link>
          <Link to="/admin/receipts" className={`sidebar-link ${location.pathname.startsWith('/admin/receipts') ? 'active' : ''}`}>
            <ReceiptCedi size={18} />
            <span className="sidebar-text">Receipts</span>
          </Link>
          <div className="sidebar-divider" style={{ margin: '1rem 0', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
          <Link to="/" className="sidebar-link">
            <Globe size={18} />
            <span className="sidebar-text">View Website</span>
          </Link>
          <Link to="/shop" className="sidebar-link">
            <ShoppingBag size={18} />
            <span className="sidebar-text">Go to Shop</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-btn" style={{ width: '100%', border: 'none', background: 'none' }}>
            <LogOut size={18} />
            <span className="sidebar-text">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Mobile Nav Toggle */}
        <div className="admin-mobile-nav">
          <div className="flex items-center gap-3">
            <Menu size={24} onClick={() => setIsMobileOpen(!isMobileOpen)} />
            <Link to="/" style={{ color: 'inherit', display: 'flex' }} title="View Store">
              <Globe size={20} />
            </Link>
          </div>
          <h2 className="serif" onClick={() => window.location.href = '/admin'} style={{ cursor: 'pointer' }}>Vision Admin</h2>
          <div className="admin-user-avatar" onClick={handleMobileLogout} style={{ cursor: 'pointer' }}>
            <User size={20} />
          </div>
        </div>

        <Routes>
          <Route path="/" element={<DashboardOverview products={products} orders={orders} user={user} />} />
          <Route path="/products" element={<AdminProducts products={products} categories={categories} deleteProduct={deleteProduct} addProduct={addProduct} updateProduct={updateProduct} />} />
          <Route path="/orders" element={<AdminOrders orders={orders} addOrder={addOrder} updateOrder={updateOrder} products={products} />} />
          <Route path="/receipts" element={<AdminReceipts orders={orders} />} />
          <Route path="/categories" element={<AdminCategories categories={categories} setCategories={setCategories} />} />
          <Route path="/inventory" element={<AdminInventory products={products} />} />
          {/* Default to Overview */}
          <Route path="*" element={<DashboardOverview products={products} orders={orders} user={user} />} />
        </Routes>
      </main>

      {/* Admin Bottom Navigation (Mobile) — Pulse-Style */}
      <nav className="admin-bottom-nav">
        {/* Left side: 2 links */}
        <Link to="/admin" className={`bottom-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>
          <LayoutDashboard size={22} />
          <span>Home</span>
        </Link>
        <Link to="/admin/products" className={`bottom-nav-link ${location.pathname.startsWith('/admin/products') ? 'active' : ''}`}>
          <Package size={22} />
          <span>Stock</span>
        </Link>

        {/* Center raised FAB button */}
        <div className="bottom-nav-center-slot">
          <Link to="/admin/orders" className={`bottom-nav-fab ${location.pathname.startsWith('/admin/orders') ? 'active' : ''}`}>
            <ShoppingCart size={26} />
            <span>Sales</span>
          </Link>
        </div>

        {/* Right side: 2 links */}
        <Link to="/admin/receipts" className={`bottom-nav-link ${location.pathname.startsWith('/admin/receipts') ? 'active' : ''}`}>
          <ReceiptCedi size={22} />
          <span>Receipts</span>
        </Link>
        <Link to="/admin/inventory" className={`bottom-nav-link ${location.pathname.startsWith('/admin/inventory') ? 'active' : ''}`}>
          <BarChart3 size={22} />
          <span>Health</span>
        </Link>
      </nav>
    </div>
  );
};

const DashboardOverview = ({ products, orders, user }) => {
  const navigate = useNavigate();
  const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length;
  const lowStockThreshold = 5;
  const lowStock = products.filter(p => p.stock <= lowStockThreshold).length;
  const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  // Pagination for Recent Orders
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div className="dashboard-view fade-in">
      <div className="welcome-banner reveal active">
        <div className="welcome-content">
          <h2 className="serif">Welcome Back, {
            user?.name && user.name !== 'Vision Admin' && user.name !== 'Admin'
              ? user.name.split(' ')[0]
              : 'Florence'
          }!</h2>
          <p>The vision of luxury continues. Here is a summary of your performance today.</p>
        </div>
        <div className="welcome-decor">
          <Sparkles size={60} className="sparkle-icon" />
        </div>
      </div>

      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Performance Overview</h1>
          <p>Vision Spa Luxury • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/admin/products')} className="cta-button-premium shadowed" style={{ padding: '0.8rem 1.75rem', fontSize: '0.8rem', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Plus size={18} /> Add New Product
          </button>
        </div>
      </header>

      {/* Interactive Stats Cards */}
      <div className="stats-grid">
        <div
          className="stat-card blue interactive"
          onClick={() => navigate('/admin/products')}
        >
          <div className="stat-icon"><Package size={24} /></div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <span className="stat-number">{products.length}</span>
            <span className="stat-link">View catalog →</span>
          </div>
        </div>

        <div
          className="stat-card green interactive"
          onClick={() => navigate('/admin/orders')}
        >
          <div className="stat-icon"><ShoppingCart size={24} /></div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <span className="stat-number">{orders.length}</span>
            <span className="stat-link">Manage sales →</span>
          </div>
        </div>

        <div
          className="stat-card yellow interactive"
          onClick={() => navigate('/admin/receipts')}
        >
          <div className="stat-icon"><Award size={24} /></div>
          <div className="stat-info">
            <h3>Total Sales</h3>
            <span className="stat-number">GH₵{totalSales.toLocaleString()}</span>
            <span className="stat-link">Receipts →</span>
          </div>
        </div>

        <div
          className="stat-card orange interactive"
          onClick={() => navigate('/admin/orders')}
        >
          <div className="stat-icon"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>Pending</h3>
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-link">Take action →</span>
          </div>
        </div>

        <div
          className="stat-card red interactive"
          onClick={() => navigate('/admin/inventory')}
        >
          <div className="stat-icon"><BarChart3 size={24} /></div>
          <div className="stat-info">
            <h3>Low Stock</h3>
            <span className="stat-number">{lowStock}</span>
            <span className="stat-link">Check health →</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="admin-card">
          <div className="card-header">
            <h2>Recent Orders</h2>
            <Link to="/admin/orders" style={{ fontSize: '0.8rem', color: '#008080', fontWeight: 700 }}>View All</Link>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order, index) => (
                  <tr key={order._id || order.id}>
                    <td data-label="#">{indexOfFirstItem + index + 1}</td>
                    <td data-label="Order ID" style={{ fontWeight: 700 }}>#{order.orderId || order._id}</td>
                    <td data-label="Customer">{order.customer}</td>
                    <td data-label="Total" style={{ fontWeight: 600 }}>GH₵{order.total}</td>
                    <td data-label="Status"><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-wrapper" style={{ padding: '1rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pagination-btn">Prev</button>
              <span style={{ alignSelf: 'center', fontSize: '0.8rem', fontWeight: 600 }}>{currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="pagination-btn">Next</button>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="card-header">
            <h2>Inventory Check</h2>
            <Link to="/admin/inventory" style={{ fontSize: '0.8rem', color: '#008080', fontWeight: 700 }}>View Full Health</Link>
          </div>
          <div className="inventory-alerts-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {products.filter(p => p.stock <= lowStockThreshold).slice(0, 8).map((prod, i) => (
              <div key={prod._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: prod.stock <= 2 ? '#fff5f5' : '#fffbeb', borderRadius: '16px', border: `1px solid ${prod.stock <= 2 ? '#fee2e2' : '#fef3c7'}` }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{prod.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: prod.stock <= 2 ? '#991b1b' : '#92400e', fontWeight: 800 }}>{prod.stock} items left</span>
                </div>
                <button style={{ color: prod.stock <= 2 ? '#991b1b' : '#92400e' }}><Package size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminProducts = ({ products, categories, deleteProduct, addProduct, updateProduct }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Pagination & Sorting (Newest First)
  const sortedProducts = [...products].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [showModal]);

  const [newProd, setNewProd] = useState({
    name: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: 'Luxury',
    description: '',
    comesWithPouch: false,
    images: [],
    discountPercentage: 0
  });

  const handleEdit = (prod) => {
    setEditingId(prod._id);
    setNewProd({
      name: prod.name || '',
      price: prod.price || '',
      discountPrice: prod.discountPrice || '',
      stock: prod.stock || '',
      category: prod.category || 'Luxury',
      description: prod.description || '',
      comesWithPouch: !!prod.comesWithPouch,
      images: prod.images || (prod.image ? [prod.image] : []),
      discountPercentage: prod.discountPercentage || 0
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setNewProd({ name: '', price: '', discountPrice: '', stock: '', category: 'Luxury', description: '', comesWithPouch: false, images: [], discountPercentage: 0 });
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));

    const token = localStorage.getItem('vision_auth_token');

    try {
      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: formData
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setNewProd(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
      } else {
        Swal.fire('Media Error', data.message || 'Image upload failed.', 'error');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      Swal.fire('Network Error', 'Image upload failed due to network issue.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index) => {
    const updatedImages = newProd.images.filter((_, i) => i !== index);
    setNewProd({ ...newProd, images: updatedImages });
  };

  const handleSoldOut = async (prod) => {
    const isSoldOut = prod.status === 'Sold Out' || prod.stock === 0 || !!prod.soldOutAt;

    const result = await Swal.fire({
      title: isSoldOut ? 'Restock Product?' : 'Mark as Sold Out?',
      text: isSoldOut ? "This will make the product active again." : "This will mark it as Sold Out and hide it from the shop after 3 days.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#008080',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, proceed'
    });

    if (result.isConfirmed) {
      if (isSoldOut) {
        await updateProduct(prod._id || prod.id, { soldOutAt: null, status: 'Active', stock: Math.max(1, prod.stock) });
      } else {
        await updateProduct(prod._id || prod.id, { soldOutAt: new Date().toISOString(), status: 'Sold Out', stock: 0 });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const priceVal = parseFloat(newProd.price);
    const discPercent = parseFloat(newProd.discountPercentage || 0);
    const calculatedDiscountPrice = discPercent > 0
      ? parseFloat((priceVal * (1 - discPercent / 100)).toFixed(2))
      : null;

    const finalProdData = {
      ...newProd,
      price: priceVal,
      discountPercentage: discPercent,
      discountPrice: calculatedDiscountPrice,
      stock: parseInt(newProd.stock),
      sizes: ['M', 'L'],
      image: newProd.images[0] || '/midnight.png'
    };

    let success = false;
    if (editingId) {
      success = await updateProduct(editingId, finalProdData);
    } else {
      success = await addProduct(finalProdData);
    }

    if (success) {
      closeModal();
    }
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Product Library</h1>
          <p>Displaying all {products.length} products</p>
        </div>
        <div className="header-actions">
          <button onClick={() => { setEditingId(null); setShowModal(true); }} className="cta-button-premium" style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', borderRadius: '12px' }}>
            <Plus size={16} /> Add Entry
          </button>
        </div>
      </header>

      {showModal && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-pull-handle"></div>
            <div className="modal-header-premium">
              <div>
                <h2 className="serif">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                <p>{editingId ? 'Refine the essence of this luxury item.' : 'Define the features and essence of your next luxury item.'}</p>
              </div>
              <button onClick={closeModal} className="sidebar-minimize-toggle">
                <X size={20} strokeWidth={2} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="modal-content-scroll">
                <div className="form-grid-2">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group-premium">
                      <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Product Identity</label>
                      <input type="text" required placeholder="name" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Price (GH₵)</label>
                        <input type="number" required placeholder="0.00" value={newProd.price} onChange={e => setNewProd({ ...newProd, price: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Discount (%)</label>
                        <input type="number" placeholder="2" value={newProd.discountPercentage} onChange={e => setNewProd({ ...newProd, discountPercentage: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                        {newProd.discountPercentage > 0 && newProd.price && (
                          <span style={{ fontSize: '0.7rem', color: '#008080', fontWeight: 600 }}>
                            Final: GH₵{(newProd.price * (1 - newProd.discountPercentage / 100)).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Initial Stock</label>
                        <input type="number" required placeholder="Units" value={newProd.stock} onChange={e => setNewProd({ ...newProd, stock: e.target.value })} style={{ width: '100%', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }} />
                      </div>
                    </div>
                    <div className="form-group-premium">
                      <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Collection Category</label>
                      <select value={newProd.category} onChange={e => setNewProd({ ...newProd, category: e.target.value })} style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem' }}>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group-premium">
                      <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.8rem', fontWeight: 700, color: '#334155' }}>Product Soul (Description)</label>
                      <textarea rows="5" placeholder="Narrate the story..." value={newProd.description} onChange={e => setNewProd({ ...newProd, description: e.target.value })} style={{ width: '100%', padding: '1.1rem', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', resize: 'none' }}></textarea>
                    </div>
                    <div className="form-group-premium" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <input type="checkbox" id="pouch-check" checked={newProd.comesWithPouch} onChange={e => setNewProd({ ...newProd, comesWithPouch: e.target.checked })} style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer', accentColor: '#008080' }} />
                      <label htmlFor="pouch-check" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', cursor: 'pointer', margin: 0 }}>Include Vision Spa Protective Pouch?</label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="form-group-premium" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.8rem', fontSize: '0.9rem', fontWeight: 700, color: '#313e50' }}>Catalogue Imagery</label>
                      <div className="media-upload-area" onClick={() => !isUploading && document.getElementById('image-upload').click()} style={{ opacity: isUploading ? 0.6 : 1, cursor: isUploading ? 'wait' : 'pointer' }}>
                        <Upload size={32} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                          {isUploading ? 'Uploading to cloud...' : 'Click to import high-res media'}
                        </p>
                        <input id="image-upload" type="file" multiple accept="image/*" hidden onChange={handleImageChange} disabled={isUploading} />
                      </div>
                    </div>

                    <div className="admin-images-grid">
                      {newProd.images.map((img, i) => (
                        <div key={i} style={{ position: 'relative', height: '80px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                          <img src={img && !img.startsWith('blob:') ? img : '/midnight.png'} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer-premium">
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '1.1rem', borderRadius: '16px', fontSize: '1rem', fontWeight: 600, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <X size={18} /> Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="cta-button-premium shadowed"
                  style={{
                    flex: 2,
                    padding: '1.1rem',
                    borderRadius: '16px',
                    fontSize: '1rem',
                    fontWeight: 800,
                    background: isUploading ? '#94a3b8' : 'var(--admin-sidebar-bg)',
                    color: 'white',
                    cursor: isUploading ? 'wait' : 'pointer',
                    opacity: isUploading ? 0.7 : 1
                  }}>
                  {isUploading ? 'Uploading Media...' : editingId ? 'Save Changes' : 'Finalize & Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((prod, index) => {
                const imgFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(prod.name || 'P')}&background=0d2f2f&color=fff&size=100`;
                return (
                  <tr key={prod._id || prod.id || index}>
                    <td data-label="#">{indexOfFirstItem + index + 1}</td>
                    <td data-label="Product">
                      <div className="flex items-center">
                        <img
                          src={prod.image && !prod.image.startsWith('blob:') ? prod.image : imgFallback}
                          className="table-product-img"
                          alt=""
                          style={{ width: '40px', height: '40px', borderRadius: '8px', marginRight: '1rem' }}
                        />
                        <div style={{ fontWeight: 700 }}>
                          {prod.name}
                          {prod.comesWithPouch && <span style={{ marginLeft: '6px', color: '#008080', fontSize: '0.7rem' }} title="Includes Pouch"><CheckCircle size={12} style={{ display: 'inline', marginBottom: '2px' }} /></span>}
                        </div>
                      </div>
                    </td>
                    <td data-label="Category">{prod.category}</td>
                    <td data-label="Price" style={{ fontWeight: 600 }}>GH₵{prod.price}</td>
                    <td data-label="Stock" style={{ fontWeight: 700, color: prod.stock <= 3 ? '#ef4444' : 'inherit' }}>{prod.stock}</td>
                    <td data-label="Status">
                      {prod.status === 'Sold Out' || prod.stock === 0 || !!prod.soldOutAt ? (
                        <span className="badge" style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '4px 8px', borderRadius: '4px' }}>Sold Out</span>
                      ) : (
                        <span className="badge badge-paid">Active</span>
                      )}
                    </td>
                    <td data-label="Actions">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleEdit(prod)} style={{ padding: '0.4rem', borderRadius: '6px', background: '#f1f5f9' }}><Edit3 size={14} /></button>
                        <button onClick={() => handleSoldOut(prod)} title={prod.status === 'Sold Out' || prod.stock === 0 || !!prod.soldOutAt ? "Restock" : "Mark Sold Out"} style={{ padding: '0.4rem', borderRadius: '6px', background: '#fef3c7', color: '#d97706' }}><PackageX size={14} /></button>
                        <button onClick={() => deleteProduct(prod._id || prod.id)} style={{ padding: '0.4rem', borderRadius: '6px', background: '#fee2e2', color: '#ef4444' }}><Trash size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, products.length)} of {products.length} entries</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="pagination-btn"
                style={{ opacity: currentPage === 1 ? 0.5 : 1 }}
              >Previous</button>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                    style={{
                      background: currentPage === i + 1 ? '#008080' : 'white',
                      color: currentPage === i + 1 ? 'white' : '#1e293b',
                      border: '1px solid #e2e8f0',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      fontWeight: 700,
                      minWidth: '36px'
                    }}
                  >{i + 1}</button>
                ))}
              </div>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="pagination-btn"
                style={{ opacity: currentPage === totalPages ? 0.5 : 1 }}
              >Next</button>
            </div>
          </div>
        )}
      </div>
    </div >
  );
};

const ReceiptModal = ({ order, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const receiptRef = React.useRef(null);

  if (!order) return null;

  const handleDownloadAndShare = async () => {
    setIsGenerating(true);
    const element = receiptRef.current;

    const opt = {
      margin: 10,
      filename: `Receipt_RC-${order.orderId?.split('-')[1]?.toUpperCase() || order._id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      // After download, open whatsapp sharing in a new tab
      const waText = `Hello ${order.customer}, thank you for your authentic luxury purchase from Vision Spa! We've attached your digital receipt RC-${order.orderId?.split('-')[1]?.toUpperCase() || order._id} for your records. Let us know if you need anything else!`;
      const waUrl = `https://wa.me/${order.phone ? order.phone.replace(/[^0-9]/g, '') : ''}?text=${encodeURIComponent(waText)}`;
      window.open(waUrl, '_blank');
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Could not generate receipt PDF.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose} style={{ zIndex: 1000001 }}>
      <div className="admin-modal-card modal-narrow" onClick={(e) => e.stopPropagation()} style={{ background: '#fff', padding: '0', border: '1px solid #eee' }}>
        <div ref={receiptRef} style={{ background: '#fff', padding: '2rem', position: 'relative', overflow: 'hidden' }}>
          {/* Watermark Logo */}
          <img src="/logo.jpeg" alt="Watermark" style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.08,
            width: '70%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f8fafc', paddingBottom: '1.5rem' }}>
              <h2 className="serif" style={{ color: '#008080', fontSize: '1.8rem', margin: '0' }}>Vision Spa</h2>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0.25rem 0' }}>The Essence of Luxury</p>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                Receipt #: RC-{order.orderId?.split('-')[1]?.toUpperCase() || order._id} | Date: {order.date}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Customer</span>
                <span style={{ fontWeight: 700 }}>{order.customer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Location</span>
                <span style={{ fontWeight: 700 }}>{order.location || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Payment Method</span>
                <span style={{ fontWeight: 700, color: order.payment === 'Paid' ? '#16a34a' : '#d97706' }}>{order.payment}</span>
              </div>
            </div>

            <div style={{ background: 'rgba(248, 250, 252, 0.8)', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '0.75rem', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                <span>Item</span>
                <div style={{ display: 'flex', gap: '3rem' }}>
                  <span>Qty</span>
                  <span>Price</span>
                </div>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                  <div style={{ display: 'flex', gap: '3.5rem' }}>
                    <span>x{item.qty}</span>
                    <span>GH₵{(order.total / item.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #008080', paddingTop: '1.5rem', marginTop: '1rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Total Amount</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#008080' }}>GH₵{order.total.toFixed(2)}</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '2.5rem', color: '#64748b', fontSize: '0.8rem', fontStyle: 'italic' }}>
              Thank you for choosing luxury. Visit again!
            </div>
          </div>
        </div>

        <div className="modal-footer-premium" style={{ marginTop: '0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px', padding: '1.5rem' }}>
          <button className="btn-cancel-premium" onClick={onClose} style={{ flex: 1 }}>Close</button>
          <button className="cta-button-premium" style={{ flex: 1 }} onClick={handleDownloadAndShare} disabled={isGenerating}>
            {isGenerating ? 'Processing...' : <><Download size={16} /> Save PDF & WA</>}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminOrders = ({ orders, addOrder, updateOrder, products }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    if (showModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [showModal]);
  const [newOrder, setNewOrder] = useState({ customer: '', phone: '', location: '', productName: products[0]?.name || '', qty: 1, payment: 'Unpaid' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const prod = products.find(p => p.name === newOrder.productName) || products[0];
    if (!prod) return; // Prevent crash if no products exist
    addOrder({
      customer: newOrder.customer,
      phone: newOrder.phone,
      location: newOrder.location,
      items: [{ name: newOrder.productName, qty: parseInt(newOrder.qty) }],
      total: prod.price * newOrder.qty,
      payment: newOrder.payment,
      status: 'Processing'
    });
    setShowModal(false);
    setNewOrder({ customer: '', phone: '', location: '', productName: products[0]?.name || '', qty: 1, payment: 'Unpaid' });
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Order Book</h1>
          <p>Manual WhatsApp Sales Entry — {orders.length} Records</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowModal(true)} className="cta-button-premium" style={{ padding: '0.8rem 1.5rem', fontSize: '0.75rem', borderRadius: '12px' }}>
            <Plus size={16} /> Record Sale
          </button>
        </div>
      </header>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-card modal-narrow" onClick={(e) => e.stopPropagation()}>
            <div className="modal-pull-handle"></div>
            <div className="modal-header-premium">
              <div>
                <h2 className="serif">Record New Sale</h2>
                <p>Create a manual order for offline or WhatsApp sales.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="sidebar-minimize-toggle">
                <X size={18} strokeWidth={2} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="modal-content-scroll">
                <div className="form-group">
                  <label>Customer Name</label>
                  <input type="text" required value={newOrder.customer} onChange={e => setNewOrder({ ...newOrder, customer: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>WhatsApp / Phone</label>
                  <input type="text" value={newOrder.phone} onChange={e => setNewOrder({ ...newOrder, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Shipping Location</label>
                  <input type="text" placeholder="e.g. Accra, Osu" value={newOrder.location} onChange={e => setNewOrder({ ...newOrder, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Select Product</label>
                  <select value={newOrder.productName} onChange={e => setNewOrder({ ...newOrder, productName: e.target.value })}>
                    {products.length > 0 ? (
                      products.map((p, idx) => <option key={p._id || p.id || idx} value={p.name}>{p.name}</option>)
                    ) : (
                      <option disabled>No products available</option>
                    )}
                  </select>
                </div>
                <div className="form-grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.25rem' }}>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" min="1" value={newOrder.qty} onChange={e => setNewOrder({ ...newOrder, qty: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Payment State</label>
                    <select value={newOrder.payment} onChange={e => setNewOrder({ ...newOrder, payment: e.target.value })}>
                      <option>Unpaid</option>
                      <option>Paid</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer-premium">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel-premium">
                  <X size={16} /> Close
                </button>
                <button type="submit" className="cta-button-premium shadowed" style={{ flex: 2, padding: '1rem', borderRadius: '14px' }}>
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-card" style={{ padding: '0' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((order, index) => (
                <tr key={order._id || order.id}>
                  <td data-label="#">{indexOfFirstItem + index + 1}</td>
                  <td data-label="Order ID" style={{ fontWeight: 700, color: '#008080' }}>#{order.orderId || order.id}</td>
                  <td data-label="Customer">
                    <div style={{ fontWeight: 600 }}>{order.customer}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.phone}</div>
                  </td>
                  <td data-label="Location" style={{ fontSize: '0.85rem' }}>{order.location || 'N/A'}</td>
                  <td data-label="Price" style={{ fontWeight: 700 }}>GH₵{order.total}</td>
                  <td data-label="Payment"><span className={`badge ${order.payment === 'Paid' ? 'badge-paid' : 'badge-unpaid'}`}>{order.payment}</span></td>
                  <td data-label="Status"><span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></td>
                  <td data-label="Actions" style={{ textAlign: 'center' }}>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrder(order._id || order.id, { status: e.target.value })}
                      style={{
                        padding: '0.4rem 0.5rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        color: '#334155',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Blocked">Blocked</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, orders.length)} of {orders.length} lines</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pagination-btn">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="pagination-btn">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedReceipt && (
        <ReceiptModal order={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
};

const AdminReceipts = ({ orders }) => {
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Generate Receipt</h1>
          <p>Pick an order and tap to generate its receipt. {orders.length} order{orders.length !== 1 ? 's' : ''} available.</p>
        </div>
      </header>

      <div className="admin-card" style={{ padding: '0' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                <th>Receipt #</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Category</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((order, index) => (
                <tr key={order._id || order.id}>
                  <td data-label="#">{indexOfFirstItem + index + 1}</td>
                  <td data-label="Receipt #" style={{ fontWeight: 700 }}>RC-{order.orderId?.split('-')[1] || order.id?.split('-')[1] || (order._id ? order._id.substring(order._id.length - 4) : '0000')}</td>
                  <td data-label="Customer">{order.customer}</td>
                  <td data-label="Product">{order.items[0]?.name || 'N/A'}</td>
                  <td data-label="Category">{order.items[0]?.category || 'N/A'}</td>
                  <td data-label="Qty">{order.items[0]?.qty || '1'}</td>
                  <td data-label="Total">GH₵{order.total}</td>
                  <td data-label="Payment">
                    <span className={`badge ${order.payment === 'Paid' ? 'badge-success' : 'badge-warning'}`} style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      background: order.payment === 'Paid' ? '#f0fdf4' : '#fffbeb',
                      color: order.payment === 'Paid' ? '#16a34a' : '#d97706'
                    }}>
                      {order.payment}
                    </span>
                  </td>
                  <td data-label="Date">{order.date}</td>
                  <td data-label="Actions">
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setSelectedReceipt(order)}
                        style={{
                          padding: '0.6rem 1rem',
                          borderRadius: '10px',
                          background: '#008080',
                          color: 'white',
                          border: 'none',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          width: 'max-content'
                        }}
                      >
                        <Receipt size={14} />
                        Receipt
                      </button>

                      {order.payment !== 'Paid' && (
                        <button
                          onClick={() => updateOrder(order._id || order.id, { payment: 'Paid' })}
                          style={{
                            padding: '0.6rem 1rem',
                            borderRadius: '10px',
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            width: 'max-content'
                          }}
                        >
                          <CheckCircle size={14} />
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Page {currentPage} of {totalPages}</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pagination-btn">Back</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="pagination-btn">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedReceipt && (
        <ReceiptModal order={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
};


const AdminCategories = ({ categories, setCategories }) => {
  const [newCat, setNewCat] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const add = async (e) => {
    e.preventDefault();
    if (newCat && !categories.includes(newCat)) {
      try {
        const data = await apiRequest('/categories', 'POST', { name: newCat.trim() });
        if (data.success) {
          setCategories([...categories, data.data.name]);
        }
      } catch (err) {
        setCategories([...categories, newCat.trim()]);
      }
    }
    setNewCat('');
  };

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Category Manager</h1>
          <p>Organize collections — {categories.length} Tiers</p>
        </div>
      </header>

      <div className="admin-card">
        <div className="card-header" style={{ marginBottom: '2rem' }}>
          <form onSubmit={add} style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <input type="text" placeholder="New Category Name" value={newCat} onChange={e => setNewCat(e.target.value)} style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
            <button type="submit" className="cta-button-premium" style={{ borderRadius: '12px' }}><Plus size={20} /></button>
          </form>
        </div>

        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category Title</th>
                <th style={{ textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {currentCategories.map((cat, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700 }}>{cat}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => setCategories(categories.filter(c => c !== cat))} style={{ color: '#ef4444', background: '#fee2e2', padding: '0.5rem', borderRadius: '8px' }}>
                      <Trash size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pagination-btn">Prev</button>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="pagination-btn">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminInventory = ({ products }) => {
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(products.length / itemsPerPage);

  return (
    <div className="dashboard-view fade-in">
      <header className="admin-header">
        <div className="page-title">
          <h1 className="serif">Inventory Health</h1>
          <p>Real-time stock tracking — {products.length} Items</p>
        </div>
      </header>

      <div className="admin-card" style={{ padding: '0' }}>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Available Stock</th>
                <th>Safety Level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(p => (
                <tr key={p._id || p.id}>
                  <td data-label="Product"><div style={{ fontWeight: 700 }}>{p.name}</div></td>
                  <td data-label="Available Stock">{p.stock} units</td>
                  <td data-label="Safety Level">
                    <div style={{ width: '100%', maxWidth: '150px', height: '10px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginLeft: 'auto' }}>
                      <div style={{ width: `${Math.min(100, (p.stock / 20) * 100)}%`, height: '100%', background: p.stock <= 3 ? '#ef4444' : '#008080' }}></div>
                    </div>
                  </td>
                  <td data-label="Status">
                    {p.stock <= 3 ? <span className="badge badge-unpaid">Low Stock</span> : <span className="badge badge-paid">Healthy</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pagination-btn">Prev</button>
              <span style={{ alignSelf: 'center', fontWeight: 600 }}>{currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="pagination-btn">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const App = () => {
  // --- ADMIN & AUTH STATE ---
  const [products, setProducts] = useState(allProducts);
  const [categories, setCategories] = useState(['Luxury', 'Elite', 'Men']);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initial Data Fetching
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);

      // Load categories first
      const catRes = await apiRequest('/categories');
      if (catRes.success && catRes.data?.length > 0) {
        setCategories([...new Set(catRes.data.map(c => c.name))]);
      } else {
        // Fallback default from derived static objects if needed
        setCategories(['Luxury', 'Elite', 'Men']);
      }

      // Load public products
      const prodRes = await apiRequest('/products');
      if (prodRes.success && prodRes.data?.length > 0) {
        setProducts(prev => {
          const existingNames = new Set(prodRes.data.map(p => p.name));
          const filteredStatic = prev.filter(p => !existingNames.has(p.name));
          return [...filteredStatic, ...prodRes.data];
        });

        const productCategories = prodRes.data.map(p => p.category).filter(Boolean);
        setCategories(prev => [...new Set([...prev, ...productCategories])]);
      }

      // Verify Auth (Cookie-based)
      const verifyRes = await apiRequest('/auth/me');
      if (verifyRes.success) {
        setUser(verifyRes.data);
        const ordRes = await apiRequest('/orders');
        if (ordRes.success) setOrders(ordRes.data);
      }

      setLoading(false);
    };
    initApp();
  }, []); // Only on mount now

  const handleLogin = (userData) => {
    if (userData.token) {
      localStorage.setItem('vision_auth_token', userData.token);
    }
    setUser(userData);
  };

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Sign Out?',
      text: "Are you sure you want to end your session?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#008080',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Sign Out',
      background: '#fff',
      color: '#1e293b'
    });

    if (result.isConfirmed) {
      await apiRequest('/auth/logout'); // Clear cookie on backend
      localStorage.removeItem('vision_auth_token');
      setUser(null);
      Swal.fire({
        title: 'Signed Out',
        text: 'Come back soon!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const addProduct = async (newProduct) => {
    const res = await apiRequest('/products', 'POST', newProduct);
    if (res.success) {
      setProducts(prev => [res.data, ...prev]);
      Swal.fire({
        title: 'Product Added!',
        text: `${res.data.name} has been published to the catalog.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        iconColor: '#008080'
      });
    }
    return res.success;
  };

  const updateProduct = async (id, updated) => {
    const res = await apiRequest(`/products/${id}`, 'PUT', updated);
    if (res.success) {
      setProducts(prev => prev.map(p => p._id === id ? res.data : p));
      Swal.fire({
        title: 'Updated!',
        text: 'Product details have been synchronized.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        iconColor: '#008080'
      });
    }
    return res.success;
  };

  const deleteProduct = async (id) => {
    // Confirm before delete
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This product will be permanently removed.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#008080',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      const res = await apiRequest(`/products/${id}`, 'DELETE', null);
      if (res.success) {
        setProducts(prev => prev.filter(p => p._id !== id));
        Swal.fire({
          title: 'Deleted!',
          text: 'The product has been removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
      return res.success;
    }
    return false;
  };

  const addOrder = async (newOrder) => {
    const res = await apiRequest('/orders', 'POST', newOrder); // Orders can be public
    if (res.success) {
      Swal.fire({
        title: 'Sale Recorded!',
        text: `Order ${res.data.orderId} has been successfully saved.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        iconColor: '#008080'
      });

      if (user) setOrders(prev => [res.data, ...prev]); // Update admin list if logged in

      // Update local product stocks to match server
      if (res.data.items) {
        res.data.items.forEach(item => {
          setProducts(prev => prev.map(p => p.name === item.name ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p));
        });
      }
    }
    return res.success;
  };

  const updateOrder = async (id, updated) => {
    const res = await apiRequest(`/orders/${id}`, 'PUT', updated);
    if (res.success) {
      setOrders(prev => prev.map(o => o._id === id ? res.data : o));
      Swal.fire({
        title: 'Status Updated!',
        text: `Order status has been updated successfully.`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
        iconColor: '#008080'
      });
    } else {
      Swal.fire('Error', res.message || 'Could not update order', 'error');
    }
    return res.success;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loader-premium"></div>
      </div>
    );
  }

  return (
    <CartProvider>
      <ModalProvider>
        <Router>
          <div className="app">
            <Navbar />
            {user?.needsPasswordChange && <ForcePasswordChangeModal setUser={setUser} />}
            <Routes>
              <Route path="/" element={<HomePage products={products} categories={categories} />} />
              <Route path="/shop" element={<ShopPage products={products} categories={categories} />} />
              <Route path="/collections" element={<CollectionsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
              <Route
                path="/admin/*"
                element={
                  user ? (
                    <AdminDashboard
                      products={products}
                      categories={categories}
                      orders={orders}
                      addProduct={addProduct}
                      updateProduct={updateProduct}
                      deleteProduct={deleteProduct}
                      addOrder={addOrder}
                      updateOrder={updateOrder}
                      setCategories={setCategories}
                      user={user}
                      onLogout={handleLogout}
                    />
                  ) : (
                    <AuthPage onLogin={handleLogin} />
                  )
                }
              />
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
