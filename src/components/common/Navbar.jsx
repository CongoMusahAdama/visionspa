import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Heart, Menu, X, LayoutDashboard, Instagram, Facebook, Twitter } from 'lucide-react';
import NavCartButton from './NavCartButton';
import SearchOverlay from './SearchOverlay';

const Navbar = ({ user }) => {
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
              <Link to="/gallery" className="nav-link">Gallery</Link>
              <Link to="/track" className="nav-link" style={{ color: '#008080', fontWeight: 700 }}>Track Order</Link>
            </nav>
          </div>

          <div className="nav-icons">
            <button className="icon-link" onClick={() => setIsSearchOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', position: 'relative' }}>
              <span className="nav-icon-label">Search</span>
              <Search size={20} strokeWidth={1.5} />
            </button>
            {user ? (
              <Link to="/admin" className="icon-link" title="Dashboard">
                <LayoutDashboard size={20} strokeWidth={1.5} />
                <span className="nav-icon-label" style={{ color: '#008080', fontWeight: 700 }}>Admin</span>
              </Link>
            ) : (
              <Link to="/auth" className="icon-link"><User size={20} strokeWidth={1.5} /></Link>
            )}
            <a href="#" className="icon-link desktop-only"><Heart size={20} strokeWidth={1.5} /></a>
            <NavCartButton />
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

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
          <Link to="/gallery" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Gallery</Link>
          <Link to="/track" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#008080', fontWeight: 700 }}>Track Order</Link>

          {user && (
            <Link to="/admin" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)} style={{ color: '#008080', fontWeight: 800 }}>Admin Dashboard</Link>
          )}
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

export default Navbar;
