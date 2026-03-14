import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight } from 'lucide-react';

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

export default SearchOverlay;
