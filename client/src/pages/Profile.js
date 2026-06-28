//profile page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';

//badges include in ms3, see what icons we want to put

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwn = user?._id === id;

  useEffect(() => {
    Promise.all([
      api.get(`/auth/users/${id}`),
      api.get(`/listings/user/${id}`),
    ])
      .then(([userRes, listingsRes]) => {
        setProfileUser(userRes.data);
        setListings(listingsRes.data);
      })
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return <div className="ns-page"><Navbar /><div className="ns-loading">Loading…</div></div>;
  }
  if (!profileUser) {
    return null;
  }

  return (
    <div className="ns-page">
      <Navbar />
      <div className="ns-container" style={{ paddingTop: '1.5rem', paddingBottom: '3rem' }}>
        <button className="ns-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>

        {/* Profile card */}
        <div className="ns-card ns-mb-4" style={{ overflow: 'hidden' }}>
          <div className="ns-profile-banner" />
          <div className="ns-profile-body">
            <div className="ns-profile-top">
              <div className={`ns-avatar ns-avatar-xl`} style={{ background: 'rgba(26,71,49,0.1)', color: 'var(--c-primary)' }}>
                {profileUser.username?.[0]?.toUpperCase()}
              </div>
              {isOwn && (
                <a href={`https://t.me/${profileUser.telegram}`} target="_blank" rel="noopener noreferrer"
                  className="ns-btn ns-btn-secondary ns-btn-sm">
                  Edit Profile ↗
                </a>
              )}
            </div>

            <h2 style={{ fontSize: '1.5rem', marginTop: 8 }}>{profileUser.username}</h2>
            {profileUser.telegram && (
              <a href={`https://t.me/${profileUser.telegram}`} target="_blank" rel="noopener noreferrer"
                className="ns-text-xs" style={{ color: 'var(--c-primary)', marginTop: 2, display: 'inline-block' }}>
                @{profileUser.telegram} ↗
              </a>
            )}

            <div className="ns-profile-stats"> {/* include points in future here */}
              <div className="ns-stat"><div className="ns-stat-val">{listings.length}</div><div className="ns-stat-label">Active listings</div></div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="ns-flex-between ns-mb-4">
          <h2 style={{ fontSize: '1.25rem' }}>
            {isOwn ? 'My Listings' : `${profileUser.username}'s Listings`}
          </h2>
          {isOwn && <Link to="/listing/new" className="ns-btn ns-btn-primary ns-btn-sm">+ New Listing</Link>}
        </div>

        {listings.length === 0 ? (
          <div className="ns-card">
            <div className="ns-empty">
              <div className="ns-empty-icon">📦</div>
              <h3>{isOwn ? 'You have no active listings' : 'No active listings'}</h3>
              {isOwn && <div className="ns-empty-actions"><Link to="/listing/new" className="ns-btn ns-btn-primary">Create your first listing</Link></div>}
            </div>
          </div>
        ) : (
          <div className="ns-listings-grid">
            {listings.map(l => <ListingCard key={l._id} listing={l} />)}
          </div>
        )}
      </div>
    </div>
  );
}