import React from 'react';
import { Link } from 'react-router-dom';

const CollectionCard = ({ title, image, link }) => (
  <div className="collection-card reveal">
    <img src={image} alt={title} />
    <div className="collection-info">
      <h3 className="collection-title serif">{title}</h3>
      <Link to="/shop" className="collection-link">Discover More</Link>
    </div>
  </div>
);

export default CollectionCard;
