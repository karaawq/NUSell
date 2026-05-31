import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

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
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>NUSell</h1>
        <p style={styles.tagline}>Campus marketplace</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e0123456@u.nus.edu"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'logging in...' : 'log in'}
          </button>
        </form>

        <p style={styles.switchText}>
          <Link to="/register" style={styles.link}>sign up/register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f0f2f5',
    fontFamily: 'sans-serif'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px'
  },
  logo: { color: '#1a1a6e', margin: 0, fontSize: '2.5rem' },
  tagline: { color: '#888', marginTop: '4px', marginBottom: '28px' },
  heading: { fontSize: '1.4rem', marginBottom: '20px', color: '#222' },
  field: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#555', fontSize: '0.9rem' },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #ddd', fontSize: '1rem', boxSizing: 'border-box'
  },
  button: {
    width: '100%', padding: '12px', background: '#1a1a6e', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer',
    marginTop: '8px'
  },
  error: {
    background: '#fff0f0', border: '1px solid #ffcccc', color: '#cc0000',
    padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.9rem'
  },
  switchText: { textAlign: 'center', marginTop: '20px', color: '#666' },
  link: { color: '#1a1a6e', fontWeight: 'bold' }
};