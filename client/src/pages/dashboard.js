import React, { useState, useEffect, useMemo } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import ListingCard from '../components/ListingCard';
import SearchFilter, { defaultFilters } from '../components/SearchFilter';

export default function Dashboard() {
  const [listings, setListings] = useState([]);
  const [filters,  setFilters]  = useState(defaultFilters);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    api.get('/listings')
      .then(res => setListings(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return listings.filter(l => {
      if (filters.search    && !l.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.categories.length && !filters.categories.includes(l.category))              return false;
      if (filters.conditions.length && !filters.conditions.includes(l.condition))             return false;
      if (filters.minPrice  && l.price < Number(filters.minPrice))                            return false;
      if (filters.maxPrice  && l.price > Number(filters.maxPrice))                            return false;
      if (filters.location  && l.location !== filters.location)                               return false;
      return true;
    });
  }, [listings, filters]);

  return (
    <div className="ns-page">
      <Navbar />

      <div className="ns-hero">
        <div className="ns-container">
          <h1>Find great deals on NUSell</h1>
          <p className="ns-hero-sub">{listings.length} items listed by other students</p>
          <div className="ns-hero-search">
            <span className="ns-hero-search-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </span>
            <input
              type="text"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              placeholder="Search for items…"
            />
          </div>
        </div>
      </div>

      <div className="ns-container">
        <div className="ns-dashboard-layout">
          <SearchFilter filters={filters} onChange={setFilters} />

          <div className="ns-main-content">
            <div className="ns-results-bar">
              <span className="ns-results-count">
                {loading ? 'Loading…' : `${filtered.length} listing${filtered.length !== 1 ? 's' : ''}${filtered.length !== listings.length ? ` of ${listings.length}` : ''}`}
              </span>
            </div>

            {loading ? (
              <div className="ns-empty"><div className="ns-empty-icon">⏳</div><p>Loading listings…</p></div>
            ) : filtered.length === 0 ? (
              <div className="ns-empty">
                <div className="ns-empty-icon">📦</div>
                <h3>No listings found</h3>
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


// OLD

// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../AuthContext';

// export default function Dashboard() {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     <div style={styles.container}>
//       <nav style={styles.nav}>
//         <h1 style={styles.navLogo}>NUSell</h1>
//         <button style={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
//       </nav>

//       <div style={styles.content}>
//         <div style={styles.welcomeCard}>
//           <div style={styles.avatar}>
//             {user?.username?.[0]?.toUpperCase()}
//           </div>
//           <div>
//             <h2 style={styles.welcomeText}>welcome, {user?.username}! </h2>
//             <p style={styles.emailText}>{user?.telegram}</p>
//           </div>
//         </div>

//         <div style={styles.statsRow}>
//           <div style={styles.statCard}>
//             <div style={styles.statLabel}> 0 points</div>
//             <div style={styles.statLabel}> 0 listings</div>
//             <div style={styles.statLabel}> 0 transactions</div>
//           </div>
//         </div>


//       </div>
//     </div>
//   );
// }

// const styles = {
//   container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: 'sans-serif' },
//   nav: {
//     background: '#1a1a6e', padding: '16px 32px', display: 'flex',
//     justifyContent: 'space-between', alignItems: 'center'
//   },
//   navLogo: { color: 'white', margin: 0, fontSize: '1.8rem' },
//   logoutBtn: {
//     background: 'transparent', color: 'white', border: '1px solid white',
//     padding: '8px 16px', borderRadius: '8px', cursor: 'pointer'
//   },
//   content: { maxWidth: '800px', margin: '0 auto', padding: '32px 16px' },
//   welcomeCard: {
//     background: 'white', borderRadius: '16px', padding: '24px',
//     display: 'flex', alignItems: 'center', gap: '20px',
//     boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: '24px'
//   },
//   avatar: {
//     width: '64px', height: '64px', borderRadius: '50%', background: '#1a1a6e',
//     color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
//     fontSize: '1.8rem', fontWeight: 'bold', flexShrink: 0
//   },
//   welcomeText: { margin: 0, fontSize: '1.4rem', color: '#1a1a6e' },
//   emailText: { margin: '4px 0 0' },
//   statsRow: { display: 'flex', gap: '16px', marginBottom: '24px' },
//   statCard: {
//     flex: 1, background: 'white', borderRadius: '12px', padding: '20px',
//     textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
//   },
//   statNumber: { fontSize: '2rem', fontWeight: 'bold', color: '#1a1a6e' },
//   statLabel: { marginTop: '4px' },
//   infoCard: {
//     background: 'white', borderRadius: '12px', padding: '16px 20px',
//     marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
//   },
//   infoLabel: { fontWeight: 'bold', marginRight: '8px', color: '#555' },
//   comingSoon: {
//     background: 'white', borderRadius: '12px', padding: '24px',
//     boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
//   },
//   featureList: { color: '#555', lineHeight: '2' }
// };