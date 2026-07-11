//for giveaway page

import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';

const CATEGORIES = ['Electronics','Books & Notes','Clothing & Accessories','Furniture','Sports & Fitness','Kitchen & Home','Beauty & Personal Care','Others'];
const LOCATIONS = ['UTown','Science','Engineering','Arts & Social Science','Business','Computing','Medicine','Law','Online / Others'];

export default function Giveaway() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selCategories, setSelCategories] = useState([]);
  const [selLocation, setSelLocation] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    api.get('/listings?isFree=true')
      .then(res => setListings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (selCategories.length && !selCategories.includes(l.category)) return false;
      if (selLocation && l.location !== selLocation) return false;
      return true;
    });
  }, [listings, search, selCategories, selLocation]);

  const toggleCat = cat => setSelCategories(prev =>
    prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
  );
  const hasFilters = selCategories.length > 0 || selLocation;

  return (
    <div className="ns-page">
      <Navbar />

      {/* Hero */}
      <div className="ns-hero ns-giveaway-hero">
        <div className="ns-container">
          <h1>🎁 Giveaway Board</h1>
          <p className="ns-hero-sub">
            {listings.length} free item{listings.length !== 1 ? 's' : ''} — take what you need, give what you don't
          </p>
          <div className="ns-hero-search">
            <span className="ns-hero-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search giveaways…"
            />
          </div>
        </div>
      </div>

      <div className="ns-container">
        <div className="ns-dashboard-layout">

          {/* Filter sidebar */}
          <>
            <div className="ns-mobile-filter-btn">
              <button
                className={`ns-btn ${hasFilters ? 'ns-btn-primary' : 'ns-btn-secondary'}`}
                onClick={() => setFiltersOpen(o => !o)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                Filters {hasFilters ? `(${selCategories.length + (selLocation ? 1 : 0)})` : ''}
              </button>
              {filtersOpen && <FilterPanel categories={selCategories} onToggleCat={toggleCat} location={selLocation} onLocation={setSelLocation} onClear={() => { setSelCategories([]); setSelLocation(''); }} hasFilters={hasFilters} />}
            </div>
            <aside className="ns-filter-sidebar">
              <FilterPanel categories={selCategories} onToggleCat={toggleCat} location={selLocation} onLocation={setSelLocation} onClear={() => { setSelCategories([]); setSelLocation(''); }} hasFilters={hasFilters} />
            </aside>
          </>

          {/* Main content */}
          <div className="ns-main-content">
            <div className="ns-results-bar">
              <span className="ns-results-count">
                {loading ? 'Loading…' : `${filtered.length} free item${filtered.length !== 1 ? 's' : ''}${filtered.length !== listings.length ? ` of ${listings.length}` : ''}`}
              </span>
              {hasFilters && (
                <button className="ns-clear-btn" onClick={() => { setSelCategories([]); setSelLocation(''); }}>
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="ns-empty"><div className="ns-empty-icon">⏳</div><p>Loading giveaways…</p></div>
            ) : filtered.length === 0 ? (
              <div className="ns-empty">
                <div className="ns-empty-icon">🎁</div>
                <h3>No giveaways found</h3>
                <p>Nothing here yet — be the first to give something away!</p>
              </div>
            ) : (
              <div className="ns-listings-grid">
                {filtered.map(l => <ListingCard key={l._id} listing={l} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterPanel({ categories, onToggleCat, location, onLocation, onClear, hasFilters }) {
  function Tick() {
    return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 20 4 10"/></svg>;
  }
  return (
    <div className="ns-filter-card">
      <div className="ns-filter-title-row">
        <h3>Filters</h3>
        {hasFilters && <button className="ns-clear-btn" onClick={onClear}>Clear all</button>}
      </div>

      <div className="ns-filter-section">
        <span className="ns-filter-label">Category</span>
        {CATEGORIES.map(cat => (
          <label key={cat} className="ns-filter-item">
            <div className={`ns-checkbox ${categories.includes(cat) ? 'checked' : ''}`} onClick={() => onToggleCat(cat)}>
              <Tick />
            </div>
            {cat}
          </label>
        ))}
      </div>

      <div className="ns-filter-section">
        <span className="ns-filter-label">Meetup Location</span>
        <select className="ns-input ns-select" value={location} onChange={e => onLocation(e.target.value)}>
          <option value="">All locations</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
    </div>
  );
}