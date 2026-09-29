import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function TechnicianDashboard({ user, token }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('new'); // 'overview' | 'new' | 'active' | 'history' | 'profile'

  // Selected Booking View Details
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null);

  // Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileName, setProfileName] = useState(user.name || '');
  const [profileSpecialty, setProfileSpecialty] = useState(user.specialty || 'Electronics & Phones');
  const [profileRate, setProfileRate] = useState(user.rate || '₹499/hr');
  const [profileCity, setProfileCity] = useState(user.city || 'Nagpur');
  const [profilePhone, setProfilePhone] = useState(user.phone || '+91 ');
  const [profileBio, setProfileBio] = useState(user.bio || '');
  const [profileSkills, setProfileSkills] = useState((user.skills || ['Chip-Level Soldering', 'OEM Component Replacement', 'Micro-Diagnostics']).join(', '));
  const [isAvailable, setIsAvailable] = useState(user.available !== false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileToast, setProfileToast] = useState('');

  // Shop Details State
  const [shopName, setShopName] = useState(user.shopName || '');
  const [shopAddress, setShopAddress] = useState(user.shopAddress || '');
  const [shopCity, setShopCity] = useState(user.shopCity || user.city || 'Nagpur');
  const [shopPincode, setShopPincode] = useState(user.shopPincode || '');
  const [shopPhone, setShopPhone] = useState(user.shopPhone || user.phone || '+91 ');
  const [shopMapsLink, setShopMapsLink] = useState(user.shopMapsLink || '');
  const [savingShop, setSavingShop] = useState(false);
  const [shopMessage, setShopMessage] = useState('');

  // Inputs
  // eslint-disable-next-line no-unused-vars
  const [quoteInputs, setQuoteInputs] = useState({});
  const [messageInputs, setMessageInputs] = useState({});

  useEffect(() => {
    fetchBookings();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/technicians/${user.id}`);
      if (response.data.success && response.data.technician) {
        const t = response.data.technician;
        setProfileName(t.name || user.name || '');
        setProfileSpecialty(t.specialty || user.specialty || 'Electronics & Phones');
        setProfileRate(t.rate || user.rate || '₹499/hr');
        setProfileCity(t.city || user.city || 'Nagpur');
        setProfilePhone(t.phone || user.phone || '+91 ');
        setProfileBio(t.bio || user.bio || '');
        if (t.skills && Array.isArray(t.skills)) setProfileSkills(t.skills.join(', '));
        setIsAvailable(t.available !== false);

        setShopName(t.shopName || '');
        setShopAddress(t.shopAddress || '');
        setShopCity(t.shopCity || t.city || user.city || 'Nagpur');
        setShopPincode(t.shopPincode || '');
        setShopPhone(t.shopPhone || t.phone || '+91 ');
        setShopMapsLink(t.shopMapsLink || '');
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSaveShopDetails = async (e) => {
    e.preventDefault();
    setSavingShop(true);
    setShopMessage('');

    try {
      const response = await axios.put(
        `${API_URL}/technicians/profile`,
        {
          shopName,
          shopAddress,
          shopCity,
          shopPincode,
          shopPhone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        if (response.data.technician?.shopMapsLink) {
          setShopMapsLink(response.data.technician.shopMapsLink);
        }
        setShopMessage('Shop details updated successfully.');
        setProfileToast('Shop details updated successfully.');
        setTimeout(() => setShopMessage(''), 4000);
        setTimeout(() => setProfileToast(''), 3000);
      }
    } catch (error) {
      alert('Error updating shop details: ' + (error.response?.data?.message || error.message));
    } finally {
      setSavingShop(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching technician bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const customQuote = quoteInputs[bookingId];
      const payload = { status: newStatus };
      if (customQuote) payload.estimatedCost = `₹${customQuote.replace(/[^0-9.]/g, '')}`;

      const response = await axios.put(
        `${API_URL}/bookings/${bookingId}/status`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setProfileToast(`Work order status updated to ${newStatus}.`);
        fetchBookings();
        setTimeout(() => setProfileToast(''), 3000);
      }
    } catch (error) {
      alert('Failed to update booking: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendMessage = async (bookingId) => {
    const text = messageInputs[bookingId];
    if (!text || !text.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/bookings/${bookingId}/messages`,
        { text },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setMessageInputs(prev => ({ ...prev, [bookingId]: '' }));
        fetchBookings();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleToggleAvailability = async () => {
    const nextVal = !isAvailable;
    setIsAvailable(nextVal);
    try {
      await axios.put(
        `${API_URL}/technicians/profile`,
        { available: nextVal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfileToast(`Status set to ${nextVal ? 'Available for Jobs' : 'Offline / Busy'}.`);
      setTimeout(() => setProfileToast(''), 3000);
    } catch (e) {
      setIsAvailable(!nextVal);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);

    try {
      const skillsArray = profileSkills.split(',').map(s => s.trim()).filter(Boolean);
      const response = await axios.put(
        `${API_URL}/technicians/profile`,
        {
          name: profileName,
          specialty: profileSpecialty,
          rate: profileRate,
          city: profileCity,
          phone: profilePhone,
          bio: profileBio,
          available: isAvailable,
          skills: skillsArray
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setIsEditProfileOpen(false);
        setProfileToast('Technician profile saved.');
        setTimeout(() => setProfileToast(''), 3000);
      }
    } catch (error) {
      alert('Error updating profile: ' + (error.response?.data?.message || error.message));
    } finally {
      setSavingProfile(false);
    }
  };

  const newRequestsList = bookings.filter(b => b.status === 'pending');
  const activeRepairsList = bookings.filter(b => b.status === 'accepted' || b.status === 'in-progress');
  const completedJobsList = bookings.filter(b => b.status === 'completed');

  const totalEarningsVal = completedJobsList.reduce((sum, b) => {
    const val = parseInt((b.estimatedCost || '').replace(/[^0-9]/g, '')) || 499;
    return sum + val;
  }, 0);

  return (
    <div className="customer-portal-container">
      {profileToast && (
        <div className="status-toast-notification">
          <span>{profileToast}</span>
          <button type="button" onClick={() => setProfileToast('')}>✕</button>
        </div>
      )}

      {/* TOP HEADER */}
      <div className="portal-top-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="greeting-pill">VERIFIED TECHNICIAN PORTAL</span>
              <span className="verified-chip">Verified</span>
            </div>
            <h2>{profileName || user.name}</h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
              Specialization: <strong>{profileSpecialty || user.specialty}</strong> • Rating: <strong>{user.rating || 5.0} ★</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              className={`btn-availability ${isAvailable ? 'online' : 'offline'}`}
              onClick={handleToggleAvailability}
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: isAvailable ? '#bbf7d0' : '#cbd5e1',
                background: isAvailable ? '#dcfce7' : '#f1f5f9',
                color: isAvailable ? '#166534' : '#64748b',
                fontWeight: '600',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              {isAvailable ? 'Available for Jobs' : 'Offline / Busy'}
            </button>

            <button
              type="button"
              className="btn-secondary-outline"
              onClick={() => setIsEditProfileOpen(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="portal-tabs-bar">
        <button
          type="button"
          className={`portal-tab-btn ${activeFilter === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveFilter('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`portal-tab-btn ${activeFilter === 'new' ? 'active' : ''}`}
          onClick={() => setActiveFilter('new')}
        >
          New Requests ({newRequestsList.length})
        </button>
        <button
          type="button"
          className={`portal-tab-btn ${activeFilter === 'active' ? 'active' : ''}`}
          onClick={() => setActiveFilter('active')}
        >
          Active Jobs ({activeRepairsList.length})
        </button>
        <button
          type="button"
          className={`portal-tab-btn ${activeFilter === 'history' ? 'active' : ''}`}
          onClick={() => setActiveFilter('history')}
        >
          Job History ({completedJobsList.length})
        </button>
        <button
          type="button"
          className={`portal-tab-btn ${activeFilter === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveFilter('profile')}
        >
          Profile
        </button>
      </div>

      {/* TAB CONTENT VIEWS */}
      {/* OVERVIEW TAB */}
      {activeFilter === 'overview' && (
        <div className="tab-pane-overview">
          <div className="summary-cards-grid">
            <div className="summary-card" onClick={() => setActiveFilter('new')}>
              <div className="summary-card-data">
                <span className="summary-num">{newRequestsList.length}</span>
                <span className="summary-label">New Requests</span>
              </div>
            </div>

            <div className="summary-card" onClick={() => setActiveFilter('active')}>
              <div className="summary-card-data">
                <span className="summary-num">{activeRepairsList.length}</span>
                <span className="summary-label">Active Jobs</span>
              </div>
            </div>

            <div className="summary-card" onClick={() => setActiveFilter('history')}>
              <div className="summary-card-data">
                <span className="summary-num">{completedJobsList.length}</span>
                <span className="summary-label">Completed Jobs</span>
              </div>
            </div>

            <div className="summary-card" onClick={() => setActiveFilter('history')}>
              <div className="summary-card-data">
                <span className="summary-num">₹{totalEarningsVal.toLocaleString()}</span>
                <span className="summary-label">Total Earnings</span>
              </div>
            </div>
          </div>

          <div className="clean-card-box style-margin-top">
            <div className="box-header">
              <h3>Recent Incoming Job Requests</h3>
              <p>Quick action on pending customer bookings.</p>
            </div>

            {newRequestsList.length === 0 ? (
              <div className="empty-state">No new pending requests.</div>
            ) : (
              <div className="table-responsive-container">
                <table className="requests-data-table">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Device</th>
                      <th>Issue</th>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newRequestsList.slice(0, 3).map((booking) => (
                      <tr key={booking.id}>
                        <td><strong>{booking.customerName}</strong></td>
                        <td>{booking.itemType}</td>
                        <td style={{ maxWidth: '200px' }}>{booking.issue}</td>
                        <td>{booking.pickupDate}</td>
                        <td>{booking.address}</td>
                        <td><span className="status-tag-table status-pending">PENDING</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            <button
                              type="button"
                              className="btn-table-pay"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'accepted')}
                            >
                              Accept
                            </button>
                            <button
                              type="button"
                              className="btn-table-cancel"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'declined')}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NEW REQUESTS TABLE TAB */}
      {activeFilter === 'new' && (
        <div className="clean-card-box">
          <div className="box-header">
            <h3>New Service Requests</h3>
            <p>Review customer repair requests and accept or decline.</p>
          </div>

          {loading ? (
            <div className="loading-state">Loading job requests...</div>
          ) : newRequestsList.length === 0 ? (
            <div className="empty-state">No new pending job requests.</div>
          ) : (
            <div className="table-responsive-container">
              <table className="requests-data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Device</th>
                    <th>Issue</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {newRequestsList.map((booking) => (
                    <tr key={booking.id}>
                      <td><strong>{booking.customerName}</strong><br/><small style={{ color: '#64748b' }}>{booking.customerPhone || 'N/A'}</small></td>
                      <td><strong>{booking.itemType}</strong></td>
                      <td style={{ maxWidth: '220px' }}>{booking.issue}</td>
                      <td>{booking.pickupDate}</td>
                      <td>{booking.address}</td>
                      <td><span className="status-tag-table status-pending">PENDING</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="btn-table-pay"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'accepted')}
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className="btn-table-cancel"
                            onClick={() => handleUpdateBookingStatus(booking.id, 'declined')}
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => setSelectedJobForDetails(selectedJobForDetails?.id === booking.id ? null : booking)}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedJobForDetails && (
                <div className="expanded-details-box style-margin-top">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Job #{selectedJobForDetails.id} Details</h4>
                    <button type="button" onClick={() => setSelectedJobForDetails(null)} className="close-btn">✕</button>
                  </div>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}><strong>Problem:</strong> {selectedJobForDetails.issue}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ACTIVE JOBS TABLE TAB */}
      {activeFilter === 'active' && (
        <div className="clean-card-box">
          <div className="box-header">
            <h3>Active Repair Jobs</h3>
            <p>Work orders in progress and accepted for service.</p>
          </div>

          {loading ? (
            <div className="loading-state">Loading active work orders...</div>
          ) : activeRepairsList.length === 0 ? (
            <div className="empty-state">No active repair jobs.</div>
          ) : (
            <div className="table-responsive-container">
              <table className="requests-data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Device</th>
                    <th>Issue</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeRepairsList.map((booking) => (
                    <tr key={booking.id}>
                      <td><strong>{booking.customerName}</strong></td>
                      <td><strong>{booking.itemType}</strong></td>
                      <td style={{ maxWidth: '200px' }}>{booking.issue}</td>
                      <td>{booking.pickupDate}</td>
                      <td>{booking.address}</td>
                      <td>
                        <span className={`status-tag-table status-${booking.status}`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {booking.status === 'accepted' && (
                            <button
                              type="button"
                              className="btn-table-pay"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'in-progress')}
                            >
                              In Progress
                            </button>
                          )}

                          {booking.status === 'in-progress' && (
                            <button
                              type="button"
                              className="btn-table-pay"
                              onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                            >
                              Mark Completed
                            </button>
                          )}

                          <button
                            type="button"
                            className="btn-table-action"
                            onClick={() => setSelectedJobForDetails(selectedJobForDetails?.id === booking.id ? null : booking)}
                          >
                            Chat
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {selectedJobForDetails && (
                <div className="expanded-details-box style-margin-top">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4>Chat with {selectedJobForDetails.customerName} (Job #{selectedJobForDetails.id})</h4>
                    <button type="button" onClick={() => setSelectedJobForDetails(null)} className="close-btn">✕</button>
                  </div>

                  {selectedJobForDetails.messages && selectedJobForDetails.messages.length > 0 && (
                    <div className="chat-thread-box style-margin-top">
                      <span className="chat-head">Chat History</span>
                      {selectedJobForDetails.messages.map((m, idx) => (
                        <div key={idx} className={`chat-bubble ${m.sender === 'technician' ? 'mine' : 'theirs'}`}>
                          <span className="author">{m.sender === 'technician' ? 'You' : selectedJobForDetails.customerName}:</span>
                          <p>{m.text}</p>
                          <span className="time">{m.time}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="chat-input-row style-margin-top">
                    <input
                      type="text"
                      placeholder="Send update to customer..."
                      value={messageInputs[selectedJobForDetails.id] || ''}
                      onChange={(e) => setMessageInputs({ ...messageInputs, [selectedJobForDetails.id]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(selectedJobForDetails.id); }}
                    />
                    <button type="button" onClick={() => handleSendMessage(selectedJobForDetails.id)}>Send</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* HISTORY TABLE TAB */}
      {activeFilter === 'history' && (
        <div className="clean-card-box">
          <div className="box-header">
            <h3>Completed Job History</h3>
            <p>Archived record of all completed repair work orders.</p>
          </div>

          {completedJobsList.length === 0 ? (
            <div className="empty-state">No completed jobs yet.</div>
          ) : (
            <div className="table-responsive-container">
              <table className="requests-data-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Device</th>
                    <th>Issue</th>
                    <th>Date</th>
                    <th>Quote / Earnings</th>
                    <th>Review</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {completedJobsList.map((booking) => (
                    <tr key={booking.id}>
                      <td><strong>{booking.customerName}</strong></td>
                      <td>{booking.itemType}</td>
                      <td>{booking.issue}</td>
                      <td>{booking.pickupDate}</td>
                      <td className="green-text"><strong>{booking.estimatedCost || '₹499'}</strong></td>
                      <td>
                        {booking.review ? (
                          <span style={{ fontSize: '0.8rem', color: '#166534' }}>{booking.review.rating}/5 ★</span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No review</span>
                        )}
                      </td>
                      <td><span className="status-tag-table status-completed">COMPLETED</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* PROFILE TAB */}
      {activeFilter === 'profile' && (
        <div className="tab-pane-profile">
          <div className="clean-card-box">
            <div className="box-header">
              <h3>Technician Profile Details</h3>
              <p>Your details displayed to local customers looking for repairs.</p>
            </div>

            <div className="result-attributes-list">
              <div className="attr-item">
                <span className="attr-label">Name</span>
                <strong className="attr-val">{profileName}</strong>
              </div>
              <div className="attr-item">
                <span className="attr-label">Specialty</span>
                <strong className="attr-val">{profileSpecialty}</strong>
              </div>
              <div className="attr-item">
                <span className="attr-label">Hourly Rate</span>
                <strong className="attr-val green-text">{profileRate}</strong>
              </div>
              <div className="attr-item">
                <span className="attr-label">Location / City</span>
                <strong className="attr-val">{profileCity}</strong>
              </div>
              <div className="attr-item">
                <span className="attr-label">Phone</span>
                <strong className="attr-val">{profilePhone || 'N/A'}</strong>
              </div>
              <div className="attr-item">
                <span className="attr-label">Availability</span>
                <strong className="attr-val">{isAvailable ? 'Available' : 'Offline'}</strong>
              </div>
              <div className="attr-item span-full">
                <span className="attr-label">Qualifications & Workshop Bio</span>
                <p className="attr-desc">{profileBio || 'No bio provided.'}</p>
              </div>
            </div>

            <button type="button" className="btn-primary-green style-margin-top" onClick={() => setIsEditProfileOpen(true)}>
              Edit Profile
            </button>
          </div>

          {/* SHOP DETAILS SECTION */}
          <div className="clean-card-box style-margin-top">
            <div className="box-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3>Shop Details</h3>
                <p>Provide your physical repair shop information for Google Maps navigation.</p>
              </div>
              {shopMapsLink && (
                <a
                  href={shopMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-table-action"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  View on Google Maps ↗
                </a>
              )}
            </div>

            {shopMessage && (
              <div className="location-status-msg success-text" style={{ padding: '0.65rem 1rem', background: '#dcfce7', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '1.25rem' }}>
                {shopMessage}
              </div>
            )}

            <form onSubmit={handleSaveShopDetails} className="clean-diag-form" style={{ margin: 0 }}>
              <div className="form-row-grid">
                <div className="form-group-item span-full">
                  <label>Shop Name</label>
                  <input
                    type="text"
                    placeholder="e.g. iCare Tech Solutions"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="clean-input"
                  />
                </div>

                <div className="form-group-item span-full">
                  <label>Shop Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop No. 12, Main Market, Dharampeth"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    className="clean-input"
                  />
                </div>

                <div className="form-group-item">
                  <label>City / Area</label>
                  <input
                    type="text"
                    placeholder="Nagpur"
                    value={shopCity}
                    onChange={(e) => setShopCity(e.target.value)}
                    className="clean-input"
                  />
                </div>

                <div className="form-group-item">
                  <label>Pincode</label>
                  <input
                    type="text"
                    placeholder="440001"
                    value={shopPincode}
                    onChange={(e) => setShopPincode(e.target.value)}
                    className="clean-input"
                  />
                </div>

                <div className="form-group-item span-full">
                  <label>Shop Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    className="clean-input"
                  />
                </div>

                <div className="form-group-item span-full" style={{ marginTop: '0.5rem' }}>
                  <button type="submit" className="btn-primary-green" disabled={savingShop}>
                    {savingShop ? 'Saving Shop Details...' : 'Save Shop Details'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="modal-backdrop" onClick={() => setIsEditProfileOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Edit Technician Profile</h3>
              <button type="button" className="close-btn" onClick={() => setIsEditProfileOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="modal-form">
              <div className="form-item">
                <label>Name / Workshop Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div className="form-item-grid">
                <div className="form-item">
                  <label>Specialty</label>
                  <select
                    value={profileSpecialty}
                    onChange={(e) => setProfileSpecialty(e.target.value)}
                  >
                    <option value="Electronics & Phones">Electronics & Phones</option>
                    <option value="Appliances">Appliances</option>
                    <option value="Bicycles">Bicycles</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                </div>

                <div className="form-item">
                  <label>Hourly Rate (₹)</label>
                  <input
                    type="text"
                    value={profileRate}
                    onChange={(e) => setProfileRate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-item-grid">
                <div className="form-item">
                  <label>City</label>
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    required
                  />
                </div>

                <div className="form-item">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-item">
                <label>Skills (comma-separated)</label>
                <input
                  type="text"
                  value={profileSkills}
                  onChange={(e) => setProfileSkills(e.target.value)}
                />
              </div>

              <div className="form-item">
                <label>Qualifications & Workshop Bio</label>
                <textarea
                  rows="3"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                />
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setIsEditProfileOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default TechnicianDashboard;
