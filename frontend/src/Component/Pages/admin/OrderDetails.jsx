import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaBox, FaCalendar, FaCreditCard, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import './AdminDashboard.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [id, userInfo, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`, config);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status) => {
    setUpdating(true);
    try {
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, config);
      toast.success(`Order status updated to ${status}`);
      fetchOrderDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  // ✅ NEW: Cancel Order Function
  const handleCancelOrder = async () => {
    // Confirmation dialog
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this order?\n\n' +
      'This will:\n' +
      '• Cancel the order\n' +
      '• Restore product stock\n' +
      '• This action cannot be undone!'
    );
    
    if (!confirmCancel) return;
    
    setCancelling(true);
    try {
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/orders/${id}/cancel`, {}, config);
      toast.success('Order cancelled successfully!');
      fetchOrderDetails();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      processing: '#2196f3',
      shipped: '#9c27b0',
      delivered: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status] || '#999';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      processing: '🔄',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📦';
  };

  // Check if order can be cancelled
  const canCancel = order && !['delivered', 'cancelled'].includes(order.status);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="admin-container">
        <AdminSidebar />
        <div className="admin-main">
          <div className="error-state">
            <span>⚠️</span>
            <h3>Order not found</h3>
            <button onClick={() => navigate('/admin/orders')}>Back to Orders</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-main">
        <div className="order-details-header">
          <button className="back-btn" onClick={() => navigate('/admin/orders')}>
            ← Back to Orders
          </button>
          <div className="header-actions">
            <h1>Order Details</h1>
            {/* ✅ Cancel Order Button */}
            {canCancel && (
              <button 
                className="cancel-order-btn"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                <FaTimesCircle /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
          </div>
          <p className="order-id-large">Order ID: #{order._id}</p>
        </div>

        <div className="order-details-grid">
          {/* Customer Information */}
          <div className="detail-card customer-card">
            <h3><FaUser /> Customer Information</h3>
            <div className="detail-row">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><FaEnvelope /> Email:</span>
              <span className="detail-value">{order.shippingAddress?.email}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><FaPhone /> Phone:</span>
              <span className="detail-value">{order.shippingAddress?.phone}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label"><FaMapMarkerAlt /> Address:</span>
              <span className="detail-value">
                {order.shippingAddress?.address},<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.postalCode},<br />
                {order.shippingAddress?.country}
              </span>
            </div>
          </div>

          {/* Order Summary */}
          <div className="detail-card order-summary-card">
            <h3><FaBox /> Order Summary</h3>
            <div className="detail-row">
              <span className="detail-label">Order Date:</span>
              <span className="detail-value">{new Date(order.createdAt).toLocaleString()}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Payment Method:</span>
              <span className="detail-value">{order.paymentMethod || 'Card'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Payment Status:</span>
              <span className={`payment-status ${order.isPaid ? 'paid' : 'unpaid'}`}>
                {order.isPaid ? '✅ Paid' : '❌ Unpaid'}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Order Status:</span>
              <select
                value={order.status}
                onChange={(e) => updateOrderStatus(e.target.value)}
                className={`order-status-select ${order.status}`}
                disabled={updating || order.status === 'cancelled'}
                style={{ borderColor: getStatusColor(order.status) }}
              >
                <option value="pending">⏳ Pending</option>
                <option value="processing">🔄 Processing</option>
                <option value="shipped">🚚 Shipped</option>
                <option value="delivered">✅ Delivered</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
            {order.deliveredAt && (
              <div className="detail-row">
                <span className="detail-label">Delivered At:</span>
                <span className="detail-value">{new Date(order.deliveredAt).toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          <div className="detail-card price-card">
            <h3><FaCreditCard /> Price Details</h3>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal:</span>
                <span>£{order.itemsPrice?.toFixed(2)}</span>
              </div>
              <div className="price-row">
                <span>Shipping:</span>
                <span>{order.shippingPrice === 0 ? 'Free' : `£${order.shippingPrice?.toFixed(2)}`}</span>
              </div>
              <div className="price-row">
                <span>Tax (10%):</span>
                <span>£{order.taxPrice?.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="price-row discount">
                  <span>Discount:</span>
                  <span>-£{order.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="price-row total">
                <span>Total:</span>
                <span>£{order.totalPrice?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-items-card">
          <h3><FaBox /> Order Items</h3>
          <div className="order-items-table">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems?.map((item, index) => (
                  <tr key={index}>
                    <td><img src={item.image} alt={item.name} className="order-item-image" /></td>
                    <td>{item.name}</td>
                    <td>{item.size || 'N/A'}</td>
                    <td>{item.color || 'N/A'}</td>
                    <td>£{item.price?.toFixed(2)}</td>
                    <td>{item.quantity}</td>
                    <td>£{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="order-timeline-card">
          <h3><FaCalendar /> Order Timeline</h3>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-dot completed"></div>
              <div className="timeline-content">
                <h4>Order Placed</h4>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className={`timeline-dot ${order.status !== 'pending' ? 'completed' : ''}`}></div>
              <div className="timeline-content">
                <h4>Processing</h4>
                <p>{order.status !== 'pending' ? new Date(order.updatedAt).toLocaleString() : 'Waiting'}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className={`timeline-dot ${order.status === 'shipped' || order.status === 'delivered' ? 'completed' : ''}`}></div>
              <div className="timeline-content">
                <h4>Shipped</h4>
                <p>{order.status === 'shipped' || order.status === 'delivered' ? 'Shipped' : 'Not yet'}</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className={`timeline-dot ${order.status === 'delivered' ? 'completed' : ''}`}></div>
              <div className="timeline-content">
                <h4>Delivered</h4>
                <p>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : 'Not yet'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;