import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Headset, X, Phone, MessageCircle, ArrowRight } from 'lucide-react';

const SupportBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  if (location.pathname === '/auth' || location.pathname.startsWith('/admin')) return null;

  return (
    <div className={`support-bot-container ${isOpen ? 'open' : ''}`}>
      <button className="support-launcher" onClick={() => setIsOpen(!isOpen)}>
        <Headset size={28} />
      </button>

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
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportBot;
