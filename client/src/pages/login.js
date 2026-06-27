import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form,    setForm]  = useState({ email: '', password: '' });
  const [error,   setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw] = useState(false);

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'login failed.. pls try again');
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
          <p>NUS's student marketplacet</p>
        </div>

        <div className="ns-card">
          <div className="ns-auth-tabs">
            <button className="ns-auth-tab active">Log In</button>
            <Link to="/register" className="ns-auth-tab" style={{ textDecoration: 'none' }}>Create Account</Link>
          </div>

          <form className="ns-auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="ns-error">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <div className="ns-form-group">
              <label className="ns-label">Email</label>
              <input className="ns-input" type="email" value={form.email} onChange={set('email')} placeholder="e1234567@u.nus.edu" required />
            </div>

            <div className="ns-form-group">
              <label className="ns-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input className="ns-input" type={showPw ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="••••••••" required style={{ paddingRight: '40px' }} />
                <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-muted)', padding: '4px' }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button className="ns-btn ns-btn-primary ns-btn-full" type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <div className="ns-auth-switch">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}