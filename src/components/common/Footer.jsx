import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MessageCircle, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

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
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><Link to="/track" style={{ color: '#008080', fontWeight: 800 }}>Track My Order</Link></li>
              <li><Link to="/about">Our Story</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Connect</h4>
            <ul className="footer-links">
              <li><a href="#" className="flex items-center gap-2"><Instagram size={16} /> Instagram</a></li>
              <li><a href="#" className="flex items-center gap-2"><Facebook size={16} /> Facebook</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 Vision Spa. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
