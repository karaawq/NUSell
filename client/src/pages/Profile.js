//profile page

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import ReputationBadge, { BADGE_LEVELS, getBadgeInfo, getLevelFloor } from '../components/ReputationBadge';

//badges include in ms3, see what icons we want to put

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user , updateUser} = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

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
  
  const handleSave = (updatedUser) => {
    setProfileUser(prev => ({ ...prev, ...updatedUser }));
    updateUser(updatedUser); // keeps Navbar username in sync
  };

  if (loading) {
    return <div className="ns-page"><Navbar /><div className="ns-loading">Loading…</div></div>;
  }
  if (!profileUser) {
    return null;
  }

  const points = profileUser.points ?? 0; //check schema field name and update accordingly

  return (
    <div className="ns-page">
      <Navbar />

      {showEdit && (
        <EditProfileModal
          profileUser={profileUser}
          onClose={() => setShowEdit(false)}
          onSave={handleSave}
        />
      )}

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
                <button className="ns-btn ns-btn-secondary ns-btn-sm" onClick={() => setShowEdit(true)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Profile ↗
                </button>
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
              <div className="ns-stat"><div className="ns-stat-val">{points}</div><div className="ns-stat-label">Reputation pts</div></div>           
            </div>

            {/* Reputation badge + progress bar */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--c-border)' }}>
              <ReputationBadge points={points} showPoints />
              <ProgressBar points={points} />
            </div>

            {/* Badges earned showcase */}
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--c-border)' }}>
              <p className="ns-text-xs" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6, marginBottom: 8 }}>
                Badges Earned
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {BADGE_LEVELS.map(b => {
                  const earned = points >= b.pts;
                  return (
                    <span
                      key={b.label}
                      className={`ns-rep ${b.cls} ns-rep-sm`}
                      style={{ opacity: earned ? 1 : 0.35 }}
                      title={earned ? `Earned at ${b.pts} pts` : `Unlocks at ${b.pts} pts`}
                    >
                      <span>{b.icon}</span>
                      <span>{b.label}</span>
                    </span>
                  );
                })}
              </div>
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

function EditProfileModal({profileUser, onClose, onSave}) {
    const [form, setForm] = useState({ username: profileUser.username, telegram: profileUser.telegram || '' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
  
    const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
  
    const handleSubmit = async e => {
      e.preventDefault();
      setError('');
      if (form.username.trim().length < 6) { setError('Username must be at least 6 characters.'); return; }
  
      setSaving(true);
      try {
        const res = await api.put('/auth/me', {
          username: form.username.trim(),
          telegram: form.telegram.replace(/^@/, '').trim(),
        });
        setSuccess(true);
        onSave(res.data);
        setTimeout(onClose, 900);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to save changes');
      } finally {
        setSaving(false);
      }
    };
  
    return (
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{ background: 'var(--c-card)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--c-border)', width: '100%', maxWidth: 420, boxShadow: 'var(--shadow-lg)' }}
        >
          {/* header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--c-border)' }}>
            <h3 style={{ fontSize: '1.125rem', margin: 0 }}>Edit Profile</h3>
            <button onClick={onClose} className="ns-btn ns-btn-ghost" style={{ padding: '6px' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
  
          {/* body */}
          <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
            {error && (
              <div className="ns-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
  
            {success && (
              <div className="ns-success-msg" style={{ marginBottom: '1rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 20 4 10"/></svg>
                Profile updated!
              </div>
            )}
  
            <div className="ns-form-group">
              <label className="ns-label">Username</label>
              <input
                className="ns-input"
                type="text"
                value={form.username}
                onChange={set('username')}
                minLength={6}
                required
                placeholder="e.g. johndoe99"
              />
              <p className="ns-hint">Minimum 6 characters</p>
            </div>
  
            <div className="ns-form-group">
              <label className="ns-label">Telegram Handle</label>
              <div className="ns-input-prefix">
                <span className="ns-prefix">@</span>
                <input
                  className="ns-input"
                  type="text"
                  value={form.telegram}
                  onChange={e => setForm(f => ({ ...f, telegram: e.target.value.replace(/^@/, '') }))}
                  placeholder="yourusername"
                />
              </div>
              <p className="ns-hint">Buyers use this to contact you for meetups</p>
            </div>
  
            <div className="ns-grid-2" style={{ marginTop: '0.5rem' }}>
              <button type="button" className="ns-btn ns-btn-secondary ns-btn-full" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="ns-btn ns-btn-primary ns-btn-full" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}

//////
// REP BADGE
//////

function ProgressBar({ points }) {
  const badge = getBadgeInfo(points);
  if (!badge.next) return <p className="ns-text-xs ns-mt-2">Maximum level reached 👑</p>;
  const floor = getLevelFloor(points);
  const pct   = Math.min(100, ((points - floor) / (badge.nextAt - floor)) * 100);
  return (
    <div className="ns-mt-2">
      <div className="ns-flex-between ns-text-xs" style={{ marginBottom: 6 }}>
        <span>{points - floor} / {badge.nextAt - floor} pts to {badge.next}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div className="ns-progress-track">
        <div className="ns-progress-bar" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}