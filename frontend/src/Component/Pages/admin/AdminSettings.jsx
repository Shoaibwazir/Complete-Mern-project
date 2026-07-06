import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import AdminSidebar from './AdminSidebar';
import { 
  FaSave, 
  FaStore, 
  FaShippingFast, 
  FaEnvelope, 
  FaBell, 
  FaLock, 
  FaPalette,
  FaDollarSign,
  FaPhone,
  FaMapMarkerAlt,
  FaGlobe,
  FaCog
} from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import './AdminSettings.css';

const AdminSettings = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [settings, setSettings] = useState({
    storeName: 'QASR-E-LIBAS LTD',
    storeEmail: 'qasrelibasltd@gmail.com',
    storePhone: '+44 7460816860',
    storeAddress: 'Unit 107 Jubilee trade Centre 130 Pershore St, Birmingham B5 6ND, UK',
    currency: 'GBP',
    taxRate: 10,
    freeShippingThreshold: 50,
    notificationEmail: 'info@qasrelibas.co.uk',
    emailNotifications: true,
    orderNotifications: true
  });
  const [saving, setSaving] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 991);
      if (window.innerWidth > 991 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && isMobile) {
        const sidebar = document.querySelector('.admin-sidebar');
        const menuBtn = document.querySelector('.menu-toggle-btn');
        if (sidebar && !sidebar.contains(event.target) && !menuBtn?.contains(event.target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, isMobile]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      alert('Settings saved successfully!');
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen && isMobile ? 'active' : ''}`} 
           onClick={() => setIsMobileMenuOpen(false)}>
      </div>
      
      {/* Sidebar with mobile support */}
      <div className={`admin-sidebar-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
        <AdminSidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
      </div>

      <div className="admin-main-content">
        {/* Mobile Header with Navigation Button */}
        <div className="mobile-header">
          <button 
            className="menu-toggle-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <Menu size={24} />
            <span className="menu-label">Menu</span>
          </button>
          <h2>Store Settings</h2>
          <div className="mobile-header-spacer"></div>
        </div>

        {/* Close button for mobile */}
        {isMobile && isMobileMenuOpen && (
          <button 
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        )}

        <div className="admin-settings-container">
          {/* Header */}
          <div className="settings-header">
            <div className="header-left">
              <div className="header-icon">
                <FaCog size={24} />
              </div>
              <div className="header-text">
                <h1>Store Settings</h1>
                <p>Manage your store configuration and preferences</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="settings-form">
            <div className="settings-grid">
              {/* General Settings */}
              <div className="settings-card">
                <div className="card-header">
                  <h3><FaStore /> General Settings</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>
                      <FaStore className="input-icon" />
                      Store Name
                    </label>
                    <input 
                      type="text" 
                      name="storeName" 
                      value={settings.storeName} 
                      onChange={handleChange} 
                      placeholder="Enter store name"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaEnvelope className="input-icon" />
                      Store Email
                    </label>
                    <input 
                      type="email" 
                      name="storeEmail" 
                      value={settings.storeEmail} 
                      onChange={handleChange} 
                      placeholder="Enter store email"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaPhone className="input-icon" />
                      Store Phone
                    </label>
                    <input 
                      type="text" 
                      name="storePhone" 
                      value={settings.storePhone} 
                      onChange={handleChange} 
                      placeholder="Enter store phone"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaMapMarkerAlt className="input-icon" />
                      Store Address
                    </label>
                    <textarea 
                      name="storeAddress" 
                      rows="3" 
                      value={settings.storeAddress} 
                      onChange={handleChange} 
                      placeholder="Enter store address"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping & Tax Settings */}
              <div className="settings-card">
                <div className="card-header">
                  <h3><FaShippingFast /> Shipping & Tax</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>
                      <FaGlobe className="input-icon" />
                      Currency
                    </label>
                    <select name="currency" value={settings.currency} onChange={handleChange}>
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="PKR">PKR (Rs)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <FaDollarSign className="input-icon" />
                      Tax Rate (%)
                    </label>
                    <input 
                      type="number" 
                      name="taxRate" 
                      value={settings.taxRate} 
                      onChange={handleChange} 
                      placeholder="Enter tax rate"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <FaShippingFast className="input-icon" />
                      Free Shipping Threshold (£)
                    </label>
                    <input 
                      type="number" 
                      name="freeShippingThreshold" 
                      value={settings.freeShippingThreshold} 
                      onChange={handleChange} 
                      placeholder="Enter free shipping threshold"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="settings-card">
                <div className="card-header">
                  <h3><FaBell /> Notification Settings</h3>
                </div>
                <div className="card-body">
                  <div className="form-group">
                    <label>
                      <FaEnvelope className="input-icon" />
                      Notification Email
                    </label>
                    <input 
                      type="email" 
                      name="notificationEmail" 
                      value={settings.notificationEmail} 
                      onChange={handleChange} 
                      placeholder="Enter notification email"
                    />
                  </div>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="emailNotifications" 
                        checked={settings.emailNotifications} 
                        onChange={handleChange} 
                      />
                      <span className="checkmark"></span>
                      Enable Email Notifications
                    </label>
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        name="orderNotifications" 
                        checked={settings.orderNotifications} 
                        onChange={handleChange} 
                      />
                      <span className="checkmark"></span>
                      Enable Order Notifications
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="save-settings-btn" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-small"></span>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Settings
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;