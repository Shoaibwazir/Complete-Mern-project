// src/Component/Pages/admin/AdminDiscounts.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import { 
  FaPlus, 
  FaEdit, 
  FaTrashAlt, 
  FaTag, 
  FaPercent,
  FaDollarSign,
  FaCalendarAlt,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaSave,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import './AdminDiscounts.css';

const AdminDiscounts = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    usageLimit: '',
    expiresAt: '',
    active: true,
    minOrderAmount: '',
    maxDiscountAmount: ''
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // ✅ Check if screen is mobile
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

  // ✅ Close mobile menu when clicking outside
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

  // ✅ Prevent body scroll when mobile menu is open
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

  // ✅ Fetch discounts from API
  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const token = userInfo?.token;
      
      if (!token) {
        toast.error('Please login first');
        setLoading(false);
        return;
      }
      
      const config = { 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      };
      
      const response = await axios.get(`${API_URL}/admin/discounts`, config);
      setDiscounts(response.data);
      
    } catch (error) {
      console.error('❌ Error fetching discounts:', error);
      
      // ✅ If API fails, show error and use empty array
      if (error.response?.status === 404) {
        toast.error('Discount API not found. Please check backend configuration.');
      } else if (error.response?.status === 401) {
        toast.error('Please login again');
      } else {
        toast.error('Failed to load discounts');
      }
      
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Open modal for adding new discount
  const openAddModal = () => {
    setEditingDiscount(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      usageLimit: '',
      expiresAt: '',
      active: true,
      minOrderAmount: '',
      maxDiscountAmount: ''
    });
    setShowModal(true);
  };

  // ✅ Open modal for editing discount
  const openEditModal = (discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      type: discount.type,
      value: discount.value,
      usageLimit: discount.usageLimit,
      expiresAt: discount.expiresAt,
      active: discount.active,
      minOrderAmount: discount.minOrderAmount || '',
      maxDiscountAmount: discount.maxDiscountAmount || ''
    });
    setShowModal(true);
  };

  // ✅ Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // ✅ Submit form (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validation
    if (!formData.code.trim()) {
      toast.error('Please enter a discount code');
      return;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      toast.error('Please enter a valid discount value');
      return;
    }
    if (!formData.usageLimit || parseInt(formData.usageLimit) <= 0) {
      toast.error('Please enter a valid usage limit');
      return;
    }
    if (!formData.expiresAt) {
      toast.error('Please select an expiry date');
      return;
    }

    setSaving(true);

    try {
      const token = userInfo?.token;
      
      if (!token) {
        toast.error('Please login first');
        setSaving(false);
        return;
      }
      
      const config = { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };

      const discountData = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: parseFloat(formData.value),
        usageLimit: parseInt(formData.usageLimit),
        expiresAt: formData.expiresAt,
        active: formData.active,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : 0
      };

      let response;
      if (editingDiscount) {
        // ✅ Update existing discount
        response = await axios.put(
          `${API_URL}/admin/discounts/${editingDiscount.id}`,
          discountData,
          config
        );
        toast.success('Discount updated successfully!');
      } else {
        // ✅ Create new discount
        response = await axios.post(
          `${API_URL}/admin/discounts`,
          discountData,
          config
        );
        toast.success('Discount created successfully!');
      }

      // ✅ Refresh list
      await fetchDiscounts();
      closeModal();

    } catch (error) {
      console.error('❌ Error saving discount:', error);
      
      let errorMsg = 'Failed to save discount';
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMsg = 'API endpoint not found. Please check backend configuration.';
      } else if (error.response?.status === 401) {
        errorMsg = 'Please login again';
      }
      
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete discount
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this discount code? This action cannot be undone.')) {
      return;
    }

    try {
      const token = userInfo?.token;
      
      if (!token) {
        toast.error('Please login first');
        return;
      }
      
      const config = { 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      };
      
      await axios.delete(`${API_URL}/admin/discounts/${id}`, config);
      toast.success('Discount deleted successfully!');
      await fetchDiscounts();
      
    } catch (error) {
      console.error('❌ Error deleting discount:', error);
      toast.error('Failed to delete discount');
    }
  };

  // ✅ Toggle discount active status
  const toggleStatus = async (id, currentStatus) => {
    try {
      const token = userInfo?.token;
      
      if (!token) {
        toast.error('Please login first');
        return;
      }
      
      const config = { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      };
      
      await axios.put(
        `${API_URL}/admin/discounts/${id}/toggle`,
        { active: !currentStatus },
        config
      );
      
      toast.success(`Discount ${!currentStatus ? 'activated' : 'deactivated'}`);
      await fetchDiscounts();
      
    } catch (error) {
      console.error('❌ Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  // ✅ Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditingDiscount(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      usageLimit: '',
      expiresAt: '',
      active: true,
      minOrderAmount: '',
      maxDiscountAmount: ''
    });
  };

  // ✅ Statistics
  const totalDiscounts = discounts.length;
  const activeDiscounts = discounts.filter(d => d.active).length;
  const totalUsed = discounts.reduce((sum, d) => sum + (d.used || 0), 0);

  // ✅ Loading state
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading discounts...</p>
      </div>
    );
  }

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
          <h2>Discount Codes</h2>
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

        <div className="admin-discounts-container">
          {/* Header */}
          <div className="discounts-header">
            <div className="header-left">
              <div className="header-icon">
                <FaTag size={24} />
              </div>
              <div className="header-text">
                <h1>Discount Codes</h1>
                <p>Create and manage promotional discount codes</p>
              </div>
            </div>
            <div className="header-right">
              <button className="add-discount-btn" onClick={openAddModal}>
                <FaPlus /> Add Discount
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="discounts-stats">
            <div className="stat-card total">
              <div className="stat-icon"><FaTag size={20} /></div>
              <div className="stat-info">
                <h3>{totalDiscounts}</h3>
                <p>Total Codes</p>
              </div>
            </div>
            <div className="stat-card active">
              <div className="stat-icon"><FaCheckCircle size={20} /></div>
              <div className="stat-info">
                <h3>{activeDiscounts}</h3>
                <p>Active</p>
              </div>
            </div>
            <div className="stat-card inactive">
              <div className="stat-icon"><FaTimesCircle size={20} /></div>
              <div className="stat-info">
                <h3>{totalDiscounts - activeDiscounts}</h3>
                <p>Inactive</p>
              </div>
            </div>
            <div className="stat-card used">
              <div className="stat-icon"><FaUsers size={20} /></div>
              <div className="stat-info">
                <h3>{totalUsed}</h3>
                <p>Total Used</p>
              </div>
            </div>
          </div>

          {/* Discounts Table */}
          <div className="discounts-table-container">
            <div className="table-responsive">
              <table className="discounts-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Usage</th>
                    <th>Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {discounts.map((discount) => (
                    <tr key={discount.id}>
                      <td>
                        <span className="discount-code">{discount.code}</span>
                      </td>
                      <td>
                        <span className={`type-badge ${discount.type}`}>
                          {discount.type === 'percentage' ? (
                            <><FaPercent /> Percentage</>
                          ) : (
                            <><FaDollarSign /> Fixed</>
                          )}
                        </span>
                      </td>
                      <td className="value-cell">
                        {discount.type === 'percentage' ? (
                          <span className="value-percentage">{discount.value}%</span>
                        ) : (
                          <span className="value-fixed">£{discount.value}</span>
                        )}
                      </td>
                      <td>
                        <div className="usage-info">
                          <span className="usage-number">{discount.used || 0}</span>
                          <span className="usage-separator">/</span>
                          <span className="usage-limit">{discount.usageLimit}</span>
                          <div className="usage-bar">
                            <div 
                              className="usage-fill" 
                              style={{ width: `${((discount.used || 0) / discount.usageLimit) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="expiry-date">
                        <FaCalendarAlt className="expiry-icon" />
                        {new Date(discount.expiresAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td>
                        <button 
                          className={`status-badge ${discount.active ? 'active' : 'inactive'}`}
                          onClick={() => toggleStatus(discount.id, discount.active)}
                          title={discount.active ? 'Click to deactivate' : 'Click to activate'}
                        >
                          {discount.active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="edit-btn" 
                            onClick={() => openEditModal(discount)}
                            title="Edit Discount"
                          >
                            <FaEdit />
          </button>
                          <button 
                            className="delete-btn" 
                            onClick={() => handleDelete(discount.id)}
                            title="Delete Discount"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {discounts.length === 0 && (
              <div className="no-discounts">
                <FaTag className="no-icon" />
                <h3>No Discount Codes</h3>
                <p>Create your first discount code to start promoting your products</p>
                <button className="add-discount-btn primary" onClick={openAddModal}>
                  <FaPlus /> Create Discount
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDiscount ? 'Edit Discount' : 'Add New Discount'}</h2>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Discount Code *</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SUMMER25"
                  required
                  autoComplete="off"
                  disabled={saving}
                />
                <small>Use uppercase letters and numbers (e.g., SUMMER25)</small>
              </div>

              <div className="form-group">
                <label>Discount Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (£)</option>
                </select>
              </div>

              <div className="form-group">
                <label>{formData.type === 'percentage' ? 'Discount % *' : 'Discount Amount (£) *'}</label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  placeholder={formData.type === 'percentage' ? 'e.g., 25' : 'e.g., 5.99'}
                  step={formData.type === 'percentage' ? '1' : '0.01'}
                  min="0.01"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Minimum Order Amount (£)</label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 50.00"
                  step="0.01"
                  min="0"
                  disabled={saving}
                />
                <small>Minimum order amount required to use this code</small>
              </div>

              <div className="form-group">
                <label>Maximum Discount Amount (£)</label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 100.00"
                  step="0.01"
                  min="0"
                  disabled={saving}
                />
                <small>Maximum discount amount (leave empty for no limit)</small>
              </div>

              <div className="form-group">
                <label>Usage Limit *</label>
                <input
                  type="number"
                  name="usageLimit"
                  value={formData.usageLimit}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  min="1"
                  required
                  disabled={saving}
                />
                <small>Maximum number of times this code can be used</small>
              </div>

              <div className="form-group">
                <label>Expiry Date *</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    disabled={saving}
                  />
                  <span className="checkmark"></span>
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={saving}>
                  {saving ? (
                    <><FaSpinner className="spinning" /> Saving...</>
                  ) : (
                    <><FaSave /> {editingDiscount ? 'Update Discount' : 'Create Discount'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscounts;