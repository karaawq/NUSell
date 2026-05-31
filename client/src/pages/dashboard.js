import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.nav}>
        <h1 style={styles.navLogo}>NUSell</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
      </nav>

      <div style={styles.content}>
        <div style={styles.welcomeCard}>
          <div style={styles.avatar}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={styles.welcomeText}>welcome, {user?.username}! </h2>
            <p style={styles.emailText}>{user?.telegram}</p>
          </div>
        </div>

        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}> 0 points</div>
            <div style={styles.statLabel}> 0 listings</div>
            <div style={styles.statLabel}> 0 transactions</div>
          </div>
        </div>


      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif' },
  nav: {
    background: '#1a1a6e', padding: '16px 32px', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center'
  },
  navLogo: { color: 'white', margin: 0, fontSize: '1.8rem' },
  logoutBtn: {
    background: 'transparent', color: 'white', border: '1px solid white',
    padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'
  },
  content: { maxWidth: '800px', margin: '0 auto', padding: '32px 16px' },
  welcomeCard: {
    background: 'white', borderRadius: '16px', padding: '24px',
    display: 'flex', alignItems: 'center', gap: '20px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px'
  },
  avatar: {
    width: '64px', height: '64px', borderRadius: '50%', background: '#1a1a6e',
    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.8rem', fontWeight: 'bold', flexShrink: 0
  },
  welcomeText: { margin: 0, fontSize: '1.4rem', color: '#1a1a6e' },
  emailText: { margin: '4px 0 0' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px' },
  statCard: {
    flex: 1, background: 'white', borderRadius: '12px', padding: '20px',
    textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  statNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#1a1a6e' },
  statLabel: { marginTop: '4px' },
  infoCard: {
    background: 'white', borderRadius: '12px', padding: '16px 20px',
    marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  infoLabel: { fontWeight: 'bold', marginRight: '8px', color: '#555' },
  comingSoon: {
    background: 'white', borderRadius: '12px', padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
  },
  featureList: { color: '#555', lineHeight: '2' }
};