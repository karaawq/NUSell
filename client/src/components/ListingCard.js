//for each listing, display a card with the listing's details

import React from 'react';
import { Link } from 'react-router-dom';

const CONDITION_BADGE = {
  'new': 'ns-badge-new', 'like-new': 'ns-badge-like-new', 'good': 'ns-badge-good', 'fair': 'ns-badge-fair',
};
const CONDITION_LABEL = {
  'new': 'Brand New', 'like-new': 'Like New', 'good': 'Good', 'fair': 'Fair',
};

//for if user doesnt put any image
const FALLBACK_IMG = 'https://media.tenor.com/OeGnPBoP_gUAAAAe/monkey-thinking.png';

export default function ListingCard({ listing }) {
  return (
    <Link to={`/listing/${listing._id}`} className="ns-listing-card">
      <div className="ns-listing-img">
        <img
          src={listing.imageUrl || FALLBACK_IMG} //if user no image use above image
          alt={listing.title}
          onError={e => { e.target.src = FALLBACK_IMG; }}
        />
        <span className={`ns-badge ${CONDITION_BADGE[listing.condition]}`}>
          {CONDITION_LABEL[listing.condition]}
        </span>
      </div>
      <div className="ns-listing-body">
        <div className="ns-listing-title">{listing.title}</div>
        <div className="ns-listing-price-row">
          <span className="ns-listing-price">${listing.price}</span>
          <span className="ns-listing-tag">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            {listing.category}
          </span>
        </div>
        <div className="ns-listing-meta">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {listing.location}
        </div>
      </div>
    </Link>
  );
}