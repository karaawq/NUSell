//filters for category, minmax price, condition, location

import React, { useState } from 'react';

const CATEGORIES = ['Electronics','Books & Notes','Clothing & Accessories','Furniture','Sports & Fitness','Kitchen & Home','Beauty & Personal Care','Others'];
const CONDITIONS  = [{ value: 'new', label: 'Brand New' },{ value: 'like-new', label: 'Like New' },{ value: 'good', label: 'Good' },{ value: 'fair', label: 'Fair' }];
const LOCATIONS   = ['UTown','Science','Engineering','Arts & Social Science','Business','Computing','Medicine','Law','Clementi','Jurong East','Orchard','Novena','Online / Others'];

export const defaultFilters = { search: '', categories: [], minPrice: '', maxPrice: '', conditions: [], location: '' };

function Tick() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 20 4 10"/></svg>
  );
}

export default function SearchFilter({ filters, onChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = (key, val) => {
    const arr = filters[key];
    onChange({ ...filters, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };
  const hasActive = filters.categories.length || filters.conditions.length || filters.location || filters.minPrice || filters.maxPrice;

  const Body = () => (
    <div className="ns-filter-card">
      <div className="ns-filter-title-row">
        <h3>Filters</h3>
        {hasActive && <button className="ns-clear-btn" onClick={() => onChange(defaultFilters)}>Clear all</button>}
      </div>

      <div className="ns-filter-section">
        <span className="ns-filter-label">Category</span>
        {CATEGORIES.map(cat => (
          <label key={cat} className="ns-filter-item">
            <div className={`ns-checkbox ${filters.categories.includes(cat) ? 'checked' : ''}`} onClick={() => toggle('categories', cat)}>
              <Tick />
            </div>
            {cat}
          </label>
        ))}
      </div>

      <div className="ns-filter-section">
        <span className="ns-filter-label">Price (SGD)</span>
        <div className="ns-price-row">
          <input className="ns-input" type="number" min={0} placeholder="Min" value={filters.minPrice} onChange={e => onChange({ ...filters, minPrice: e.target.value })} />
          <span className="ns-price-sep">–</span>
          <input className="ns-input" type="number" min={0} placeholder="Max" value={filters.maxPrice} onChange={e => onChange({ ...filters, maxPrice: e.target.value })} />
        </div>
      </div>

      <div className="ns-filter-section">
        <span className="ns-filter-label">Condition</span>
        {CONDITIONS.map(c => (
          <label key={c.value} className="ns-filter-item">
            <div className={`ns-checkbox ${filters.conditions.includes(c.value) ? 'checked' : ''}`} onClick={() => toggle('conditions', c.value)}>
              <Tick />
            </div>
            {c.label}
          </label>
        ))}
      </div>

      <div className="ns-filter-section">
        <span className="ns-filter-label">Meetup Location</span>
        <select className="ns-input ns-select" value={filters.location} onChange={e => onChange({ ...filters, location: e.target.value })}>
          <option value="">All locations</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <>
      <div className="ns-mobile-filter-btn">
        <button className={`ns-btn ${hasActive ? 'ns-btn-primary' : 'ns-btn-secondary'}`} onClick={() => setMobileOpen(o => !o)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
          Filters {hasActive ? `(${filters.categories.length + filters.conditions.length + (filters.location ? 1 : 0)})` : ''}
        </button>
        {mobileOpen && <div className="ns-mobile-filter-panel ns-mt-3"><Body /></div>}
      </div>
      <aside className={`ns-filter-sidebar`}>
        <Body />
      </aside>
    </>
  );
}