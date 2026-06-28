import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';

const COND_LABEL = { 'new': 'Brand New', 'like-new': 'Like New', 'good': 'Good', 'fair': 'Fair' };
const COND_CLS = { 'new': 'ns-badge-new', 'like-new': 'ns-badge-like-new', 'good': 'ns-badge-good', 'fair': 'ns-badge-fair' };
const FALLBACK = 'https://media.tenor.com/OeGnPBoP_gUAAAAe/monkey-thinking.png';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing,  setListing]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error,    setError]    = useState('');

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => { 
        setListing(res.data);
      })
      .catch(() => setError('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const isSeller = listing && user?._id === listing.seller?._id;

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/listings/${id}`);
      navigate('/dashboard');
    } catch {
      setDeleting(false);
    }
  };

  if (loading) return <div className="ns-page"><Navbar /><div className="ns-loading">Loading…</div></div>;
  if (error || !listing) return (
    <div className="ns-page">
      <Navbar />
      <div className="ns-empty" style={{ paddingTop: '5rem' }}>
        <div className="ns-empty-icon">🔍</div>
        <h3>Listing not found</h3>
        <p>This item may have been removed.</p>
        <div className="ns-empty-actions"><Link to="/dashboard" className="ns-btn ns-btn-primary">Browse listings</Link></div>
      </div>
    </div>
  );

  return (
    <div className="ns-page">
      <Navbar />
      <div className="ns-container">
        <button className="ns-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>

        <div className="ns-detail-layout">
          {/* Main column */}
          <div>
            <div className="ns-card" style={{ overflow: 'hidden' }}>
              <div className="ns-detail-img">
                <img src={listing.imageUrl || FALLBACK} alt={listing.title} onError={e => { e.target.src = FALLBACK; }} />
              </div>
              <div className="ns-card-body">
                <div className="ns-flex-center ns-gap-2" style={{ flexWrap: 'wrap', marginBottom: '10px' }}>
                  <span className={`ns-cond-badge ${COND_CLS[listing.condition]}`}>{COND_LABEL[listing.condition]}</span>
                  <span className="ns-text-xs"># {listing.category}</span>
                </div>
                <div className="ns-flex-between" style={{ alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  <h2 style={{ fontSize: '1.5rem' }}>{listing.title}</h2>
                  <span style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--c-primary)', flexShrink: 0 }}>${listing.price}</span>
                </div>

                <div className="ns-detail-meta">
                  <span className="ns-detail-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {listing.location}
                  </span>
                  <span className="ns-detail-meta-item">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <hr className="ns-divider" />
                <h3 className="ns-section-title">Description</h3>
                <p className="ns-desc-text">{listing.description}</p>

                {isSeller && (
                  <>
                    <hr className="ns-divider" />
                    <div className="ns-flex-center ns-gap-2" style={{ flexWrap: 'wrap' }}>
                      <Link to={`/listing/${id}/edit`} className="ns-btn ns-btn-secondary">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </Link>
                      {!confirmDel ? (
                        <button className="ns-btn ns-btn-danger" onClick={() => setConfirmDel(true)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                          Delete
                        </button>
                      ) : (
                        <div className="ns-delete-confirm">
                          <span className="ns-text-muted">Are you sure?</span>
                          <button className="ns-btn ns-btn-danger ns-btn-sm" onClick={handleDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Yes, delete'}</button>
                          <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => setConfirmDel(false)}>Cancel</button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Seller card */}
            <div className="ns-card ns-card-body">
              <h3 className="ns-section-title">Seller</h3>
              <Link to={`/profile/${listing.seller._id}`} className="ns-seller-row ns-mt-3">
                <div className="ns-avatar" style={{ width: 44, height: 44, fontSize: '1.1rem' }}>
                  {listing.seller.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="ns-seller-name">{listing.seller.username}</div>
                </div>
              </Link>
              {!isSeller && (
                <a
                  href={`https://t.me/${listing.seller.telegram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ns-tg-btn"
                >
                  💬 Contact via Telegram
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              )}
            </div>

            {/* Safety tip */}
            <div className="ns-safety">
              <div className="ns-safety-title">⚠️ Safety tip</div>
              <div className="ns-safety-text">Always meet in public, well-lit areas on campus. Inspect items before paying. Never transfer money before seeing the item.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}