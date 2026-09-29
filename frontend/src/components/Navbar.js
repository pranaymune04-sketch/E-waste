import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Navbar.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Navbar({
  user,
  token,
  onLogout,
  activeTab,
  setActiveTab,
  currentView,
  onNavigateHome,
  onNavigateDashboard,
  onNavigateToAuth
}) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (e) {
      // ignore
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put(`${API_URL}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      // ignore
    }
  };

  // If user is on the Home page (or not logged in)
  const isHomePage = currentView === 'home' || !user;

  return (
    <header className="main-navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div
          className="navbar-brand-group"
          onClick={onNavigateHome}
          style={{ cursor: 'pointer' }}
          role="button"
          tabIndex={0}
        >
          <span className="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </span>
          <span className="brand-name">ROW</span>
          <span className="brand-sub-badge">Repair OR Waste</span>
        </div>

        {/* Navigation for Home Page */}
        {isHomePage ? (
          <nav className={`navbar-links-group ${mobileMenuOpen ? 'mobile-show' : ''}`}>
            <a href="#home" className="nav-link-item" onClick={() => { onNavigateHome && onNavigateHome(); setMobileMenuOpen(false); }}>Home</a>
            <a href="#how-it-works" className="nav-link-item" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
            <a href="#services" className="nav-link-item" onClick={() => setMobileMenuOpen(false)}>Services</a>
            <a href="#impact" className="nav-link-item" onClick={() => setMobileMenuOpen(false)}>Impact</a>
            <button
              type="button"
              className="nav-link-btn"
              onClick={() => { onNavigateToAuth && onNavigateToAuth('technician', false); setMobileMenuOpen(false); }}
            >
              For Technicians
            </button>
          </nav>
        ) : (
          /* Navigation Tabs for Logged-In Platform Dashboard */
          <nav className="navbar-center-tabs">
            <button
              type="button"
              className="nav-tab-btn home-quick-btn"
              onClick={onNavigateHome}
              title="View Public Home Page"
            >
              Home
            </button>
            {user.type === 'customer' ? (
              <>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'explore' || activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab && setActiveTab('explore')}
                >
                  Find Technicians
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                  onClick={() => setActiveTab && setActiveTab('bookings')}
                >
                  My Requests
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'ewaste' ? 'active' : ''}`}
                  onClick={() => setActiveTab && setActiveTab('ewaste')}
                >
                  E-Waste Recovery
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
                  onClick={() => setActiveTab && setActiveTab('rewards')}
                >
                  Eco Rewards
                </button>
              </>
            ) : user.type === 'buyer' ? (
              <>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'marketplace' || activeTab === 'materials' || !activeTab ? 'active' : ''}`}
                  onClick={() => setActiveTab && setActiveTab('marketplace')}
                >
                  Available Materials
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'offers' ? 'active' : ''}`}
                  onClick={() => setActiveTab && setActiveTab('offers')}
                >
                  My Offers
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab && setActiveTab('profile')}
                >
                  Company Profile
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'jobs' ? 'active' : ''}`}
                  onClick={() => setActiveTab && setActiveTab('jobs')}
                >
                  Requests & Jobs
                </button>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab && setActiveTab('profile')}
                >
                  Technician Profile
                </button>
              </>
            )}
          </nav>
        )}

        {/* User Capsule / Auth Actions */}
        <div className="navbar-user-group">
          {user ? (
            <>
              {isHomePage && onNavigateDashboard && (
                <button
                  type="button"
                  className="nav-btn-dashboard"
                  onClick={onNavigateDashboard}
                >
                  Go to Dashboard →
                </button>
              )}

              {/* Notifications Dropdown */}
              <div className="notif-wrapper">
                <button
                  type="button"
                  className="notif-btn"
                  onClick={() => {
                    setIsNotifOpen(!isNotifOpen);
                    if (!isNotifOpen && unreadCount > 0) markAllRead();
                  }}
                  title="Notifications"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>

                {isNotifOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-head">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <button type="button" className="btn-mark-read" onClick={markAllRead}>
                          Mark read
                        </button>
                      )}
                    </div>

                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">No notifications yet</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                            <span className="notif-item-title">{n.title}</span>
                            <p className="notif-item-msg">{n.message}</p>
                            <span className="notif-item-time">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div
                className="user-capsule"
                onClick={onNavigateDashboard}
                style={{ cursor: 'pointer' }}
                title="Go to Dashboard"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                  alt={user.name}
                  className="user-capsule-avatar"
                />
                <div className="user-capsule-details">
                  <span className="user-capsule-name">{user.name}</span>
                  <span className={`user-role-badge ${user.type}`}>
                    {user.type === 'technician' ? 'Technician' : user.type === 'buyer' ? 'Recycler' : 'Customer'}
                  </span>
                </div>
              </div>

              <button type="button" className="navbar-logout-btn" onClick={onLogout}>
                Logout
              </button>
            </>
          ) : (
            <div className="guest-nav-actions">
              <button
                type="button"
                className="btn-nav-signin"
                onClick={() => onNavigateToAuth && onNavigateToAuth('customer', true)}
              >
                Login
              </button>
              <button
                type="button"
                className="btn-nav-signup"
                onClick={() => onNavigateToAuth && onNavigateToAuth('customer', false)}
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile hamburger toggle */}
          {isHomePage && (
            <button
              type="button"
              className="navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;


