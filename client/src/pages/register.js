import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function Register() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]  = useState({ username: '', email: '', password: '', telegram: '' });
  const [error,   setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const payload = { ...form, telegram: form.telegram.replace(/^@/, '') };
      const res = await api.post('/auth/register', payload);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'registration failed.. pls try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ns-auth-page">
      <div className="ns-auth-box">
        <div className="ns-auth-logo">
          <div className="ns-auth-logo-icon">🛍</div>
          <h1>NU<span style={{ color: 'var(--c-primary)' }}>Sell</span></h1>
          <p>NUS's student marketplace</p>
        </div>

        <div className="ns-card">
          <div className="ns-auth-tabs">
            <Link to="/login" className="ns-auth-tab" style={{ textDecoration: 'none' }}>Log In</Link>
            <button className="ns-auth-tab active">Create Account</button>
          </div>

          <form className="ns-auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="ns-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="ns-form-group">
              <label className="ns-label">Username</label>
              <input className="ns-input" type="text" value={form.username} onChange={set('username')} placeholder="e.g. dequaviouspork" required minLength={6} />
              <p className="ns-hint">Minimum 6 characters</p>
            </div>

            <div className="ns-form-group">
              <label className="ns-label">Email</label>
              <input className="ns-input" type="email" value={form.email} onChange={set('email')} placeholder="e1234567@u.nus.edu" required />
            </div>

            <div className="ns-form-group">
              <label className="ns-label">Password</label>
              <input className="ns-input" type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required minLength={8} />
            </div>

            <div className="ns-form-group">
              <label className="ns-label">Telegram Handle</label>
              <div className="ns-input-prefix">
                <span className="ns-prefix">@</span>
                <input className="ns-input" type="text" value={form.telegram} onChange={e => setForm(f => ({ ...f, telegram: e.target.value.replace(/^@/, '') }))} placeholder="realjohnpork" />
              </div>
              <p className="ns-hint">Buyers will contact you via Telegram to arrange meetups</p>
            </div>

            <button className="ns-btn ns-btn-primary ns-btn-full" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="ns-auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}