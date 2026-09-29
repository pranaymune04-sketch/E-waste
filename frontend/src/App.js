import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Platform from './components/Platform';
import Navbar from './components/Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  
  // Navigation View State: 'home' | 'login' | 'platform'
  const [currentView, setCurrentView] = useState('home');
  const [authOptions, setAuthOptions] = useState({
    userType: 'customer',
    isLogin: true,
    searchParams: null
  });

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setLoading(false);
      setCurrentView('home');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data.user);
      // If user had an active session, default to platform or allow home view
      setCurrentView('platform');
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      setToken(null);
      setCurrentView('home');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (authToken, userData) => {
    localStorage.setItem('token', authToken);
    setToken(authToken);
    setUser(userData);
    setCurrentView('platform');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('home');
  };

  const handleNavigateToAuth = (userType = 'customer', isLogin = true, searchParams = null) => {
    if (user) {
      setCurrentView('platform');
    } else {
      setAuthOptions({ userType, isLogin, searchParams });
      setCurrentView('login');
    }
  };

  const handleQuickSearch = (searchParams) => {
    if (user) {
      setCurrentView('platform');
    } else {
      setAuthOptions({
        userType: 'customer',
        isLogin: true,
        searchParams
      });
      setCurrentView('login');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="App">
      {/* 1. AUTHENTICATION VIEW */}
      {currentView === 'login' && !user && (
        <Login
          onLogin={handleLogin}
          onBackToHome={() => setCurrentView('home')}
          initialUserType={authOptions.userType}
          initialIsLogin={authOptions.isLogin}
        />
      )}

      {/* 2. PLATFORM DASHBOARD VIEW */}
      {currentView === 'platform' && user && (
        <Platform
          user={user}
          token={token}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentView('home')}
        />
      )}

      {/* 3. HOME PAGE VIEW */}
      {(currentView === 'home' || (!user && currentView !== 'login')) && (
        <>
          <Navbar
            user={user}
            token={token}
            onLogout={handleLogout}
            currentView="home"
            onNavigateHome={() => setCurrentView('home')}
            onNavigateDashboard={() => setCurrentView('platform')}
            onNavigateToAuth={handleNavigateToAuth}
          />
          <HomePage
            user={user}
            onNavigateToAuth={handleNavigateToAuth}
            onNavigateToDashboard={() => setCurrentView('platform')}
            onQuickSearch={handleQuickSearch}
          />
        </>
      )}
    </div>
  );
}

export default App;
