import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import ReputationBadge from '../components/ReputationBadge';

const COND_LABEL = { 'new': 'Brand New', 'like-new': 'Like New', 'good': 'Good', 'fair': 'Fair' };
const COND_CLS = { 'new': 'ns-badge-new', 'like-new': 'ns-badge-like-new', 'good': 'ns-badge-good', 'fair': 'ns-badge-fair' };
const FALLBACK = 'https://media.tenor.com/OeGnPBoP_gUAAAAe/monkey-thinking.png';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '2rem', lineHeight: 1, padding: '2px',
            color: n <= display ? '#f59e0b' : '#d1d5db',
            transform: hovered === n ? 'scale(1.2)' : 'scale(1)',
            transition: 'transform 0.1s, color 0.1s',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [listing,  setListing]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error,    setError]    = useState('');
  //new for rep system
  const [stars,     setStars]     = useState(5);
  const [awarding,  setAwarding]  = useState(false);
  const [awardDone, setAwardDone] = useState(false);
  const [awardedStars, setAwardedStars] = useState(null);

  useEffect(() => {
    api.get(`/listings/${id}`)
      .then(res => {
        setListing(res.data);
        if (res.data.userHasAwarded) {
          setAwardDone(true);
          setAwardedStars(res.data.userAwardStars);
        }
      })
      .catch(() => setError('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const isSeller = listing && user?._id === listing.seller?._id;
  
  //new for rep system
  const handleAward = async () => {
    setAwarding(true);
    try {
      const res = await api.post(`/listings/${id}/award`, { stars });
      setAwardDone(true);
      setAwardedStars(stars);
      // reflect seller's new points live
      setListing(l => ({ ...l, seller: { ...l.seller, points: l.seller.points + res.data.sellerPoints } }));
      // reflect buyer's new points in navbar/profile without a refresh
      updateUser(res.data.buyer);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setAwarding(false);
    }
  };

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

            {/* Seller */}
            <div className="ns-card ns-card-body">
              <h3 className="ns-section-title">Seller</h3>
              <Link to={`/profile/${listing.seller._id}`} className="ns-seller-row ns-mt-3">
                <div className="ns-avatar" style={{ width: 44, height: 44, fontSize: '1.1rem' }}>
                  {listing.seller.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="ns-seller-name">{listing.seller.username}</div>
                  <ReputationBadge points={listing.seller.points} small showPoints />
                </div>
              </Link>
              {!isSeller && (
                <a href={`https://t.me/${listing.seller.telegram}`} target="_blank" rel="noopener noreferrer" className="ns-tg-btn">
                  💬 Contact via Telegram
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                </a>
              )}
            </div>

            {/* Transaction review — buyers only */}
            {!isSeller && (
              <div className="ns-card ns-card-body">
                <h3 className="ns-section-title">Complete Transaction</h3>

                {awardDone ? (
                  <>
                    <div className="ns-success-msg ns-mt-3">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 20 4 10"/></svg>
                      Transaction reviewed!
                    </div>
                    <div style={{ marginTop: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: '1.5rem', letterSpacing: 2 }}>
                        {[1,2,3,4,5].map(n => (
                          <span key={n} style={{ color: n <= awardedStars ? '#f59e0b' : '#d1d5db' }}>★</span>
                        ))}
                      </div>
                      <p className="ns-text-xs ns-mt-2">
                        You gave {awardedStars} star{awardedStars !== 1 ? 's' : ''} · Seller earned {awardedStars * 10} pts · You earned 10 pts
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="ns-text-xs ns-mt-2" style={{ marginBottom: 12 }}>
                      Happy with the transaction? Rate your seller to complete it.
                    </p>
                    <StarPicker value={stars} onChange={setStars} />

                    {/* Points preview */}
                    <div style={{
                      background: 'var(--c-input-bg)', borderRadius: 'var(--radius)',
                      padding: '8px 12px', marginBottom: 12, fontSize: '0.78rem', color: 'var(--c-muted)',
                      display: 'flex', flexDirection: 'column', gap: 3,
                    }}>
                      <span>🏆 Seller earns <strong style={{ color: 'var(--c-primary)' }}>{stars * 10} pts</strong> ({stars} star{stars !== 1 ? 's' : ''} × 10)</span>
                      <span>🎁 You earn <strong style={{ color: 'var(--c-primary)' }}>10 pts</strong> for reviewing</span>
                    </div>

                    <button className="ns-btn ns-btn-accent ns-btn-full" onClick={handleAward} disabled={awarding || stars === 0}>
                      {awarding ? 'Submitting…' : `Submit Review · ${stars} Star${stars !== 1 ? 's' : ''}`}
                    </button>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}