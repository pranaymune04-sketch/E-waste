import React, { useState } from 'react';
import './Platform.css';
import Navbar from './Navbar';
import CustomerDashboard from './CustomerDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import BuyerDashboard from './BuyerDashboard';

function Platform({ user, token, onLogout, onNavigateHome }) {
  const [activeTab, setActiveTab] = useState(
    user?.type === 'customer' ? 'explore' : user?.type === 'buyer' ? 'marketplace' : 'jobs'
  );

  if (!user) {
    return (
      <div className="platform">
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
          <p style={{ marginTop: '1rem', color: '#64748b' }}>Authenticating user session...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (user.type === 'customer') {
      return (
        <CustomerDashboard
          user={user}
          token={token}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      );
    } else if (user.type === 'buyer') {
      return (
        <BuyerDashboard
          user={user}
          token={token}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      );
    } else if (user.type === 'technician') {
      return (
        <TechnicianDashboard
          user={user}
          token={token}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      );
    }
    return null;
  };

  return (
    <div className="platform-container">
      <Navbar
        user={user}
        token={token}
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentView="platform"
        onNavigateHome={onNavigateHome}
      />
      <main className="platform-body">
        {renderContent()}
      </main>
    </div>
  );
}

export default Platform;
