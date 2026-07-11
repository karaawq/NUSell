import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';

const CATEGORIES = ['Electronics','Books & Notes','Clothing & Accessories','Furniture','Sports & Fitness','Kitchen & Home','Beauty & Personal Care','Others'];
const CONDITIONS = [{ value: 'new', label: 'Brand New' },{ value: 'like-new', label: 'Like New' },{ value: 'good', label: 'Good' },{ value: 'fair', label: 'Fair' }];
const LOCATIONS = ['UTown','Science','Engineering','Arts & Social Science','Business','Computing','Medicine','Law','Online / Others'];
const EMPTY = { title: '', description: '', price: '', isFree: false, condition: 'good', category: CATEGORIES[0], location: LOCATIONS[0], imageUrl: '' };

function Tick() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 20 4 10"/></svg>;
}

export default function CreateListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/listings/${id}`)
      .then(res => {
        const l = res.data;
        setForm({
          title: l.title, description: l.description,
          price: l.isFree ? '' : String(l.price),
          isFree: l.isFree || false,
          condition: l.condition, category: l.category,
          location: l.location, imageUrl: l.imageUrl || '',
        });
      })
      .catch(() => navigate('/dashboard'));
  }, [id, isEdit, navigate]);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const toggleFree = () => setForm(f => ({ ...f, isFree: !f.isFree, price: '' }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError('Please add a title.'); return; 
    }
    if (!form.isFree && (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0)) {
      setError('Please enter a valid price, or mark the item as free.'); return;
    }
    if (!form.description.trim()) {
      setError('Please add a description.'); return; 
    }

    setLoading(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.isFree ? 0 : Number(form.price),
      isFree: form.isFree,
      condition: form.condition,
      category: form.category,
      location: form.location,
      imageUrl: form.imageUrl.trim(),
    };

    try {
      if (isEdit) {
        await api.put(`/listings/${id}`, payload);
        navigate(`/listing/${id}`);
      } else {
        const res = await api.post('/listings', payload);
        navigate(`/listing/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ns-page">
      <Navbar />
      <div className="ns-container" style={{ maxWidth: 680, padding: '1.5rem' }}>
        <button className="ns-back" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back
        </button>

        <div className="ns-card">
          <div className="ns-card-header">
            <h2>{isEdit ? 'Edit Listing' : 'Create New Listing'}</h2>
            <p>{isEdit ? 'Update your listing details below.' : "Fill in the details about what you're selling."}</p>
          </div>

          <form className="ns-card-body" onSubmit={handleSubmit}>
            {error && (
              <div className="ns-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="ns-form-group">
              <label className="ns-label">Item Name *</label>
              <input className="ns-input" type="text" value={form.title} onChange={set('title')} placeholder="e.g. MacBook Air M2 13-inch" maxLength={100} />
            </div>

            {/* Pricing row */}
            <div className="ns-grid-2">
              <div className="ns-form-group">
                <label className="ns-label">Price (SGD) *</label>
                {form.isFree ? (
                  <div className="ns-input" style={{ color: 'var(--c-muted)', background: 'var(--c-muted-bg)', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 6 }}>
                    🎁 Free giveaway
                  </div>
                ) : (
                  <div className="ns-input-prefix">
                    <span className="ns-prefix">$</span>
                    <input className="ns-input" type="number" min={0} step="0.01" value={form.price} onChange={set('price')} placeholder="0" />
                  </div>
                )}
              </div>
              <div className="ns-form-group">
                <label className="ns-label">Condition *</label>
                <select className="ns-input ns-select" value={form.condition} onChange={set('condition')}>
                  {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>

            {/* Free toggle */}
            <label className="ns-free-toggle" onClick={toggleFree}>
              <div className={`ns-checkbox ${form.isFree ? 'checked' : ''}`} style={{ marginTop: 2, flexShrink: 0 }}>
                <Tick />
              </div>
              <div className="ns-free-toggle-text">
                <strong>🎁 List as Giveaway (completely free)</strong>
                <span>This item will appear in the Giveaway section — no price needed.</span>
              </div>
            </label>

            <div className="ns-grid-2">
              <div className="ns-form-group">
                <label className="ns-label">Category *</label>
                <select className="ns-input ns-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="ns-form-group">
                <label className="ns-label">Meetup Location *</label>
                <select className="ns-input ns-select" value={form.location} onChange={set('location')}>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div className="ns-form-group">
              <label className="ns-label">Description *</label>
              <textarea className="ns-input ns-textarea" value={form.description} onChange={set('description')} placeholder="Describe your item — condition details, what's included, reason for giving away…" maxLength={1000} rows={5} />
              <p className="ns-char-count">{form.description.length} / 1000</p>
            </div>

            <div className="ns-form-group">
              <label className="ns-label">Image URL</label>
              <div style={{ position: 'relative' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <input className="ns-input" type="url" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://… (leave blank for default)" style={{ paddingLeft: 36 }} />
              </div>
              {form.imageUrl && (
                <div className="ns-img-preview">
                  <img src={form.imageUrl} alt="Preview" onError={e => { e.target.style.display = 'none'; }} />
                </div>
              )}
            </div>

            <div className="ns-grid-2 ns-mt-3">
              <button type="button" className="ns-btn ns-btn-secondary ns-btn-full" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="ns-btn ns-btn-primary ns-btn-full" disabled={loading}>
                {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}