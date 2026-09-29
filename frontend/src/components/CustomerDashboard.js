import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const EWASTE_STAGES = [
  { key: 'requested', label: 'Requested' },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { key: 'collected', label: 'Collected' },
  { key: 'sorting', label: 'Sorting' },
  { key: 'material_recovered', label: 'Material Recovered' },
  { key: 'buyer_matched', label: 'Buyer Matched' },
  { key: 'completed', label: 'Completed' }
];

// Helper to format OpenStreetMap Nominatim address
const formatNominatimAddress = (data) => {
  if (!data || !data.address) return null;
  const a = data.address;
  const parts = [];

  const locality = a.suburb || a.neighbourhood || a.village || a.town || a.residential || a.subdistrict;
  const city = a.city || a.town || a.city_district || a.county || a.district;
  const state = a.state || a.region;

  if (locality) parts.push(locality);
  if (city && city !== locality) parts.push(city);
  if (state && state !== city) parts.push(state);

  if (parts.length > 0) return parts.join(', ');
  if (data.display_name) return data.display_name.split(',').slice(0, 3).join(', ');
  return null;
};

function CustomerDashboard({ user, token, activeTab = 'overview', setActiveTab }) {
  const [technicians, setTechnicians] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [recycleRequests, setRecycleRequests] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [rewardsBalance, setRewardsBalance] = useState(0);
  const [currentTab, setCurrentTab] = useState(activeTab || 'overview');
  
  // Explicit Location State - NO automatic assumption or hardcoded fallback!
  const [userLocation, setUserLocation] = useState(() => {
    const saved = localStorage.getItem('customer_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.latitude || parsed.city)) return parsed;
      } catch (e) {}
    }
    return null;
  });
  
  const [manualCityInput, setManualCityInput] = useState('');
  const [showLocationChangeForm, setShowLocationChangeForm] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [locationError, setLocationError] = useState('');
  const [locating, setLocating] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('');
  const [sortBy, setSortBy] = useState('nearest'); // 'nearest' | 'rating'
  const [availabilityFilter, setAvailabilityFilter] = useState('all'); // 'all' | 'available'
  
  const [loadingTechs, setLoadingTechs] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Diagnostic Assistant
  const [diagItemType, setDiagItemType] = useState('');
  const [diagIssue, setDiagIssue] = useState('');
  const [diagCategory, setDiagCategory] = useState('Electronics & Phones');
  const [diagImage, setDiagImage] = useState(null);
  const [diagAnalyzing, setDiagAnalyzing] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  
  // Map Modal
  const [mapModalData, setMapModalData] = useState(null);

  // Selected Booking Details View
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState(null);
  const [selectedEwasteForDetails, setSelectedEwasteForDetails] = useState(null);

  // Booking Modal
  const [selectedTechForBooking, setSelectedTechForBooking] = useState(null);
  const [bookingItem, setBookingItem] = useState('');
  const [bookingIssue, setBookingIssue] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [bookingUrgency, setBookingUrgency] = useState('Standard');
  const [bookingAddress, setBookingAddress] = useState(
    userLocation ? (userLocation.addressName || userLocation.city || '') : ''
  );
  const [bookingPhone, setBookingPhone] = useState(user.phone || '+91 ');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingToast, setBookingToast] = useState('');

  // Recycle Modal
  const [isRecycleModalOpen, setIsRecycleModalOpen] = useState(false);
  const [recycleItem, setRecycleItem] = useState('');
  const [recyclePayout, setRecyclePayout] = useState('₹500');
  const [recyclePayoutType, setRecyclePayoutType] = useState('points'); // 'cash' | 'points'
  const [recycleDate, setRecycleDate] = useState('');
  const [recycleAddress, setRecycleAddress] = useState(
    userLocation ? (userLocation.addressName || userLocation.city || '') : ''
  );
  const [submittingRecycle, setSubmittingRecycle] = useState(false);

  // Review Modal
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [messageInputs, setMessageInputs] = useState({});

  useEffect(() => {
    if (activeTab) setCurrentTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchTechnicians();
    fetchBookings();
    fetchRecycleRequests();
    fetchRewards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTechnicians();
    }, 200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory, selectedCity, sortBy]);

  // Browser Geolocation + OpenStreetMap Reverse Geocoding
  const handleGetBrowserLocation = () => {
    setLocating(true);
    setLocationStatus('Detecting your location...');
    setLocationError('');

    if (!navigator.geolocation) {
      setLocating(false);
      setLocationStatus('');
      setLocationError('Location services are not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        let addressName = '';
        let detectedCity = '';

        // Reverse Geocoding via OpenStreetMap Nominatim
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
            { headers: { 'Accept-Language': 'en' }, timeout: 5000 }
          );
          if (res.data && res.data.address) {
            const formatted = formatNominatimAddress(res.data);
            if (formatted) addressName = formatted;
            detectedCity = res.data.address.city || res.data.address.town || res.data.address.county || res.data.address.district || '';
          }
        } catch (e) {
          console.warn('Reverse geocoding failed or timed out:', e);
        }

        const displayLocName = addressName || 'Current location detected';

        const newLoc = {
          latitude: lat,
          longitude: lng,
          addressName: displayLocName,
          city: detectedCity,
          source: 'browser'
        };

        setUserLocation(newLoc);
        localStorage.setItem('customer_location', JSON.stringify(newLoc));
        setLocating(false);
        setLocationStatus('');
        setLocationError('');
        setShowLocationChangeForm(false);

        // Pre-fill booking & recycle address with human-readable location
        setBookingAddress(displayLocName);
        setRecycleAddress(displayLocName);
      },
      (error) => {
        setLocating(false);
        setLocationStatus('');
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission was denied. Enter your city or area manually to find nearby technicians.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Unable to detect your current location. Please try again or enter your city manually.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out. Please try again or enter your city manually.');
        } else {
          setLocationError('Unable to access your location. Please enter your city or area manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    if (!manualCityInput.trim()) return;

    const cityText = manualCityInput.trim();
    const newLoc = {
      latitude: null,
      longitude: null,
      addressName: cityText,
      city: cityText,
      source: 'manual'
    };

    setUserLocation(newLoc);
    setSelectedCity(cityText);
    localStorage.setItem('customer_location', JSON.stringify(newLoc));
    setLocationStatus('');
    setLocationError('');
    setShowLocationChangeForm(false);

    setBookingAddress(cityText);
    setRecycleAddress(cityText);
  };

  // Distance calculation helper (ONLY for actual browser coordinates or city match)
  const getDistanceDisplay = (tech) => {
    if (userLocation && userLocation.source === 'browser' && userLocation.latitude && userLocation.longitude && tech.lat && tech.lng) {
      const R = 6371; // km
      const dLat = (tech.lat - userLocation.latitude) * (Math.PI / 180);
      const dLon = (tech.lng - userLocation.longitude) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(userLocation.latitude * (Math.PI / 180)) * Math.cos(tech.lat * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const d = R * c;
      return `${(Math.round(d * 10) / 10).toFixed(1)} km away`;
    }

    const currentCity = userLocation ? (userLocation.city || userLocation.addressName || '').toLowerCase() : '';
    const techCity = (tech.city || '').toLowerCase();
    if (techCity && currentCity && (currentCity.includes(techCity) || techCity.includes(currentCity))) {
      return `Near ${tech.city}`;
    }
    return null;
  };

  // Technician Matching & Priority Sorting Helper
  const sortAndMatchTechnicians = (techList, targetCategory, sortPref) => {
    if (!techList || techList.length === 0) return [];

    const matchesCategory = (tech, cat) => {
      if (!cat || cat === 'All') return true;
      const lowerCat = cat.toLowerCase();
      const techSpecialty = (tech.specialty || '').toLowerCase();
      const techSkills = (tech.skills || []).map(s => s.toLowerCase()).join(' ');

      if (lowerCat.includes('electronics') || lowerCat.includes('phone') || lowerCat.includes('mobile')) {
        return (
          techSpecialty.includes('electronics') ||
          techSpecialty.includes('phone') ||
          techSpecialty.includes('mobile') ||
          techSkills.includes('phone') ||
          techSkills.includes('electronics') ||
          techSkills.includes('screen') ||
          techSkills.includes('soldering')
        );
      }
      if (lowerCat.includes('appliance')) {
        return techSpecialty.includes('appliance') || techSkills.includes('fridge') || techSkills.includes('ac');
      }
      if (lowerCat.includes('bicycle') || lowerCat.includes('bike')) {
        return techSpecialty.includes('bicycle') || techSpecialty.includes('bike');
      }
      if (lowerCat.includes('furniture')) {
        return techSpecialty.includes('furniture');
      }
      return techSpecialty.includes(lowerCat);
    };

    const getNumericDistance = (tech) => {
      if (userLocation && userLocation.source === 'browser' && userLocation.latitude && userLocation.longitude && tech.lat && tech.lng) {
        const R = 6371;
        const dLat = (tech.lat - userLocation.latitude) * (Math.PI / 180);
        const dLon = (tech.lng - userLocation.longitude) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLocation.latitude * (Math.PI / 180)) * Math.cos(tech.lat * (Math.PI / 180)) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      }
      const userCity = (userLocation ? userLocation.city || userLocation.addressName || '' : '').toLowerCase();
      const techCity = (tech.city || '').toLowerCase();
      if (userCity && techCity && userCity.includes(techCity)) {
        return 5.0; // Weight for same city
      }
      return 999.0;
    };

    return [...techList]
      .filter((tech) => {
        if (availabilityFilter === 'available' && tech.available === false) return false;
        return true;
      })
      .sort((a, b) => {
        // Priority 1: Category / Specialty Match
        const aMatch = matchesCategory(a, targetCategory);
        const bMatch = matchesCategory(b, targetCategory);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;

        // Priority 2: Availability
        const aAvail = a.available !== false;
        const bAvail = b.available !== false;
        if (aAvail && !bAvail) return -1;
        if (!aAvail && bAvail) return 1;

        // Priority 3 & 4: Distance & Rating
        if (sortPref === 'nearest') {
          const distA = getNumericDistance(a);
          const distB = getNumericDistance(b);
          if (distA !== distB) return distA - distB;
          return (b.rating || 0) - (a.rating || 0);
        } else {
          const rateA = a.rating || 0;
          const rateB = b.rating || 0;
          if (rateA !== rateB) return rateB - rateA;
          const distA = getNumericDistance(a);
          const distB = getNumericDistance(b);
          return distA - distB;
        }
      });
  };

  const getGoogleMapsLink = (tech) => {
    if (!tech) return null;
    if (tech.shopMapsLink && tech.shopMapsLink.trim()) return tech.shopMapsLink;
    const parts = [tech.shopName, tech.shopAddress || tech.address, tech.shopCity || tech.city, tech.shopPincode || tech.zipcode].filter(Boolean);
    if (parts.length > 0) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
    }
    if (tech.name && (tech.address || tech.city)) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${tech.name}, ${tech.address || tech.city}`)}`;
    }
    return null;
  };

  const fetchTechnicians = async () => {
    setLoadingTechs(true);
    try {
      const response = await axios.get(`${API_URL}/technicians`, {
        params: {
          q: searchTerm,
          category: selectedCategory === 'All' ? '' : selectedCategory,
          location: selectedCity,
          sort: sortBy
        }
      });
      if (response.data.success) {
        setTechnicians(response.data.technicians || []);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    } finally {
      setLoadingTechs(false);
    }
  };

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchRecycleRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/customer/recycle-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRecycleRequests(response.data.recycleRequests || []);
      }
    } catch (error) {
      console.error('Error fetching recycle requests:', error);
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${API_URL}/customer/rewards`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setRewards(response.data.rewards || []);
        setRewardsBalance(response.data.totalBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleTabChange = (tabKey) => {
    setCurrentTab(tabKey);
    if (setActiveTab) setActiveTab(tabKey);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file size should be less than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setDiagImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!diagItemType || !diagIssue) return;

    setDiagAnalyzing(true);
    try {
      const response = await axios.post(`${API_URL}/ai/analyze`, {
        itemType: diagItemType,
        issue: diagIssue,
        category: diagCategory,
        city: userLocation ? (userLocation.city || userLocation.addressName || '') : '',
        imageData: diagImage
      });
      if (response.data.success) {
        setDiagResult(response.data.analysis);
      }
    } catch (error) {
      alert('Diagnosis failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setDiagAnalyzing(false);
    }
  };

  const handleOpenBookingModal = (tech, prefillItem = '', prefillIssue = '') => {
    setSelectedTechForBooking(tech);
    setBookingItem(prefillItem || diagItemType || '');
    setBookingIssue(prefillIssue || diagIssue || '');
    setBookingAddress(userLocation ? (userLocation.addressName || userLocation.city || '') : '');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBookingDate(tomorrow.toISOString().split('T')[0]);
  };

  const handleCloseBookingModal = () => {
    setSelectedTechForBooking(null);
  };

  const handleOpenRecycleModal = (item, payout) => {
    setRecycleItem(item || diagItemType || 'Old Electronic Device');
    setRecyclePayout(payout || (diagResult?.recycleOption?.estimatedCashbackPayout) || '₹500');
    setRecyclePayoutType('points');
    setRecycleAddress(userLocation ? (userLocation.addressName || userLocation.city || '') : '');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    setRecycleDate(tomorrow.toISOString().split('T')[0]);
    setIsRecycleModalOpen(true);
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!selectedTechForBooking || !bookingItem || !bookingIssue) return;

    setBookingSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}/bookings`,
        {
          technicianId: selectedTechForBooking.id,
          itemType: bookingItem,
          category: selectedTechForBooking.specialty,
          issue: bookingIssue,
          pickupDate: bookingDate,
          urgency: bookingUrgency,
          address: bookingAddress,
          customerPhone: bookingPhone
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        handleCloseBookingModal();
        setBookingToast(`Booking confirmed with ${selectedTechForBooking.name}.`);
        fetchBookings();
        handleTabChange('bookings');
        setTimeout(() => setBookingToast(''), 4000);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleCreateRecycleRequest = async (e) => {
    e.preventDefault();
    if (!recycleItem) return;

    setSubmittingRecycle(true);
    try {
      const response = await axios.post(
        `${API_URL}/recycle-requests`,
        {
          itemType: recycleItem,
          estimatedPayout: recyclePayout,
          payoutType: recyclePayoutType,
          pickupDate: recycleDate,
          pickupAddress: recycleAddress
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setIsRecycleModalOpen(false);
        setBookingToast(`E-waste pickup scheduled. ${recyclePayoutType === 'points' ? 'Eco Points credited.' : ''}`);
        fetchRecycleRequests();
        fetchRewards();
        handleTabChange('ewaste');
        setTimeout(() => setBookingToast(''), 4000);
      }
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingRecycle(false);
    }
  };

  const handleSimulateNextStage = async (reqId, currentStatus) => {
    const currentIndex = EWASTE_STAGES.findIndex(s => s.key === currentStatus);
    if (currentIndex === -1 || currentIndex >= EWASTE_STAGES.length - 1) return;

    const nextStage = EWASTE_STAGES[currentIndex + 1].key;
    try {
      const response = await axios.put(
        `${API_URL}/recycle-requests/${reqId}/status`,
        { status: nextStage },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setBookingToast(`E-waste recovery stage updated to: "${nextStage}".`);
        fetchRecycleRequests();
        setTimeout(() => setBookingToast(''), 4000);
      }
    } catch (error) {
      alert('Failed to advance stage: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this request?')) return;
    try {
      const response = await axios.put(
        `${API_URL}/bookings/${bookingId}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setBookingToast('Request cancelled.');
        fetchBookings();
        setTimeout(() => setBookingToast(''), 3000);
      }
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handlePayBooking = async (bookingId) => {
    try {
      const response = await axios.post(
        `${API_URL}/bookings/${bookingId}/pay`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setBookingToast('Payment completed.');
        fetchBookings();
        setTimeout(() => setBookingToast(''), 3000);
      }
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleOpenReviewModal = (booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking) return;

    setSubmittingReview(true);
    try {
      const response = await axios.post(
        `${API_URL}/bookings/${reviewBooking.id}/review`,
        {
          rating: reviewRating,
          comment: reviewComment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setReviewBooking(null);
        setBookingToast('Review published.');
        fetchBookings();
        setTimeout(() => setBookingToast(''), 3000);
      }
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSendMessage = async (bookingId) => {
    const text = messageInputs[bookingId];
    if (!text || !text.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/bookings/${bookingId}/messages`,
        { text: text.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessageInputs({ ...messageInputs, [bookingId]: '' });
        fetchBookings();
      }
    } catch (error) {
      alert('Failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const categoriesList = [
    { value: 'All', label: 'All Categories' },
    { value: 'Electronics & Phones', label: 'Electronics & Phones' },
    { value: 'Appliances', label: 'Appliances' },
    { value: 'Bicycles', label: 'Bicycles' },
    { value: 'Furniture', label: 'Furniture' }
  ];

  const getStageIndex = (status) => {
    const idx = EWASTE_STAGES.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const activeRepairsCount = bookings.filter(b => b.status === 'in-progress' || b.status === 'accepted').length;
  const pendingRequestsCount = bookings.filter(b => b.status === 'pending').length;
  const ewasteCount = recycleRequests.length;

  const sortedTechsList = sortAndMatchTechnicians(technicians, selectedCategory, sortBy);

  return (
    <div className="customer-portal-container">
      {/* Toast Notification */}
      {bookingToast && (
        <div className="status-toast-notification">
          <span>{bookingToast}</span>
          <button type="button" onClick={() => setBookingToast('')}>✕</button>
        </div>
      )}

      {/* TOP GREETING BANNER & LOCATION SECTION */}
      <div className="portal-top-banner">
        <div className="greeting-header">
          <span className="greeting-pill">CUSTOMER SERVICE DASHBOARD</span>
          <h2>Welcome back, {user.name}</h2>
          <p>Manage your repair requests, diagnose device issues, and recycle non-repairable items.</p>
        </div>

        {/* YOUR LOCATION SECTION */}
        <div className="location-section-box style-margin-top">
          <div className="location-section-header">
            <div>
              <span className="lbl-bold">YOUR LOCATION</span>
              <strong className="current-location-text">
                {userLocation ? (
                  userLocation.addressName || userLocation.city || 'Location detected'
                ) : (
                  'Location Not Set'
                )}
              </strong>
            </div>

            {userLocation ? (
              <button
                type="button"
                className="btn-change-location"
                onClick={() => setShowLocationChangeForm(!showLocationChangeForm)}
              >
                {showLocationChangeForm ? 'Close' : '[ Change Location ]'}
              </button>
            ) : (
              <button
                type="button"
                className="btn-manual-loc"
                onClick={() => setShowLocationChangeForm(true)}
              >
                [ Set Location ]
              </button>
            )}
          </div>

          {(!userLocation || showLocationChangeForm) && (
            <div className="location-controls-row">
              <button
                type="button"
                className="btn-location-gps"
                onClick={handleGetBrowserLocation}
                disabled={locating}
              >
                {locating ? 'Detecting your location...' : 'Use Current Location'}
              </button>

              <form onSubmit={handleManualLocationSubmit} className="manual-loc-form">
                <input
                  type="text"
                  placeholder="Enter City / Area (e.g. Jamtha, Nagpur)"
                  value={manualCityInput}
                  onChange={(e) => setManualCityInput(e.target.value)}
                  className="manual-loc-input"
                />
                <button type="submit" className="btn-manual-loc">Save Location</button>
              </form>
            </div>
          )}

          {!userLocation && !showLocationChangeForm && (
            <div className="location-status-msg warning-text">
              Set your location to see technicians near you.
            </div>
          )}

          {locationStatus && (
            <div className="location-status-msg success-text">
              {locationStatus}
            </div>
          )}

          {locationError && (
            <div className="location-status-msg error-text">
              <p style={{ margin: 0 }}>{locationError}</p>
              <div style={{ marginTop: '0.4rem', display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn-table-action" onClick={handleGetBrowserLocation}>[ Try Again ]</button>
                <button type="button" className="btn-table-action" onClick={() => setShowLocationChangeForm(true)}>[ Enter City Manually ]</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MAIN NAVIGATION TABS */}
      <div className="portal-tabs-bar">
        <button
          type="button"
          className={`portal-tab-btn ${currentTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          Overview
        </button>
        <button
          type="button"
          className={`portal-tab-btn ${currentTab === 'diagnose' ? 'active' : ''}`}
          onClick={() => handleTabChange('diagnose')}
        >
          AI Diagnosis
        </button>
        <button
          type="button"
          className={`portal-tab-btn ${currentTab === 'explore' ? 'active' : ''}`}
          onClick={() => handleTabChange('explore')}
        >
          Find Technician
        </button>
        <button
          type="button"
          className={`portal-tab-btn ${currentTab === 'bookings' ? 'active' : ''}`}
          onClick={() => handleTabChange('bookings')}
        >
          My Requests ({bookings.length})
        </button>
        <button
          type="button"
          className={`portal-tab-btn ${currentTab === 'ewaste' ? 'active' : ''}`}
          onClick={() => handleTabChange('ewaste')}
        >
          E-Waste Recovery ({recycleRequests.length})
        </button>
        <button
          type="button"
          className={`portal-tab-btn ${currentTab === 'rewards' ? 'active' : ''}`}
          onClick={() => handleTabChange('rewards')}
        >
          Rewards ({rewardsBalance} pts)
        </button>
      </div>

      {/* TAB CONTENT VIEWS */}
      <div className="portal-tab-content">
        
        {/* 1. OVERVIEW TAB */}
        {currentTab === 'overview' && (
          <div className="tab-pane-overview">
            {/* 4 SUMMARY METRIC CARDS */}
            <div className="summary-cards-grid">
              <div className="summary-card" onClick={() => handleTabChange('bookings')}>
                <div className="summary-card-data">
                  <span className="summary-num">{activeRepairsCount}</span>
                  <span className="summary-label">Active Repair</span>
                </div>
              </div>

              <div className="summary-card" onClick={() => handleTabChange('bookings')}>
                <div className="summary-card-data">
                  <span className="summary-num">{pendingRequestsCount}</span>
                  <span className="summary-label">Pending Requests</span>
                </div>
              </div>

              <div className="summary-card" onClick={() => handleTabChange('rewards')}>
                <div className="summary-card-data">
                  <span className="summary-num">{rewardsBalance.toLocaleString()} pts</span>
                  <span className="summary-label">Eco Points</span>
                </div>
              </div>

              <div className="summary-card" onClick={() => handleTabChange('ewaste')}>
                <div className="summary-card-data">
                  <span className="summary-num">{ewasteCount}</span>
                  <span className="summary-label">E-Waste Recovered</span>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS SECTION */}
            <div className="clean-card-box style-margin-top">
              <div className="box-header">
                <h3>Quick Actions</h3>
                <p>Select a service action to begin.</p>
              </div>

              <div className="quick-actions-grid">
                <button type="button" className="btn-primary-green" onClick={() => handleTabChange('diagnose')}>
                  [ Diagnose a Problem ]
                </button>
                <button type="button" className="btn-secondary-outline" onClick={() => handleTabChange('explore')}>
                  [ Find a Technician ]
                </button>
                <button type="button" className="btn-orange-outline" onClick={() => handleOpenRecycleModal('', '₹500')}>
                  [ Recycle E-Waste ]
                </button>
              </div>
            </div>

            {/* ENVIRONMENTAL IMPACT SUMMARY */}
            <div className="clean-card-box style-margin-top">
              <div className="box-header">
                <h3>Environmental Impact Principles</h3>
                <p className="impact-tagline">"Repair what can be repaired, recover what cannot."</p>
              </div>
              <p className="impact-body-text">
                By prioritizing repair over replacement, you reduce local electronic landfill waste and lower carbon emissions. If a device is beyond economic repair, circular material recovery ensures copper, aluminium, and circuit components return safely into production.
              </p>
            </div>
          </div>
        )}

        {/* 2. AI DIAGNOSIS TAB */}
        {currentTab === 'diagnose' && (
          <div className="tab-pane-diagnose">
            <div className="clean-card-box">
              <div className="box-header">
                <h3>AI Diagnosis</h3>
                <p>Describe the problem with your device.</p>
              </div>

              <form onSubmit={handleDiagnose} className="clean-diag-form">
                <div className="form-row-grid">
                  <div className="form-group-item">
                    <label>Category</label>
                    <select
                      value={diagCategory}
                      onChange={(e) => setDiagCategory(e.target.value)}
                      className="clean-select"
                    >
                      <option value="Electronics & Phones">Electronics & Phones</option>
                      <option value="Appliances">Appliances</option>
                      <option value="Bicycles">Bicycles</option>
                      <option value="Furniture">Furniture</option>
                    </select>
                  </div>

                  <div className="form-group-item">
                    <label>Device Model / Item</label>
                    <input
                      type="text"
                      placeholder="e.g. iPhone 13 Pro, Dell XPS Laptop"
                      value={diagItemType}
                      onChange={(e) => setDiagItemType(e.target.value)}
                      className="clean-input"
                      required
                    />
                  </div>

                  <div className="form-group-item span-full">
                    <label>Problem Description</label>
                    <textarea
                      rows="3"
                      placeholder="Describe symptoms clearly: cracked screen, battery drains quickly, no power..."
                      value={diagIssue}
                      onChange={(e) => setDiagIssue(e.target.value)}
                      className="clean-textarea"
                      required
                    />
                  </div>

                  <div className="form-group-item">
                    <label>Optional Photo Upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="clean-file-input"
                    />
                  </div>

                  <div className="form-group-item align-end">
                    <button
                      type="submit"
                      className="btn-primary-green btn-full"
                      disabled={diagAnalyzing || !diagItemType || !diagIssue}
                    >
                      {diagAnalyzing ? 'Analyzing Problem...' : 'Analyze Problem'}
                    </button>
                  </div>
                </div>

                {diagImage && (
                  <div className="photo-preview-line">
                    <span>Photo attached for inspection</span>
                    <button type="button" onClick={() => setDiagImage(null)}>Remove</button>
                  </div>
                )}
              </form>

              {/* Clean Result Output */}
              {diagResult && (
                <div className="clean-diag-result-card">
                  <div className="result-card-top">
                    <div>
                      <span className={`recommendation-badge ${diagResult.repairability === 'RECYCLE' ? 'badge-recycle' : 'badge-repair'}`}>
                        {diagResult.repairability === 'RECYCLE' ? 'Recommended: E-Waste Recovery' : 'Recommended: Find a Technician'}
                      </span>
                      <h4>Diagnostic Summary</h4>
                    </div>
                    <button type="button" className="close-result-btn" onClick={() => setDiagResult(null)}>✕</button>
                  </div>

                  <div className="result-attributes-list">
                    <div className="attr-item">
                      <span className="attr-label">Possible Fault</span>
                      <strong className="attr-val">{diagResult.possibleFault || diagResult.diagnosticSummary}</strong>
                    </div>

                    <div className="attr-item">
                      <span className="attr-label">Affected Component</span>
                      <strong className="attr-val">{diagResult.affectedComponent || 'Internal Component'}</strong>
                    </div>

                    <div className="attr-item">
                      <span className="attr-label">Repairability</span>
                      <strong className="attr-val">{diagResult.repairability}</strong>
                    </div>

                    <div className="attr-item">
                      <span className="attr-label">Estimated Repair Cost</span>
                      <strong className="attr-val green-text">
                        {diagResult.estimatedRepairCostMin && diagResult.estimatedRepairCostMax
                          ? `₹${diagResult.estimatedRepairCostMin} – ₹${diagResult.estimatedRepairCostMax}`
                          : diagResult.repairOption?.costEstimate || '₹500 – ₹1,500'}
                      </strong>
                    </div>

                    <div className="attr-item">
                      <span className="attr-label">Estimated Time</span>
                      <strong className="attr-val">
                        {diagResult.estimatedRepairTime || diagResult.repairOption?.turnaround || '1–2 hours'}
                      </strong>
                    </div>

                    <div className="attr-item span-full">
                      <span className="attr-label">Recommended Action</span>
                      <p className="attr-desc">{diagResult.recommendedAction || 'Schedule inspection with a verified local technician.'}</p>
                    </div>
                  </div>

                  {/* RECOMMENDED TECHNICIANS NEAR YOU (COMBINED CATEGORY + LOCATION MATCHING) */}
                  {diagResult.repairability !== 'RECYCLE' && (
                    <div className="nearest-tech-section">
                      <h4 className="nearest-tech-title">Recommended Technicians Near You</h4>
                      <div className="nearest-tech-grid">
                        {sortAndMatchTechnicians(technicians, diagCategory || diagResult.category, 'nearest').slice(0, 2).map((tech) => {
                          const mapsLink = getGoogleMapsLink(tech);
                          return (
                            <div key={tech.id} className="nearest-tech-card">
                              <div className="tech-header-line">
                                <div>
                                  <strong>{tech.name}</strong>
                                  <span className="tech-sub">{tech.specialty}</span>
                                </div>
                                <span className="tech-rating-chip">★ {tech.rating || 4.8}</span>
                              </div>
                              
                              <div className="tech-meta-line">
                                <span className="tech-dist">
                                  {getDistanceDisplay(tech) ? `${getDistanceDisplay(tech)}` : ''}
                                  {tech.available !== false ? ' • Available' : ' • Offline'}
                                </span>
                                <span className="tech-price">{tech.rate || '₹499/hr'}</span>
                              </div>

                              {(tech.shopName || tech.shopAddress) && (
                                <div className="tech-shop-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.85rem', margin: '0.4rem 0', fontSize: '0.825rem' }}>
                                  {tech.shopName && <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.15rem' }}>{tech.shopName}</div>}
                                  {tech.shopAddress && <div style={{ color: '#475569', fontSize: '0.8rem' }}>{tech.shopAddress}</div>}
                                  {(tech.shopCity || tech.shopPincode) && (
                                    <div style={{ color: '#64748b', fontSize: '0.775rem' }}>
                                      {[tech.shopCity, tech.shopPincode].filter(Boolean).join(' - ')}
                                    </div>
                                  )}
                                  {tech.shopPhone && <div style={{ color: '#166534', fontSize: '0.775rem', marginTop: '0.2rem' }}>Phone: {tech.shopPhone}</div>}
                                </div>
                              )}

                              <div className="tech-btn-row">
                                {mapsLink && (
                                  <a
                                    href={mapsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-outline-small"
                                    style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                  >
                                    View Shop on Map
                                  </a>
                                )}
                                <button
                                  type="button"
                                  className="btn-green-small"
                                  onClick={() => handleOpenBookingModal(tech, diagItemType, diagIssue)}
                                >
                                  Request Repair
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {diagResult.repairability === 'RECYCLE' && (
                    <div className="result-actions-row">
                      <button
                        type="button"
                        className="btn-orange-solid"
                        onClick={() => handleOpenRecycleModal(diagItemType, diagResult.recycleOption?.estimatedCashbackPayout)}
                      >
                        Schedule E-Waste Pickup →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. FIND TECHNICIAN TAB */}
        {currentTab === 'explore' && (
          <div className="tab-pane-explore">
            <div className="clean-card-box">
              <div className="box-header">
                <h3>Technicians Near You</h3>
                <p>Search verified local repair specialists by specialty, availability, rating, and distance.</p>
              </div>

              {/* Filter Row */}
              <div className="technician-filter-bar">
                <input
                  type="text"
                  placeholder="Search by name, skill, or city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-search-input"
                />

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="filter-select"
                >
                  {categoriesList.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>

                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Availability</option>
                  <option value="available">Available Now</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="nearest">Nearest</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              {/* Technicians Grid (Clean, Typography-Focused) */}
              {loadingTechs ? (
                <div className="loading-state">Loading technicians...</div>
              ) : sortedTechsList.length === 0 ? (
                <div className="empty-state">No technicians match your search filters.</div>
              ) : (
                <div className="clean-tech-grid">
                  {sortedTechsList.map((tech) => {
                    const mapsLink = getGoogleMapsLink(tech);
                    return (
                      <div key={tech.id} className="clean-tech-card">
                        <div className="tech-heading-info">
                          <div className="name-badge-line">
                            <h4>{tech.name}</h4>
                            <span className="verified-chip">Verified</span>
                            <span className={`avail-chip ${tech.available !== false ? 'avail-online' : 'avail-offline'}`}>
                              {tech.available !== false ? 'Available' : 'Offline'}
                            </span>
                          </div>
                          <span className="specialty-text">{tech.specialty} • {tech.city}</span>
                        </div>

                        <div className="tech-details-line">
                          <span>Rating: <strong>{tech.rating || 5.0} ★</strong> ({tech.reviews || 0} reviews)</span>
                          <span className="rate-text">Starting Rate: {tech.rate || '₹499/hr'}</span>
                        </div>

                        {getDistanceDisplay(tech) && (
                          <div className="tech-details-line">
                            <span className="tech-dist">{getDistanceDisplay(tech)}</span>
                          </div>
                        )}

                        {(tech.shopName || tech.shopAddress) && (
                          <div className="tech-shop-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.65rem 0.85rem', margin: '0.4rem 0', fontSize: '0.825rem' }}>
                            {tech.shopName && <div style={{ fontWeight: '700', color: '#0f172a', marginBottom: '0.15rem' }}>{tech.shopName}</div>}
                            {tech.shopAddress && <div style={{ color: '#475569', fontSize: '0.8rem' }}>{tech.shopAddress}</div>}
                            {(tech.shopCity || tech.shopPincode) && (
                              <div style={{ color: '#64748b', fontSize: '0.775rem' }}>
                                {[tech.shopCity, tech.shopPincode].filter(Boolean).join(' - ')}
                              </div>
                            )}
                            {tech.shopPhone && <div style={{ color: '#166534', fontSize: '0.775rem', marginTop: '0.2rem' }}>Phone: {tech.shopPhone}</div>}
                          </div>
                        )}

                        {tech.skills && tech.skills.length > 0 && (
                          <div className="tech-chips-row">
                            {tech.skills.map((sk, i) => (
                              <span key={i} className="chip-item">{sk}</span>
                            ))}
                          </div>
                        )}

                        <div className="tech-card-actions-row">
                          {mapsLink && (
                            <a
                              href={mapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-outline-small"
                              style={{ textAlign: 'center', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              View Shop on Map
                            </a>
                          )}
                          <button
                            type="button"
                            className="btn-green-small"
                            onClick={() => handleOpenBookingModal(tech)}
                          >
                            Request Repair
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. MY REQUESTS TAB (STRUCTURED TABLE/LIST) */}
        {currentTab === 'bookings' && (
          <div className="tab-pane-requests">
            <div className="clean-card-box">
              <div className="box-header">
                <h3>My Repair Requests</h3>
                <p>Service management table of your repair bookings.</p>
              </div>

              {loadingBookings ? (
                <div className="loading-state">Loading repair requests...</div>
              ) : bookings.length === 0 ? (
                <div className="empty-state">No repair requests found.</div>
              ) : (
                <div className="table-responsive-container">
                  <table className="requests-data-table">
                    <thead>
                      <tr>
                        <th>Device</th>
                        <th>Issue Description</th>
                        <th>Technician</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Estimated Cost</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id}>
                          <td><strong>{booking.itemType}</strong><br/><small style={{ color: '#64748b' }}>{booking.category}</small></td>
                          <td style={{ maxWidth: '220px' }}>{booking.issue}</td>
                          <td>{booking.technicianName}</td>
                          <td>{booking.pickupDate}</td>
                          <td>
                            <span className={`status-tag-table status-${booking.status}`}>
                              {booking.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="green-text"><strong>{booking.estimatedCost || '₹499'}</strong></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-table-action"
                                onClick={() => setSelectedBookingForDetails(selectedBookingForDetails?.id === booking.id ? null : booking)}
                              >
                                {selectedBookingForDetails?.id === booking.id ? 'Hide' : 'Details'}
                              </button>

                              {booking.status === 'pending' && (
                                <button type="button" className="btn-table-cancel" onClick={() => handleCancelBooking(booking.id)}>
                                  Cancel
                                </button>
                              )}

                              {booking.status === 'completed' && !booking.paid && (
                                <button type="button" className="btn-table-pay" onClick={() => handlePayBooking(booking.id)}>
                                  Pay
                                </button>
                              )}

                              {booking.status === 'completed' && !booking.review && (
                                <button type="button" className="btn-table-action" onClick={() => handleOpenReviewModal(booking)}>
                                  Review
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* EXPANDED DETAILS CARD */}
                  {selectedBookingForDetails && (
                    <div className="expanded-details-box style-margin-top">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4>Booking #{selectedBookingForDetails.id} Details & Chat</h4>
                        <button type="button" onClick={() => setSelectedBookingForDetails(null)} className="close-btn">✕</button>
                      </div>

                      <div className="booking-info-row style-margin-top">
                        <div><span className="lbl">Address</span><strong>{selectedBookingForDetails.address}</strong></div>
                        <div><span className="lbl">Phone</span><strong>{selectedBookingForDetails.customerPhone || 'N/A'}</strong></div>
                        <div><span className="lbl">Urgency</span><strong>{selectedBookingForDetails.urgency || 'Standard'}</strong></div>
                      </div>

                      {selectedBookingForDetails.messages && selectedBookingForDetails.messages.length > 0 && (
                        <div className="chat-thread-box style-margin-top">
                          <span className="chat-head">Technician Messages</span>
                          {selectedBookingForDetails.messages.map((m, idx) => (
                            <div key={idx} className={`chat-bubble ${m.sender === 'customer' ? 'mine' : 'theirs'}`}>
                              <span className="author">{m.sender === 'customer' ? 'You' : selectedBookingForDetails.technicianName}:</span>
                              <p>{m.text}</p>
                              <span className="time">{m.time}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="chat-input-row style-margin-top">
                        <input
                          type="text"
                          placeholder="Type a message to technician..."
                          value={messageInputs[selectedBookingForDetails.id] || ''}
                          onChange={(e) => setMessageInputs({ ...messageInputs, [selectedBookingForDetails.id]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(selectedBookingForDetails.id); }}
                        />
                        <button type="button" onClick={() => handleSendMessage(selectedBookingForDetails.id)}>Send</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. E-WASTE RECOVERY TAB (STRUCTURED TABLE/LIST CONSISTENT WITH MY REQUESTS) */}
        {currentTab === 'ewaste' && (
          <div className="tab-pane-ewaste">
            <div className="clean-card-box">
              <div className="box-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3>E-Waste Recovery</h3>
                  <p>Give your non-repairable devices a responsible second life.</p>
                </div>
                <button
                  type="button"
                  className="btn-primary-green"
                  onClick={() => handleOpenRecycleModal('', '₹500')}
                >
                  Schedule Pickup Request
                </button>
              </div>

              {/* Informational Box */}
              <div className="ewaste-why-matters-box">
                <h4>Why Responsible E-Waste Disposal Matters</h4>
                <p>
                  Electronic waste contains valuable materials such as copper, aluminium and other recoverable components. When devices are dumped improperly, these materials are lost and harmful substances can enter the environment.
                </p>
                <ul className="ewaste-points-list">
                  <li>• Reduces landfill waste</li>
                  <li>• Recovers valuable materials</li>
                  <li>• Encourages responsible consumption</li>
                </ul>
                <div className="ewaste-motto-line">
                  <strong>Repair what can be repaired, recover what cannot.</strong>
                </div>
              </div>

              {recycleRequests.length === 0 ? (
                <div className="empty-state style-margin-top">No e-waste recovery requests scheduled yet.</div>
              ) : (
                <div className="table-responsive-container style-margin-top">
                  <table className="requests-data-table">
                    <thead>
                      <tr>
                        <th>Device / Item</th>
                        <th>Pickup Date</th>
                        <th>Pickup Address</th>
                        <th>Recovery Stage</th>
                        <th>Estimated Value</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recycleRequests.map((req) => (
                        <tr key={req.id}>
                          <td><strong>{req.itemType}</strong><br/><small style={{ color: '#64748b' }}>E-Waste Recovery</small></td>
                          <td>{req.pickupDate}</td>
                          <td style={{ maxWidth: '220px' }}>{req.pickupAddress}</td>
                          <td>
                            <span className={`status-tag-table status-${req.status === 'completed' ? 'completed' : req.status === 'requested' ? 'pending' : 'in-progress'}`}>
                              {req.status.toUpperCase().replace('_', ' ')}
                            </span>
                          </td>
                          <td className="green-text">
                            <strong>{req.payoutType === 'points' ? `${req.rewardPoints || 850} Eco Points` : req.estimatedPayout}</strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="btn-table-action"
                                onClick={() => setSelectedEwasteForDetails(selectedEwasteForDetails?.id === req.id ? null : req)}
                              >
                                {selectedEwasteForDetails?.id === req.id ? 'Hide' : 'Details'}
                              </button>
                              {getStageIndex(req.status) < EWASTE_STAGES.length - 1 && (
                                <button
                                  type="button"
                                  className="btn-table-pay"
                                  onClick={() => handleSimulateNextStage(req.id, req.status)}
                                >
                                  Advance Stage
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* EXPANDED DETAILS CARD (CONSISTENT WITH MY REQUESTS) */}
                  {selectedEwasteForDetails && (
                    <div className="expanded-details-box style-margin-top">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4>E-Waste Request #{selectedEwasteForDetails.id} - {selectedEwasteForDetails.itemType}</h4>
                        <button type="button" onClick={() => setSelectedEwasteForDetails(null)} className="close-btn">✕</button>
                      </div>

                      {/* 7-STAGE PROGRESS TRACKER */}
                      <div className="stage-timeline-wrapper style-margin-top">
                        <div className="stage-steps-row">
                          {EWASTE_STAGES.map((st, idx) => {
                            const curIdx = getStageIndex(selectedEwasteForDetails.status);
                            return (
                              <div
                                key={st.key}
                                className={`timeline-dot-step ${idx <= curIdx ? 'reached' : ''} ${idx === curIdx ? 'current' : ''}`}
                              >
                                <span className="dot"></span>
                                <span className="label">{st.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="booking-info-row style-margin-top">
                        <div><span className="lbl">Pickup Address</span><strong>{selectedEwasteForDetails.pickupAddress}</strong></div>
                        <div><span className="lbl">Pickup Date</span><strong>{selectedEwasteForDetails.pickupDate}</strong></div>
                        <div><span className="lbl">Recovery Status</span><strong>{selectedEwasteForDetails.status.toUpperCase().replace('_', ' ')}</strong></div>
                        <div>
                          <span className="lbl">Estimated Reward</span>
                          <strong className="green-text">
                            {selectedEwasteForDetails.payoutType === 'points' ? `${selectedEwasteForDetails.rewardPoints || 850} Eco Points` : selectedEwasteForDetails.estimatedPayout}
                          </strong>
                        </div>
                      </div>

                      {/* Recovered Materials Chips */}
                      {selectedEwasteForDetails.recoveredMaterialsList && selectedEwasteForDetails.recoveredMaterialsList.length > 0 && (
                        <div className="recovered-materials-box style-margin-top">
                          <span className="title" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: '600', fontSize: '0.85rem' }}>Recovered Materials:</span>
                          <div className="tech-chips-row">
                            {selectedEwasteForDetails.recoveredMaterialsList.map((m, i) => (
                              <span key={i} className="chip-item">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Buyer Matched Info */}
                      {selectedEwasteForDetails.buyerName && (
                        <div className="booking-info-row style-margin-top">
                          <div><span className="lbl">Matched Recycling Buyer</span><strong>{selectedEwasteForDetails.buyerName}</strong></div>
                        </div>
                      )}

                      <div className="demo-advance-line style-margin-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <span className="note" style={{ fontSize: '0.8rem', color: '#64748b' }}>Stage updates upon pickup & physical verification.</span>
                        {getStageIndex(selectedEwasteForDetails.status) < EWASTE_STAGES.length - 1 && (
                          <button
                            type="button"
                            className="btn-table-pay"
                            onClick={() => {
                              handleSimulateNextStage(selectedEwasteForDetails.id, selectedEwasteForDetails.status);
                              const cur = getStageIndex(selectedEwasteForDetails.status);
                              if (cur < EWASTE_STAGES.length - 1) {
                                setSelectedEwasteForDetails({
                                  ...selectedEwasteForDetails,
                                  status: EWASTE_STAGES[cur + 1].key
                                });
                              }
                            }}
                          >
                            Advance to {EWASTE_STAGES[getStageIndex(selectedEwasteForDetails.status) + 1].label} →
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. ECO REWARDS TAB (STRUCTURED TABLE/LIST CONSISTENT WITH MY REQUESTS) */}
        {currentTab === 'rewards' && (
          <div className="tab-pane-rewards">
            <div className="clean-card-box">
              <div className="box-header">
                <h3>Eco Rewards</h3>
                <p>Eco points balance and environmental credit ledger.</p>
              </div>

              {/* Balance Summary Cards consistent with Dashboard summary cards */}
              <div className="summary-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', marginBottom: '1.5rem' }}>
                <div className="summary-card" style={{ cursor: 'default' }}>
                  <div className="summary-card-data">
                    <span className="summary-num green-text">{rewardsBalance.toLocaleString()} pts</span>
                    <span className="summary-label">Available Eco Points Balance</span>
                  </div>
                </div>
                <div className="summary-card" style={{ cursor: 'default' }}>
                  <div className="summary-card-data">
                    <span className="summary-num">{rewards.length}</span>
                    <span className="summary-label">Total Ledger Transactions</span>
                  </div>
                </div>
              </div>

              <div className="box-header" style={{ marginBottom: '1rem' }}>
                <h4>Recent Ledger Activity</h4>
                <p>Record of points earned and redeemed through circular recycling.</p>
              </div>

              {rewards.length === 0 ? (
                <div className="empty-state">No transaction ledger history yet.</div>
              ) : (
                <div className="table-responsive-container">
                  <table className="requests-data-table">
                    <thead>
                      <tr>
                        <th>Transaction Description</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rewards.map((r) => (
                        <tr key={r.id}>
                          <td><strong>{r.description}</strong></td>
                          <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-tag-table status-${r.type === 'earned' ? 'completed' : 'cancelled'}`}>
                              {r.type.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <strong className={r.type === 'earned' ? 'green-text' : ''}>
                              {r.type === 'earned' ? '+' : '-'}{r.points} pts
                            </strong>
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

      </div>

      {/* MODALS */}
      {/* Booking Modal */}
      {selectedTechForBooking && (
        <div className="modal-backdrop" onClick={handleCloseBookingModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Book Service with {selectedTechForBooking.name}</h3>
              <button type="button" className="close-btn" onClick={handleCloseBookingModal}>✕</button>
            </div>

            <form onSubmit={handleCreateBooking} className="modal-form">
              <div className="form-item">
                <label>Item / Model</label>
                <input
                  type="text"
                  placeholder="e.g. iPhone 14 Pro, Samsung Fridge"
                  value={bookingItem}
                  onChange={(e) => setBookingItem(e.target.value)}
                  required
                />
              </div>

              <div className="form-item">
                <label>Problem Description</label>
                <textarea
                  rows="2"
                  placeholder="Brief description of the issue..."
                  value={bookingIssue}
                  onChange={(e) => setBookingIssue(e.target.value)}
                  required
                />
              </div>

              <div className="form-item-grid">
                <div className="form-item">
                  <label>Service Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-item">
                  <label>Urgency</label>
                  <select
                    value={bookingUrgency}
                    onChange={(e) => setBookingUrgency(e.target.value)}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="form-item-grid">
                <div className="form-item">
                  <label>Address</label>
                  <input
                    type="text"
                    placeholder="Enter your street address or city..."
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    required
                  />
                </div>

                <div className="form-item">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98200 00000"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-cancel" onClick={handleCloseBookingModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={bookingSubmitting}>
                  {bookingSubmitting ? 'Submitting...' : 'Send Repair Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recycle Modal */}
      {isRecycleModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsRecycleModalOpen(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Schedule E-Waste Pickup</h3>
              <button type="button" className="close-btn" onClick={() => setIsRecycleModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateRecycleRequest} className="modal-form">
              <div className="form-item">
                <label>Item / Device for Recovery</label>
                <input
                  type="text"
                  value={recycleItem}
                  onChange={(e) => setRecycleItem(e.target.value)}
                  required
                />
              </div>

              <div className="form-item">
                <label>Reward Preference</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setRecyclePayoutType('points')}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: recyclePayoutType === 'points' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                      background: recyclePayoutType === 'points' ? '#dcfce7' : '#ffffff',
                      color: recyclePayoutType === 'points' ? '#166534' : '#475569',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Eco Points (+10% Bonus)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecyclePayoutType('cash')}
                    style={{
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: recyclePayoutType === 'cash' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                      background: recyclePayoutType === 'cash' ? '#f1f5f9' : '#ffffff',
                      color: recyclePayoutType === 'cash' ? '#0f172a' : '#475569',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Direct Cash
                  </button>
                </div>
              </div>

              <div className="form-item">
                <label>Estimated Value</label>
                <input
                  type="text"
                  value={recyclePayout}
                  onChange={(e) => setRecyclePayout(e.target.value)}
                  required
                />
              </div>

              <div className="form-item">
                <label>Pickup Date</label>
                <input
                  type="date"
                  value={recycleDate}
                  onChange={(e) => setRecycleDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-item">
                <label>Pickup Address</label>
                <input
                  type="text"
                  placeholder="Enter pickup address..."
                  value={recycleAddress}
                  onChange={(e) => setRecycleAddress(e.target.value)}
                  required
                />
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setIsRecycleModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submittingRecycle}>
                  {submittingRecycle ? 'Scheduling...' : 'Confirm Pickup Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {mapModalData && (
        <div className="modal-backdrop" onClick={() => setMapModalData(null)}>
          <div className="modal-container map-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <h3>{mapModalData.name}</h3>
                <span className="info-val">{mapModalData.address}</span>
              </div>
              <button type="button" className="close-btn" onClick={() => setMapModalData(null)}>✕</button>
            </div>

            <div className="map-embed-wrapper">
              <iframe
                title="Location Map"
                width="100%"
                height="300"
                frameBorder="0"
                src={mapModalData.mapEmbedUrl}
              ></iframe>
            </div>

            <div className="modal-foot">
              <a href={mapModalData.mapSearchUrl} target="_blank" rel="noopener noreferrer" className="btn-submit">
                Open Google Maps
              </a>
              <button type="button" className="btn-cancel" onClick={() => setMapModalData(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="modal-backdrop" onClick={() => setReviewBooking(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Review {reviewBooking.technicianName}</h3>
              <button type="button" className="close-btn" onClick={() => setReviewBooking(null)}>✕</button>
            </div>

            <form onSubmit={handleSubmitReview} className="modal-form">
              <div className="form-item">
                <label>Rating</label>
                <select
                  value={reviewRating}
                  onChange={(e) => setReviewRating(parseInt(e.target.value))}
                >
                  <option value={5}>5 Stars (Excellent)</option>
                  <option value={4}>4 Stars (Very Good)</option>
                  <option value={3}>3 Stars (Good)</option>
                  <option value={2}>2 Stars (Fair)</option>
                  <option value={1}>1 Star (Poor)</option>
                </select>
              </div>

              <div className="form-item">
                <label>Feedback</label>
                <textarea
                  rows="2"
                  placeholder="Feedback on repair service..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <div className="modal-foot">
                <button type="button" className="btn-cancel" onClick={() => setReviewBooking(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={submittingReview}>
                  {submittingReview ? 'Publishing...' : 'Publish Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
