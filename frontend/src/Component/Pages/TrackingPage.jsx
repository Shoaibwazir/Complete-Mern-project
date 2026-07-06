// src/Component/Pages/TrackingPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MessageCircle,
  Share2,
  Printer,
  ShoppingBag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import './TrackingPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TrackingPage = () => {
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Handle Track Order
  const handleTrack = async (e) => {
    e.preventDefault();

    if (!orderNumber.trim()) {
      toast.error('Please enter your order number');
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      const params = new URLSearchParams();
      if (email.trim()) params.append('email', email.trim());

      const response = await fetch(
        `${API_URL}/orders/track/${encodeURIComponent(orderNumber.trim())}?${params.toString()}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'No order found with this number.');
      }

      setTrackingData(data.order);
      toast.success('Order found!');
    } catch (err) {
      console.error('Tracking error:', err);
      setError(err.message || 'No order found with this number. Please check and try again.');
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Get Status Icon
  const getStatusIcon = (status) => {
    const statusMap = {
      'order placed': <Clock size={20} />,
      'processing': <Package size={20} />,
      'shipped': <Truck size={20} />,
      'in transit': <MapPin size={20} />,
      'out for delivery': <Truck size={20} />,
      'delivered': <CheckCircle size={20} />,
      'cancelled': <AlertCircle size={20} />,
      'pending': <Clock size={20} />,
    };
    return statusMap[(status || '').toLowerCase()] || <Package size={20} />;
  };

  // ✅ Get Status Color
  const getStatusColor = (status, completed) => {
    if (completed) return '#48bb78';
    const colorMap = {
      'order placed': '#4299e1',
      'processing': '#ed8936',
      'shipped': '#9f7aea',
      'in transit': '#4299e1',
      'out for delivery': '#ed8936',
      'delivered': '#48bb78',
      'cancelled': '#e53e3e',
      'pending': '#a0aec0',
    };
    return colorMap[(status || '').toLowerCase()] || '#a0aec0';
  };

  // ✅ Get Status Badge
  const getStatusBadge = (status) => {
    const badgeMap = {
      'order placed': { color: '#4299e1', bg: '#ebf8ff' },
      'processing': { color: '#ed8936', bg: '#fffaf0' },
      'shipped': { color: '#9f7aea', bg: '#faf5ff' },
      'in transit': { color: '#4299e1', bg: '#ebf8ff' },
      'out for delivery': { color: '#ed8936', bg: '#fffaf0' },
      'delivered': { color: '#48bb78', bg: '#f0fff4' },
      'cancelled': { color: '#e53e3e', bg: '#fff5f5' },
      'pending': { color: '#a0aec0', bg: '#f7fafc' },
    };
    return badgeMap[(status || '').toLowerCase()] || { color: '#a0aec0', bg: '#f7fafc' };
  };

  // ✅ Share Function
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Order Tracking',
        text: `Track your order #${trackingData?.orderNumber}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="tracking-page">
      <div className="tracking-container">
        {/* ═══ HEADER ═══ */}
        <div className="tracking-header">
          <button type="button" onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={20} /> Back
          </button>
          <h1>Track Your Order</h1>
          <p>Enter your order number to track your delivery</p>
        </div>

        {/* ═══ SEARCH FORM ═══ */}
        <div className="tracking-search">
          <form onSubmit={handleTrack} className="tracking-form">
            {/* Order Number Field */}
            <div className="form-group">
              <label htmlFor="orderNumber">Order Number</label>
              <div className="input-with-icon">
                <ShoppingBag size={18} className="input-icon" />
                <input
                  id="orderNumber"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., QEL-123456"
                  className={error ? 'error' : ''}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">Email Address (Optional)</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Track Button */}
            <div className="form-group-btn">
              <button type="submit" className="track-btn" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Track Order
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-box">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* ═══ TRACKING RESULTS ═══ */}
        {trackingData && (
          <div className="tracking-results">
            {/* Order Summary */}
            <div className="order-summary-card">
              <div className="order-header">
                <div>
                  <h3>Order #{trackingData.orderNumber}</h3>
                  <p>Estimated Delivery: {trackingData.estimatedDelivery || 'TBD'}</p>
                </div>
                <div 
                  className="order-status-badge" 
                  style={{ 
                    background: getStatusBadge(trackingData.status).bg,
                    color: getStatusBadge(trackingData.status).color 
                  }}
                >
                  <span style={{ color: getStatusBadge(trackingData.status).color }}>
                    {(trackingData.status || 'PENDING').toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="order-details-grid">
                <div className="detail-item">
                  <Truck size={18} />
                  <div>
                    <span>Carrier</span>
                    <strong>{trackingData.carrier || 'Not yet assigned'}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <Package size={18} />
                  <div>
                    <span>Tracking Number</span>
                    {trackingData.trackingNumber ? (
                      <a
                        href={trackingData.trackingUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="tracking-link"
                      >
                        {trackingData.trackingNumber}
                      </a>
                    ) : (
                      <strong>Not yet dispatched</strong>
                    )}
                  </div>
                </div>
                <div className="detail-item">
                  <Calendar size={18} />
                  <div>
                    <span>Expected Delivery</span>
                    <strong>{trackingData.estimatedDelivery || 'TBD'}</strong>
                  </div>
                </div>
                <div className="detail-item">
                  <MapPin size={18} />
                  <div>
                    <span>Delivery Address</span>
                    <strong>
                      {trackingData.shippingAddress?.firstName} {trackingData.shippingAddress?.lastName}
                      <br />
                      {trackingData.shippingAddress?.address}
                      <br />
                      {trackingData.shippingAddress?.city}, {trackingData.shippingAddress?.postalCode}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="order-actions">
                {trackingData.trackingUrl && (
                  <a
                    href={trackingData.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn primary"
                  >
                    <Truck size={16} />
                    Track on {trackingData.carrier || 'Carrier'}
                  </a>
                )}
                <button type="button" className="action-btn secondary" onClick={handleShare}>
                  <Share2 size={16} />
                  Share
                </button>
                <button type="button" className="action-btn secondary" onClick={() => window.print()}>
                  <Printer size={16} />
                  Print
                </button>
              </div>
            </div>

            {/* Tracking Timeline */}
            {trackingData.trackingHistory?.length > 0 && (
              <div className="tracking-timeline">
                <h3>Tracking History</h3>
                <div className="timeline">
                  {trackingData.trackingHistory.map((event, index) => (
                    <div key={index} className={`timeline-item ${event.completed ? 'completed' : ''}`}>
                      <div
                        className="timeline-dot"
                        style={{ background: getStatusColor(event.status, event.completed) }}
                      ></div>
                      {index < trackingData.trackingHistory.length - 1 && (
                        <div
                          className="timeline-line"
                          style={{ background: event.completed ? '#48bb78' : '#e2e8f0' }}
                        ></div>
                      )}
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <div className="timeline-status">
                            {getStatusIcon(event.status)}
                            <strong>{event.status}</strong>
                          </div>
                          {event.date && <span className="timeline-date">{event.date}</span>}
                        </div>
                        <p className="timeline-description">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Order Items */}
            {trackingData.items?.length > 0 && (
              <div className="order-items-card">
                <h3>Order Items</h3>
                <div className="items-list">
                  {trackingData.items.map((item, index) => (
                    <div key={index} className="item-row">
                      <div>
                        <strong>{item.name}</strong>
                        <span className="item-meta">× {item.quantity}</span>
                      </div>
                      <span>£{Number(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="help-section">
              <h3>Need Help?</h3>
              <div className="help-options">
                <div className="help-item">
                  <Mail size={18} />
                  <div>
                    <strong>Email Us</strong>
                    <span>info@qasrelibas.co.uk</span>
                  </div>
                </div>
                <div className="help-item">
                  <Phone size={18} />
                  <div>
                    <strong>Call Us</strong>
                    <span>+44 7460 816860</span>
                  </div>
                </div>
                <div className="help-item">
                  <MessageCircle size={18} />
                  <div>
                    <strong>Live Chat</strong>
                    <span>Available 24/7</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══ EMPTY STATE ═══ */}
        {!loading && !trackingData && !error && (
          <div className="tracking-empty">
            <Package size={48} />
            <h3>Enter your order number</h3>
            <p>Enter your order number above to track your delivery status</p>
            <div className="empty-actions">
              <button type="button" onClick={() => navigate('/orders')} className="empty-btn">
                View All Orders
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;