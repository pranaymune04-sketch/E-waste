import React, { useState } from 'react';
import './GoogleAuthModal.css';

function GoogleAuthModal({ isOpen, onClose, onSelectAccount, userType, specialty, city }) {
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const defaultAccounts = userType === 'technician'
    ? [
        {
          name: 'Alex Rivera',
          email: 'alex.rivera.tech@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
          specialty: specialty || 'Electronics & Phones',
          badge: 'Technician'
        },
        {
          name: 'Marcus Taylor',
          email: 'marcus.taylor.repair@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
          specialty: specialty || 'Appliances',
          badge: 'Technician'
        }
      ]
    : [
        {
          name: 'Sarah Jenkins',
          email: 'sarah.jenkins.nyc@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
          badge: 'Customer'
        },
        {
          name: 'Michael Davis',
          email: 'michael.davis.repair@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
          badge: 'Customer'
        }
      ];

  const handleChoose = (acc) => {
    onSelectAccount({
      name: acc.name,
      email: acc.email,
      photoURL: acc.avatar,
      userType,
      specialty: specialty || 'Electronics & Phones',
      city: city || 'New York'
    });
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!customName || !customEmail) return;
    onSelectAccount({
      name: customName,
      email: customEmail,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(customName)}`,
      userType,
      specialty: specialty || 'Electronics & Phones',
      city: city || 'New York'
    });
  };

  return (
    <div className="google-modal-overlay" onClick={onClose}>
      <div className="google-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="google-modal-header">
          <div className="google-logo-wrapper">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
          </div>
          <h3>Choose an account</h3>
          <p className="google-modal-sub">
            to continue to <strong>ROW</strong>
          </p>
        </div>

        {!showCustomInput ? (
          <div className="google-accounts-list">
            {defaultAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                className="google-account-item"
                onClick={() => handleChoose(acc)}
              >
                <img src={acc.avatar} alt={acc.name} className="google-account-avatar" />
                <div className="google-account-info">
                  <span className="google-account-name">{acc.name}</span>
                  <span className="google-account-email">{acc.email}</span>
                </div>
                <span className="google-account-badge">{acc.badge}</span>
              </button>
            ))}

            <button
              type="button"
              className="google-use-another-btn"
              onClick={() => setShowCustomInput(true)}
            >
              Use another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="google-custom-form">
            <div className="form-group-custom">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Johnathan Miller"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-group-custom">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="jmiller@gmail.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                required
              />
            </div>
            <div className="google-custom-actions">
              <button
                type="button"
                className="btn-text"
                onClick={() => setShowCustomInput(false)}
              >
                Back
              </button>
              <button type="submit" className="btn-google-confirm">
                Continue
              </button>
            </div>
          </form>
        )}

        <div className="google-modal-footer">
          <button type="button" className="google-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <span className="google-security-notice">Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
}

export default GoogleAuthModal;
