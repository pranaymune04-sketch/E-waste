import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import GoogleAuthModal from './GoogleAuthModal';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Login({ onLogin, onBackToHome, initialUserType = 'customer', initialIsLogin = true }) {
  const [userType, setUserType] = useState(initialUserType); // 'customer' | 'technician' | 'buyer'
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [specialty, setSpecialty] = useState('Electronics & Phones');
  const [city, setCity] = useState('Nagpur');
  const [rate, setRate] = useState('₹499/hr');
  const [phone, setPhone] = useState('+91 ');
  const [bio, setBio] = useState('');
  const [address, setAddress] = useState('');
  const [materialsWanted, setMaterialsWanted] = useState(['Copper', 'Aluminium', 'Electronic Components']);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let endpoint = '';
      let payload = {};

      if (isLogin) {
        endpoint = `/auth/${userType}-login`;
        payload = { email, password };
      } else {
        endpoint = `/auth/${userType}-register`;
        payload = { email, password, name, city, phone };
        if (userType === 'technician') {
          payload.specialty = specialty;
          payload.rate = rate;
          payload.bio = bio;
        } else if (userType === 'buyer') {
          payload.companyName = companyName || `${name} Recycling Hub`;
          payload.address = address;
          payload.materialsWanted = materialsWanted;
        }
      }

      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      if (response.data.success) {
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAccountSelected = async (googleUser) => {
    setIsGoogleModalOpen(false);
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/google-login`, {
        ...googleUser,
        userType,
        specialty,
        city,
        companyName: companyName || (userType === 'buyer' ? 'Recycling Enterprise' : undefined)
      });

      if (response.data.success) {
        onLogin(response.data.token, response.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaterial = (mat) => {
    if (materialsWanted.includes(mat)) {
      setMaterialsWanted(materialsWanted.filter(m => m !== mat));
    } else {
      setMaterialsWanted([...materialsWanted, mat]);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split-wrapper">
        {/* LEFT COLUMN: PLATFORM INTRODUCTION */}
        <div className="auth-left-intro">
          {onBackToHome && (
            <button type="button" className="auth-back-btn" onClick={onBackToHome}>
              ← Back to Home
            </button>
          )}
          <div className="intro-brand-box">
            <span className="intro-tag">ROW • REPAIR OR WASTE</span>
            <h1 className="intro-title">ROW</h1>
            <p className="intro-description">
              Repair what can be repaired, recover what cannot.
            </p>
          </div>

          <div className="intro-features-list">
            <div className="feature-bullet-item">
              <strong>Verified Technicians</strong>
              <span>Qualified local repair shops for electronics, appliances, and items.</span>
            </div>
            <div className="feature-bullet-item">
              <strong>AI Diagnostic Verification</strong>
              <span>Instant assessment of likely faults, repairability, and costs.</span>
            </div>
            <div className="feature-bullet-item">
              <strong>Circular E-Waste Recovery</strong>
              <span>Recover useful materials from non-repairable devices.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CLEAN FORM */}
        <div className="auth-right-card">
          {/* Account Role Selector */}
          <div className="user-type-tabs">
            <button
              type="button"
              className={`user-type-tab ${userType === 'customer' ? 'active' : ''}`}
              onClick={() => {
                setUserType('customer');
                setError('');
              }}
            >
              Customer
            </button>
            <button
              type="button"
              className={`user-type-tab ${userType === 'technician' ? 'active' : ''}`}
              onClick={() => {
                setUserType('technician');
                setError('');
              }}
            >
              Technician
            </button>
            <button
              type="button"
              className={`user-type-tab ${userType === 'buyer' ? 'active' : ''}`}
              onClick={() => {
                setUserType('buyer');
                setError('');
              }}
            >
              Buyer / Recycler
            </button>
          </div>

          {/* Sign In vs Sign Up */}
          <div className="auth-mode-switch">
            <button
              type="button"
              className={`mode-btn ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mode-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              Register
            </button>
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            className="google-signin-btn"
            onClick={() => setIsGoogleModalOpen(true)}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider">
            <span>or use email</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-field">
                <label>{userType === 'buyer' ? 'Representative Full Name' : 'Full Name'}</label>
                <input
                  type="text"
                  placeholder={userType === 'buyer' ? "Karan Johar" : userType === 'technician' ? "Amitabh Sharma" : "Aarav Patel"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            {!isLogin && userType === 'buyer' && (
              <div className="form-field">
                <label>Company / Enterprise Name</label>
                <input
                  type="text"
                  placeholder="Nagpur Metal Recovery"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder={isLogin ? (userType === 'customer' ? "customer@example.com" : userType === 'technician' ? "tech@example.com" : "buyer@example.com") : "contact@example.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="form-row">
                <div className="form-field">
                  <label>City / Hub</label>
                  <input
                    type="text"
                    placeholder="Nagpur"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98230 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
            )}

            {!isLogin && userType === 'technician' && (
              <>
                <div className="form-row">
                  <div className="form-field">
                    <label>Specialty</label>
                    <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                      <option value="Electronics & Phones">Electronics & Phones</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Bicycles">Bicycles</option>
                      <option value="Furniture">Furniture</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Hourly Rate</label>
                    <input
                      type="text"
                      placeholder="₹499/hr"
                      value={rate}
                      onChange={(e) => setRate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label>Qualifications / Bio</label>
                  <textarea
                    rows="2"
                    placeholder="Summary of experience and devices repaired..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </>
            )}

            {!isLogin && userType === 'buyer' && (
              <>
                <div className="form-field">
                  <label>Warehouse / Industrial Address</label>
                  <input
                    type="text"
                    placeholder="Plot 42, MIDC Industrial Area, Hingna, Nagpur"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-field">
                  <label>Target Materials Wanted</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.2rem' }}>
                    {['Copper', 'Aluminium', 'Steel', 'Plastic', 'Electronic Components', 'Mixed E-Waste'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMaterial(m)}
                        style={{
                          background: materialsWanted.includes(m) ? '#dcfce7' : '#f8fafc',
                          color: materialsWanted.includes(m) ? '#166534' : '#475569',
                          border: materialsWanted.includes(m) ? '1px solid #16a34a' : '1px solid #cbd5e1',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '16px',
                          fontSize: '0.75rem',
                          fontWeight: materialsWanted.includes(m) ? '600' : '400',
                          cursor: 'pointer'
                        }}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {error && <div className="auth-error-banner">{error}</div>}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? `Sign In as ${userType === 'buyer' ? 'Buyer' : userType === 'technician' ? 'Technician' : 'Customer'}` : `Register as ${userType === 'buyer' ? 'Buyer' : userType === 'technician' ? 'Technician' : 'Customer'}`}
            </button>
          </form>
        </div>
      </div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        onSelectAccount={handleGoogleAccountSelected}
        userType={userType}
        specialty={specialty}
        city={city}
      />
    </div>
  );
}

export default Login;
