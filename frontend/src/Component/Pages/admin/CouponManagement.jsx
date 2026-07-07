// src/Component/Admin/CouponManagement.jsx
import React, { useState, useEffect } from 'react';
import couponService from './../../../../../Backend/services/couponService';
import toast from 'react-hot-toast';
import './CouponManagement.css';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    type: 'percentage',
    value: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    endDate: '',
    usageLimit: '',
    isActive: true,
    isFeatured: false,
    bannerMessage: '',
    bannerIcon: '🏷️',
    bannerColor: '#d4af37',
    bannerBgColor: '#14142a',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponService.getActiveCoupons();
      if (response.success) {
        setCoupons(response.data.all || []);
      }
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (editingCoupon) {
        response = await couponService.updateCoupon(editingCoupon._id, formData);
      } else {
        response = await couponService.createCoupon(formData);
      }
      
      if (response.success) {
        toast.success(editingCoupon ? 'Coupon updated!' : 'Coupon created!');
        setShowModal(false);
        resetForm();
        fetchCoupons();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error('Failed to save coupon');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      const response = await couponService.deleteCoupon(id);
      if (response.success) {
        toast.success('Coupon deleted!');
        fetchCoupons();
      } else {
        toast.error(response.message);
      }
    }
  };

  const handleToggleFeatured = async (id) => {
    const response = await couponService.toggleFeatured(id);
    if (response.success) {
      toast.success('Featured status updated!');
      fetchCoupons();
    } else {
      toast.error(response.message);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      type: 'percentage',
      value: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      endDate: '',
      usageLimit: '',
      isActive: true,
      isFeatured: false,
      bannerMessage: '',
      bannerIcon: '🏷️',
      bannerColor: '#d4af37',
      bannerBgColor: '#14142a',
    });
    setEditingCoupon(null);
  };

  const editCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value || '',
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscountAmount: coupon.maxDiscountAmount || '',
      endDate: coupon.endDate.split('T')[0],
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive,
      isFeatured: coupon.isFeatured,
      bannerMessage: coupon.bannerMessage || '',
      bannerIcon: coupon.bannerIcon || '🏷️',
      bannerColor: coupon.bannerColor || '#d4af37',
      bannerBgColor: coupon.bannerBgColor || '#14142a',
    });
    setShowModal(true);
  };

  return (
    <div className="coupon-management">
      <div className="coupon-header">
        <h2>🎟️ Coupon Management</h2>
        <button 
          className="btn-add-coupon"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Add New Coupon
        </button>
      </div>

      <div className="coupon-stats">
        <div className="stat-card">
          <span>Total Coupons</span>
          <strong>{coupons.length}</strong>
        </div>
        <div className="stat-card">
          <span>Active Coupons</span>
          <strong>{coupons.filter(c => c.isActive).length}</strong>
        </div>
        <div className="stat-card">
          <span>Featured</span>
          <strong>{coupons.filter(c => c.isFeatured).length}</strong>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <div className="coupon-table">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Expiry</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon._id}>
                  <td className="coupon-code">{coupon.code}</td>
                  <td>{coupon.description}</td>
                  <td>
                    {coupon.type === 'percentage' && `${coupon.value}%`}
                    {coupon.type === 'fixed' && `£${coupon.value}`}
                    {coupon.type === 'free_shipping' && '🚚 Free Shipping'}
                  </td>
                  <td>{new Date(coupon.endDate).toLocaleDateString()}</td>
                  <td>
                    <button
                      className={`toggle-featured ${coupon.isFeatured ? 'active' : ''}`}
                      onClick={() => handleToggleFeatured(coupon._id)}
                    >
                      {coupon.isFeatured ? '⭐' : '☆'}
                    </button>
                  </td>
                  <td>
                    <span className={`status ${coupon.isActive ? 'active' : 'inactive'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => editCoupon(coupon)} className="edit-btn">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(coupon._id)} className="delete-btn">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="coupon-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  required
                  placeholder="e.g., EID50"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                  placeholder="e.g., Eid Special - 50% off"
                />
              </div>

              <div className="form-group">
                <label>Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (£)</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </div>

              {formData.type !== 'free_shipping' && (
                <div className="form-group">
                  <label>Value *</label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    required
                    placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 15'}
                  />
                  <small>
                    {formData.type === 'percentage' ? 'Enter percentage (e.g., 20 for 20%)' : 'Enter amount in GBP'}
                  </small>
                </div>
              )}

              <div className="form-group">
                <label>Minimum Order Amount (optional)</label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                  placeholder="e.g., 50"
                />
              </div>

              {formData.type === 'percentage' && (
                <div className="form-group">
                  <label>Maximum Discount Amount (optional)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value})}
                    placeholder="e.g., 100"
                  />
                </div>
              )}

              <div className="form-group">
                <label>Expiry Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Usage Limit (optional)</label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  placeholder="Leave empty for unlimited"
                />
              </div>

              <div className="form-group form-check">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  />
                  Active
                </label>
              </div>

              <div className="form-group form-check">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                  />
                  Show on Website Banner
                </label>
              </div>

              {formData.isFeatured && (
                <>
                  <div className="form-group">
                    <label>Banner Message</label>
                    <input
                      type="text"
                      value={formData.bannerMessage}
                      onChange={(e) => setFormData({...formData, bannerMessage: e.target.value})}
                      placeholder="e.g., Eid Special Offer!"
                    />
                  </div>

                  <div className="form-group">
                    <label>Banner Icon</label>
                    <select
                      value={formData.bannerIcon}
                      onChange={(e) => setFormData({...formData, bannerIcon: e.target.value})}
                    >
                      <option value="🎉">🎉</option>
                      <option value="⭐">⭐</option>
                      <option value="🎊">🎊</option>
                      <option value="🏷️">🏷️</option>
                      <option value="💫">💫</option>
                      <option value="✨">✨</option>
                      <option value="🌟">🌟</option>
                      <option value="🎁">🎁</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Text Color</label>
                    <input
                      type="color"
                      value={formData.bannerColor}
                      onChange={(e) => setFormData({...formData, bannerColor: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Background Color</label>
                    <input
                      type="color"
                      value={formData.bannerBgColor}
                      onChange={(e) => setFormData({...formData, bannerBgColor: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingCoupon ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;