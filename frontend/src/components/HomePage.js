import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './HomePage.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function HomePage({ user, onNavigateToAuth, onNavigateToDashboard, onQuickSearch }) {
  const [stats, setStats] = useState({
    completedRepairs: 1420,
    activeTechnicians: 6,
    activeBuyers: 6,
    availableMaterials: 14
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API_URL}/stats`);
      if (res.data && res.data.success && res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (e) {
      // ignore, fallback to default state
    }
  };

  const handleFindTechnician = () => {
    if (user) {
      onNavigateToDashboard && onNavigateToDashboard('explore');
    } else {
      onNavigateToAuth && onNavigateToAuth('customer', true, { tab: 'explore' });
    }
  };

  const handleCheckDevice = () => {
    if (user) {
      onNavigateToDashboard && onNavigateToDashboard('diagnose');
    } else {
      onNavigateToAuth && onNavigateToAuth('customer', true, { tab: 'diagnose' });
    }
  };

  return (
    <div className="homepage-clean">
      {/* HERO SECTION */}
      <section className="hero-clean" id="home">
        <div className="hero-clean-inner">
          <div className="hero-clean-content">
            <div className="trust-pill-badge">
              <span className="trust-badge-dot">●</span>
              <span className="trust-badge-text">Repair OR Waste</span>
            </div>

            <h1 className="hero-clean-headline">
              ROW <br />
              <span className="headline-highlight">Repair OR Waste</span>
            </h1>

            <p className="hero-clean-subheading">
              Repair what can be repaired, recover what cannot.
            </p>

            <div className="hero-clean-actions">
              <button
                type="button"
                className="btn-primary-green"
                onClick={handleFindTechnician}
              >
                Find a Technician
              </button>
              <button
                type="button"
                className="btn-secondary-outline"
                onClick={handleCheckDevice}
              >
                Check My Device
              </button>
            </div>
          </div>

          <div className="hero-clean-visual">
            <div className="visual-card">
              <div className="visual-badge">Circular Economy Loop</div>
              <div className="visual-flow">
                <div className="flow-step green">
                  <div className="flow-step-num">1</div>
                  <div className="flow-step-info">
                    <strong>Local Repair</strong>
                    <span>Fix components locally</span>
                  </div>
                </div>
                <div className="flow-arrow">↓</div>
                <div className="flow-step orange">
                  <div className="flow-step-num">2</div>
                  <div className="flow-step-info">
                    <strong>E-Waste Recovery</strong>
                    <span>Extract valuable metals</span>
                  </div>
                </div>
                <div className="flow-arrow">↓</div>
                <div className="flow-step navy">
                  <div className="flow-step-num">3</div>
                  <div className="flow-step-info">
                    <strong>Buyer Marketplace</strong>
                    <span>Supply industrial recyclers</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION (4 CLEAN CARDS ONLY) */}
      <section className="services-clean-section" id="services">
        <div className="section-inner">
          <div className="section-header">
            <span className="sub-tag">OUR SERVICES</span>
            <h2>Core Platform Services</h2>
            <p>Practical solutions for every stage of your product's lifecycle.</p>
          </div>

          <div className="services-clean-grid">
            {/* Card 1 */}
            <div className="service-clean-card" onClick={handleFindTechnician}>
              <div className="service-card-tag green-tag">Repair</div>
              <h3>Repair a Device</h3>
              <p>Find a verified local technician for doorstep diagnostic and repair.</p>
              <span className="card-link-text">Browse Technicians →</span>
            </div>

            {/* Card 2 */}
            <div className="service-clean-card" onClick={handleCheckDevice}>
              <div className="service-card-tag blue-tag">AI Diagnosis</div>
              <h3>AI Diagnosis</h3>
              <p>Describe your problem or upload a photo to inspect likely faults & repairability.</p>
              <span className="card-link-text">Diagnose Now →</span>
            </div>

            {/* Card 3 */}
            <div className="service-clean-card" onClick={() => user ? (onNavigateToDashboard && onNavigateToDashboard('ewaste')) : onNavigateToAuth('customer', true)}>
              <div className="service-card-tag orange-tag">E-Waste</div>
              <h3>E-Waste Recovery</h3>
              <p>Get instant cash or eco reward points for devices that cannot be repaired.</p>
              <span className="card-link-text">Schedule Pickup →</span>
            </div>

            {/* Card 4 */}
            <div className="service-clean-card" onClick={() => user ? (onNavigateToDashboard && onNavigateToDashboard('marketplace')) : onNavigateToAuth('buyer', true)}>
              <div className="service-card-tag navy-tag">Recycle</div>
              <h3>Raw Material Recovery</h3>
              <p>Recovered copper, aluminium, and circuit boards connected with responsible buyers.</p>
              <span className="card-link-text">View Marketplace →</span>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (4 SIMPLE STEPS) */}
      <section className="how-clean-section" id="how-it-works">
        <div className="section-inner">
          <div className="section-header">
            <span className="sub-tag">SIMPLE PROCESS</span>
            <h2>How It Works</h2>
            <p>Four easy steps to extend device lifespan and divert e-waste from landfills.</p>
          </div>

          <div className="how-clean-grid">
            <div className="how-clean-step">
              <div className="step-num-circle">1</div>
              <h4>Tell Us the Problem</h4>
              <p>Select your item category, describe the issue, or upload a quick diagnostic photo.</p>
            </div>

            <div className="how-clean-step">
              <div className="step-num-circle">2</div>
              <h4>Get Diagnosis & Tech</h4>
              <p>View diagnostic feedback, price benchmarks, and connect with certified local experts.</p>
            </div>

            <div className="how-clean-step">
              <div className="step-num-circle">3</div>
              <h4>Repair or Recover</h4>
              <p>Get doorstep device repair or schedule e-waste pickup if non-repairable.</p>
            </div>

            <div className="how-clean-step">
              <div className="step-num-circle">4</div>
              <h4>Reuse Materials</h4>
              <p>Recovered metals and parts are sold directly to verified industrial recycling buyers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT SECTION */}
      <section className="impact-clean-section" id="impact">
        <div className="section-inner">
          <div className="section-header">
            <span className="sub-tag">SUSTAINABILITY IMPACT</span>
            <h2>Our Environmental Footprint</h2>
            <p>Quantifiable metrics from our local Nagpur & regional repair network.</p>
          </div>

          <div className="impact-clean-grid">
            <div className="impact-card">
              <div className="impact-num">{stats.completedRepairs || 1420}+</div>
              <div className="impact-label">Devices Repaired</div>
              <p className="impact-desc">Kept functional in local hands</p>
            </div>

            <div className="impact-card">
              <div className="impact-num">{(stats.availableMaterials || 14) * 0.8} Tons</div>
              <div className="impact-label">E-Waste Recovered</div>
              <p className="impact-desc">Diverted from toxic landfills</p>
            </div>

            <div className="impact-card">
              <div className="impact-num">{stats.activeTechnicians || 6}</div>
              <div className="impact-label">Local Technicians</div>
              <p className="impact-desc">Verified skilled experts on platform</p>
            </div>

            <div className="impact-card">
              <div className="impact-num">{(stats.availableMaterials || 14)} Lots</div>
              <div className="impact-label">Materials Recovered</div>
              <p className="impact-desc">Copper, aluminium & electronics</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer-clean">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>ROW</h3>
            <p>Repair OR Waste • VNIT Nagpur Local Repair Economy & E-Waste Circular Marketplace Initiative.</p>
          </div>
          <div className="footer-links">
            <a href="#home">Home</a>
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#impact">Impact</a>
          </div>
          <div className="footer-copy">
            © 2026 ROW (Repair OR Waste). Built for sustainable circular economy.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
