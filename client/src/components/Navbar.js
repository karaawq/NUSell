//bar at the top of the page w links for home, dashboard, and logout

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };

    return (
    <nav className="ns-navbar">
        <div className="ns-container ns-navbar-inner">
            <Link to="/dashboard" className="ns-logo">
                <div className="ns-logo-icon">🛍</div>
                NU<span className="ns-logo-sell">Sell</span>
            </Link>

            <div className="ns-navbar-actions" style={{ display: menuOpen ? 'none' : 'flex' }}>
                <Link to="/listing/new" className="ns-btn ns-btn-primary">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Sell Item
                </Link>
                <Link to={`/profile/${user?._id}`} className="ns-user-btn">
                    <div className="ns-avatar">{user?.username?.[0]?.toUpperCase()}</div>
                    <span style={{ fontSize: '0.875rem' }}>{user?.username}</span>
                </Link>
                <button onClick={handleLogout} className="ns-btn ns-btn-ghost" title="Log out">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Log Out
                </button>
            </div>
        </div>
    </nav>
  );
}
