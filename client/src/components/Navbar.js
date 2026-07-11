//bar at the top of the page w links for home, dashboard, and logout

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/login'); setMenuOpen(false); };
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="ns-navbar">
            <div className="ns-container ns-navbar-inner">
    
                <div className="ns-flex-center ns-gap-3">
                    <Link to="/dashboard" className="ns-logo">
                        <div className="ns-logo-icon">🛍</div>
                        <span>NU<span className="ns-logo-sell">Sell</span></span> {/* your no-gap fix, kept */}
                    </Link>
    
                    <div className="ns-nav-tabs">
                        <Link to="/dashboard" className={`ns-nav-tab ${isActive('/dashboard') ? 'active' : ''}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                            Dashboard
                        </Link>
                        <Link to="/giveaway" className={`ns-nav-tab ${isActive('/giveaway') ? 'active' : ''}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>
                            Giveaway
                        </Link>
                    </div>
                </div>
                
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
