import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BuyerDashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function BuyerDashboard({ user, token, activeTab, setActiveTab }) {
  const [stats, setStats] = useState({
    availableMaterials: 0,
    myActiveOffers: 0,
    acceptedOffers: 0,
    completedTransactions: 0
  });

  const [materials, setMaterials] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterialType, setSelectedMaterialType] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Offer Modal State
  const [offerModalMaterial, setOfferModalMaterial] = useState(null);
  const [offeredQuantity, setOfferedQuantity] = useState('');
  const [offeredPrice, setOfferedPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Profile Edit State
  const [companyName, setCompanyName] = useState(user.companyName || '');
  const [contactName, setContactName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.phone || '+91 ');
  const [city, setCity] = useState(user.city || 'Nagpur');
  const [address, setAddress] = useState(user.address || '');
  const [materialsWanted, setMaterialsWanted] = useState(
    user.materialsWanted || ['Copper', 'Aluminium', 'Electronic Components']
  );
  const [savingProfile, setSavingProfile] = useState(false);

  const materialCategories = [
    'All',
    'Copper',
    'Aluminium',
    'Steel',
    'Plastic',
    'Electronic Components',
    'Mixed E-Waste'
  ];

  const cityList = ['All', 'Nagpur', 'Mumbai', 'Pune', 'Delhi NCR', 'Bangalore', 'Hyderabad'];

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch materials
      const matRes = await axios.get(`${API_URL}/materials`, {
        params: {
          q: searchTerm,
          materialType: selectedMaterialType === 'All' ? '' : selectedMaterialType,
          location: selectedLocation === 'All' ? '' : selectedLocation,
          status: selectedStatus === 'All' ? '' : selectedStatus
        }
      });

      if (matRes.data.success) {
        setMaterials(matRes.data.materials || []);
      }

      // 2. Fetch buyer profile & stats
      const profRes = await axios.get(`${API_URL}/buyers/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (profRes.data.success) {
        setStats(profRes.data.stats || {});
        if (profRes.data.buyer) {
          setCompanyName(profRes.data.buyer.companyName || '');
          setContactName(profRes.data.buyer.name || '');
          setPhone(profRes.data.buyer.phone || '');
          setCity(profRes.data.buyer.city || '');
          setAddress(profRes.data.buyer.address || '');
          if (profRes.data.buyer.materialsWanted) {
            setMaterialsWanted(profRes.data.buyer.materialsWanted);
          }
        }
      }

      // 3. Fetch buyer offers
      const offRes = await axios.get(`${API_URL}/buyer/offers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (offRes.data.success) {
        setOffers(offRes.data.offers || []);
      }
    } catch (err) {
      console.error('Error fetching buyer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOfferModal = (mat) => {
    setOfferModalMaterial(mat);
    setOfferedQuantity(mat.quantity.toString());
    setOfferedPrice(mat.estimatedValue.replace(/[^0-9]/g, ''));
    setOfferMessage(`Offer from ${companyName || user.name} for procurement.`);
  };

  const handleCloseOfferModal = () => {
    setOfferModalMaterial(null);
    setOfferedQuantity('');
    setOfferedPrice('');
    setOfferMessage('');
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!offerModalMaterial || !offeredPrice) return;

    setSubmittingOffer(true);
    try {
      const response = await axios.post(
        `${API_URL}/materials/${offerModalMaterial.id}/offers`,
        {
          quantity: offeredQuantity || offerModalMaterial.quantity,
          offeredPrice: `₹${offeredPrice.replace(/[^0-9]/g, '')}`,
          message: offerMessage
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        handleCloseOfferModal();
        setToast(`Offer of ₹${offeredPrice} submitted for ${offerModalMaterial.materialType}.`);
        fetchDashboardData();
        setTimeout(() => setToast(''), 4000);
      }
    } catch (err) {
      alert('Failed to place offer: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleUpdateOfferStatus = async (offerId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/offers/${offerId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setToast(`Transaction marked as ${newStatus}.`);
        fetchDashboardData();
        setTimeout(() => setToast(''), 4000);
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await axios.put(
        `${API_URL}/buyers/profile`,
        {
          companyName,
          name: contactName,
          phone,
          city,
          address,
          materialsWanted
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setToast('Company profile saved successfully.');
        setTimeout(() => setToast(''), 4000);
      }
    } catch (err) {
      alert('Failed to update profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingProfile(false);
    }
  };

  const toggleMaterialWanted = (matName) => {
    if (materialsWanted.includes(matName)) {
      setMaterialsWanted(materialsWanted.filter((m) => m !== matName));
    } else {
      setMaterialsWanted([...materialsWanted, matName]);
    }
  };

  const completedTransactions = offers.filter((o) => o.status === 'completed');

  return (
    <div className="buyer-dashboard">
      {/* Toast */}
      {toast && (
        <div className="buyer-toast">
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')}>✕</button>
        </div>
      )}

      {/* Header Banner */}
      <div className="buyer-header">
        <div className="buyer-header-content">
          <div className="buyer-title-wrap">
            <span className="buyer-badge">Raw Material Recycler & Buyer Portal</span>
            <h1>{companyName || user.name}</h1>
            <p className="buyer-subtitle">
              Sourcing verified recovered raw materials from local circular e-waste collections
            </p>
          </div>

          <div className="buyer-quick-location">
            <span>Primary Hub: <strong>{city}</strong></span>
            <span className="verified-pill">Verified Industrial Recycler</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="buyer-stats-grid">
          <div className="buyer-stat-card">
            <span className="stat-label">Available Lots</span>
            <strong className="stat-value">{stats.availableMaterials || materials.filter(m => m.status === 'available').length}</strong>
            <span className="stat-hint">Ready for bidding</span>
          </div>
          <div className="buyer-stat-card">
            <span className="stat-label">My Active Offers</span>
            <strong className="stat-value">{stats.myActiveOffers || offers.filter(o => o.status === 'pending').length}</strong>
            <span className="stat-hint">Pending evaluation</span>
          </div>
          <div className="buyer-stat-card highlight">
            <span className="stat-label">Accepted Matches</span>
            <strong className="stat-value">{stats.acceptedOffers || offers.filter(o => o.status === 'accepted').length}</strong>
            <span className="stat-hint">Ready for fulfillment</span>
          </div>
          <div className="buyer-stat-card">
            <span className="stat-label">Completed Orders</span>
            <strong className="stat-value">{stats.completedTransactions || completedTransactions.length}</strong>
            <span className="stat-hint">Full lifecycle closed</span>
          </div>
        </div>
      </div>

      {/* 1. MARKETPLACE TAB */}
      {(activeTab === 'materials' || activeTab === 'marketplace' || !activeTab) && (
        <div className="buyer-tab-content">
          <div className="section-toolbar">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by material (e.g. Copper), source device, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <select
                value={selectedMaterialType}
                onChange={(e) => setSelectedMaterialType(e.target.value)}
              >
                {materialCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Material Types' : cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                {cityList.map((c) => (
                  <option key={c} value={c}>
                    {c === 'All' ? 'All Locations' : c}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="available">Available</option>
                <option value="offer_received">Offer Received</option>
                <option value="buyer_matched">Buyer Matched</option>
              </select>

              <button
                type="button"
                className="btn-refresh"
                onClick={fetchDashboardData}
                title="Refresh Marketplace"
              >
                Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading recovered material lots...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="empty-state-box">
              <h3>No recovered materials found</h3>
              <p>Try adjusting your search criteria or material category filter.</p>
            </div>
          ) : (
            <div className="materials-grid">
              {materials.map((mat) => {
                const myOffer = offers.find((o) => o.materialId === mat.id);
                return (
                  <div key={mat.id} className={`material-card ${mat.status}`}>
                    <div className="material-card-header">
                      <div className="mat-type-group">
                        <span className={`mat-type-badge ${mat.materialType.toLowerCase().replace(/[^a-z]/g, '')}`}>
                          {mat.materialType}
                        </span>
                        <span className="mat-source-tag">Source: {mat.itemType}</span>
                      </div>
                      <span className={`status-pill ${mat.status}`}>
                        {mat.status === 'available' && 'Available'}
                        {mat.status === 'offer_received' && 'Offer Received'}
                        {mat.status === 'buyer_matched' && 'Buyer Matched'}
                        {mat.status === 'completed' && 'Completed'}
                      </span>
                    </div>

                    <div className="material-details-grid">
                      <div className="detail-item">
                        <span className="detail-label">Quantity</span>
                        <strong className="detail-val">{mat.quantity} {mat.unit || 'kg'}</strong>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Location</span>
                        <strong className="detail-val">{mat.location}</strong>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Estimated Material Value</span>
                        <strong className="detail-val price-text">{mat.estimatedValue}</strong>
                      </div>
                    </div>

                    <div className="material-card-footer">
                      <div className="lot-info">
                        <span className="lot-id">Lot #{mat.id}</span>
                        {mat.offersCount > 0 && (
                          <span className="offers-count">
                            {mat.offersCount} {mat.offersCount === 1 ? 'offer' : 'offers'} active
                          </span>
                        )}
                      </div>

                      {myOffer ? (
                        <div className="my-offer-badge">
                          <span>My Offer: <strong>{myOffer.offeredPrice}</strong> ({myOffer.status})</span>
                        </div>
                      ) : mat.status === 'buyer_matched' || mat.status === 'completed' ? (
                        <button type="button" className="btn-offer-disabled" disabled>
                          Matched with Buyer
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn-make-offer"
                          onClick={() => handleOpenOfferModal(mat)}
                        >
                          Make Offer →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. MY OFFERS TAB */}
      {activeTab === 'offers' && (
        <div className="buyer-tab-content">
          <div className="section-head-bar">
            <h2>My Material Offers & Bids</h2>
            <p>Track offers placed on recovered raw material lots across processing hubs</p>
          </div>

          {offers.length === 0 ? (
            <div className="empty-state-box">
              <h3>You haven't made any offers yet</h3>
              <p>Explore the Available Materials marketplace to place bids on copper, aluminium, components, and plastics.</p>
              <button
                type="button"
                className="btn-action-primary"
                onClick={() => setActiveTab && setActiveTab('marketplace')}
              >
                Browse Marketplace →
              </button>
            </div>
          ) : (
            <div className="offers-table-card">
              <table className="buyer-table">
                <thead>
                  <tr>
                    <th>Offer ID</th>
                    <th>Material Type</th>
                    <th>Source Device</th>
                    <th>Quantity</th>
                    <th>Offered Price</th>
                    <th>Status</th>
                    <th>Date Placed</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer.id}>
                      <td><strong>#OFF-{offer.id}</strong></td>
                      <td>
                        <span className="table-mat-badge">{offer.materialType}</span>
                      </td>
                      <td>{offer.itemType || (offer.material ? offer.material.itemType : 'E-Waste Unit')}</td>
                      <td>{offer.quantity} {offer.unit || 'kg'}</td>
                      <td><strong className="table-price">{offer.offeredPrice}</strong></td>
                      <td>
                        <span className={`status-pill ${offer.status}`}>
                          {offer.status === 'pending' && 'Pending Review'}
                          {offer.status === 'accepted' && 'Buyer Matched (Accepted)'}
                          {offer.status === 'rejected' && 'Rejected'}
                          {offer.status === 'completed' && 'Completed'}
                        </span>
                      </td>
                      <td>{new Date(offer.createdAt).toLocaleDateString()}</td>
                      <td>
                        {offer.status === 'accepted' && (
                          <button
                            type="button"
                            className="btn-complete-tx"
                            onClick={() => handleUpdateOfferStatus(offer.id, 'completed')}
                          >
                            Mark Fulfilled
                          </button>
                        )}
                        {offer.status === 'pending' && (
                          <span className="action-note">Awaiting match</span>
                        )}
                        {offer.status === 'completed' && (
                          <span className="action-note-done">Transaction Closed</span>
                        )}
                        {offer.status === 'rejected' && (
                          <span className="action-note-rej">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. TRANSACTIONS TAB */}
      {activeTab === 'transactions' && (
        <div className="buyer-tab-content">
          <div className="section-head-bar">
            <h2>Completed Material Transactions</h2>
            <p>Auditable records of all fulfilled circular material procurements</p>
          </div>

          {completedTransactions.length === 0 ? (
            <div className="empty-state-box">
              <h3>No completed transactions yet</h3>
              <p>When an accepted material offer is picked up and settled, it will appear in your transaction history.</p>
            </div>
          ) : (
            <div className="transactions-list">
              {completedTransactions.map((tx) => (
                <div key={tx.id} className="transaction-card">
                  <div className="tx-header">
                    <div>
                      <span className="tx-id">TX-REF-{tx.id}-MAT</span>
                      <h3>{tx.materialType} Procurement ({tx.quantity} {tx.unit || 'kg'})</h3>
                    </div>
                    <strong className="tx-amount">{tx.offeredPrice}</strong>
                  </div>

                  <div className="tx-details-row">
                    <div className="tx-detail">
                      <span>Source E-Waste</span>
                      <strong>{tx.itemType || 'Recovered Electronic Device'}</strong>
                    </div>
                    <div className="tx-detail">
                      <span>Buyer Company</span>
                      <strong>{tx.buyerCompanyName}</strong>
                    </div>
                    <div className="tx-detail">
                      <span>Date Completed</span>
                      <strong>{new Date(tx.createdAt).toLocaleDateString()}</strong>
                    </div>
                    <div className="tx-detail">
                      <span>Status</span>
                      <span className="status-pill completed">Fulfilled & Settled</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. COMPANY PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="buyer-tab-content">
          <div className="section-head-bar">
            <h2>Industrial Buyer & Recycler Profile</h2>
            <p>Manage your registered enterprise credentials, target materials, and warehouse location</p>
          </div>

          <div className="profile-edit-card">
            <form onSubmit={handleSaveProfile} className="buyer-profile-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Company / Enterprise Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Authorized Representative Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Primary Hub / City</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="Nagpur">Nagpur (Central India Hub)</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Delhi NCR">Delhi NCR</option>
                    <option value="Bangalore">Bengaluru</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Contact Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Warehouse / Recovery Yard Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot 42, MIDC Industrial Area, Hingna, Nagpur"
                />
              </div>

              <div className="form-group">
                <label>Target Materials Sourced</label>
                <div className="materials-pills-selector">
                  {[
                    'Copper',
                    'Aluminium',
                    'Steel',
                    'Plastic',
                    'Electronic Components',
                    'Mixed E-Waste'
                  ].map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      className={`mat-pill-btn ${materialsWanted.includes(mat) ? 'selected' : ''}`}
                      onClick={() => toggleMaterialWanted(mat)}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-save-profile" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. MAKE OFFER MODAL */}
      {offerModalMaterial && (
        <div className="buyer-modal-overlay" onClick={handleCloseOfferModal}>
          <div className="buyer-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Make Offer on Recovered Material</h3>
              <button type="button" className="btn-close-modal" onClick={handleCloseOfferModal}>✕</button>
            </div>

            <div className="modal-material-summary">
              <div className="summary-col">
                <span className="summary-lbl">Material</span>
                <strong>{offerModalMaterial.materialType}</strong>
              </div>
              <div className="summary-col">
                <span className="summary-lbl">Source Item</span>
                <strong>{offerModalMaterial.itemType}</strong>
              </div>
              <div className="summary-col">
                <span className="summary-lbl">Location</span>
                <strong>{offerModalMaterial.location}</strong>
              </div>
              <div className="summary-col">
                <span className="summary-lbl">Estimated Material Value</span>
                <strong className="summary-price">{offerModalMaterial.estimatedValue}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmitOffer} className="offer-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Quantity to Procure ({offerModalMaterial.unit || 'kg'})</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={offerModalMaterial.quantity}
                    value={offeredQuantity}
                    onChange={(e) => setOfferedQuantity(e.target.value)}
                    required
                  />
                  <span className="input-hint">Max available: {offerModalMaterial.quantity} {offerModalMaterial.unit || 'kg'}</span>
                </div>

                <div className="form-group">
                  <label>Your Offered Total Price (₹)</label>
                  <input
                    type="text"
                    placeholder="e.g. 550"
                    value={offeredPrice}
                    onChange={(e) => setOfferedPrice(e.target.value)}
                    required
                  />
                  <span className="input-hint">Estimated benchmark: {offerModalMaterial.estimatedValue}</span>
                </div>
              </div>

              <div className="form-group">
                <label>Procurement Note / Fulfillment Logistics</label>
                <textarea
                  rows="2"
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="e.g. Can dispatch pickup vehicle from Nagpur warehouse tomorrow."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseOfferModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit-offer" disabled={submittingOffer}>
                  {submittingOffer ? 'Submitting...' : 'Submit Purchase Offer →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;
