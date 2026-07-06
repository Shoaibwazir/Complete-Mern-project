// src/Component/Admin/AdminOrderDetail.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  User,
  MapPin,
  ShoppingBag,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  Settings,
  Package,
  Printer,
  Trash2,
  RefreshCw,
  Eye,
  FileText,
  CreditCard,
  Menu,
  X
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminOrderDetail.css';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [id, userInfo, navigate]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = userInfo?.token;
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:5000/api/orders/${id}`, config);
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (status) => {
    try {
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/orders/${id}/status`, { status }, config);
      toast.success(`Order status updated to ${status.toUpperCase()}`);
      fetchOrderDetails();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteOrder = async () => {
    if (window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
      try {
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5000/api/orders/${id}`, config);
        toast.success('Order deleted successfully');
        navigate('/admin/orders');
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete order');
      }
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { icon: <Clock size={16} />, color: '#ff9800', bg: '#fff3e0', label: 'Pending' },
      processing: { icon: <Settings size={16} />, color: '#2196f3', bg: '#e3f2fd', label: 'Processing' },
      shipped: { icon: <Truck size={16} />, color: '#9c27b0', bg: '#f3e5f5', label: 'Shipped' },
      delivered: { icon: <CheckCircle size={16} />, color: '#4caf50', bg: '#e8f5e9', label: 'Delivered' },
      cancelled: { icon: <XCircle size={16} />, color: '#f44336', bg: '#ffebee', label: 'Cancelled' }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      <div className="admin-error">
        <div className="error-icon">⚠️</div>
        <h2>Order Not Found</h2>
        <p>The order you're looking for doesn't exist.</p>
        <Link to="/admin/orders" className="back-link">Back to Orders</Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="admin-layout">
      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isMobileMenuOpen && isMobile ? 'active' : ''}`} 
           onClick={() => setIsMobileMenuOpen(false)}>
      </div>
      
      {/* Sidebar */}
      <div className={`admin-sidebar-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
        <AdminSidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
      </div>

      <div className="admin-main-content">
        {/* Mobile Header */}
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
          <h2>Order Details</h2>
          <div className="mobile-header-spacer"></div>
        </div>

        {isMobile && isMobileMenuOpen && (
          <button 
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        )}

        <div className="order-detail-container">
          {/* Header */}
          <div className="detail-header">
            <div className="header-left">
              <button onClick={() => navigate('/admin/orders')} className="back-btn">
                <ArrowLeft size={18} /> Back to Orders
              </button>
              <h1>Order #{order._id?.slice(-8).toUpperCase()}</h1>
              <span className={`order-status-badge ${order.status}`}>
                {statusConfig.icon} {statusConfig.label}
              </span>
            </div>
            <div className="header-right">
              <button className="action-btn refresh" onClick={fetchOrderDetails}>
                <RefreshCw size={16} /> Refresh
              </button>
              <button className="action-btn print" onClick={() => window.print()}>
                <Printer size={16} /> Print
              </button>
              <button className="action-btn delete" onClick={deleteOrder}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>

          {/* Order Info Grid */}
          <div className="info-grid">
            <div className="info-card">
              <div className="info-card-header">
                <User className="info-icon" size={20} />
                <h3>Customer Information</h3>
              </div>
              <div className="info-card-body">
                <p><strong>Name:</strong> {order.user?.name || 'Guest'}</p>
                <p><strong>Email:</strong> {order.user?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {order.user?.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <MapPin className="info-icon" size={20} />
                <h3>Shipping Address</h3>
              </div>
              <div className="info-card-body">
                <p>{order.shippingAddress?.address || 'N/A'}</p>
                <p>{order.shippingAddress?.city || ''}, {order.shippingAddress?.postalCode || ''}</p>
                <p>{order.shippingAddress?.country || 'N/A'}</p>
              </div>
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <ShoppingBag className="info-icon" size={20} />
                <h3>Order Summary</h3>
              </div>
              <div className="info-card-body">
                <p><strong>Order Date:</strong> {formatDate(order.createdAt)}</p>
                <p><strong>Items:</strong> {order.orderItems?.length || 0}</p>
                <p><strong>Payment:</strong> {order.isPaid ? '✅ Paid' : '❌ Unpaid'}</p>
                <p><strong>Total:</strong> <span className="total-amount">£{order.totalPrice?.toFixed(2)}</span></p>
              </div>
            </div>
          </div>

          {/* Status Update */}
          <div className="status-update-section">
            <h3>Update Order Status</h3>
            <div className="status-buttons">
              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => {
                const config = getStatusConfig(status);
                const isActive = order.status === status;
                return (
                  <button
                    key={status}
                    className={`status-btn ${status} ${isActive ? 'active' : ''}`}
                    onClick={() => updateOrderStatus(status)}
                    style={{
                      backgroundColor: isActive ? config.color : 'transparent',
                      color: isActive ? '#fff' : config.color,
                      borderColor: config.color
                    }}
                  >
                    {config.icon} {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items-section">
            <h3>Order Items</h3>
            <div className="items-table-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems?.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="product-info">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="product-image" />
                          )}
                          <span className="product-name">{item.name}</span>
                        </div>
                      </td>
                      <td>£{item.price?.toFixed(2)}</td>
                      <td>{item.quantity}</td>
                      <td>£{(item.price * item.quantity)?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3"><strong>Subtotal</strong></td>
                    <td>£{order.itemsPrice?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3"><strong>Shipping</strong></td>
                    <td>£{order.shippingPrice?.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan="3"><strong>Tax</strong></td>
                    <td>£{order.taxPrice?.toFixed(2)}</td>
                  </tr>
                  <tr className="total-row">
                    <td colSpan="3"><strong>Total</strong></td>
                    <td><strong>£{order.totalPrice?.toFixed(2)}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Order Timeline */}
          <div className="order-timeline-section">
            <h3>Order Timeline</h3>
            <div className="timeline">
              <div className={`timeline-item ${order.status !== 'cancelled' ? 'completed' : ''}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <strong>Order Created</strong>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
              {order.status !== 'cancelled' && (
                <>
                  <div className={`timeline-item ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <strong>Processing</strong>
                      <span>{order.status === 'pending' ? 'Pending' : 'Completed'}</span>
                    </div>
                  </div>
                  <div className={`timeline-item ${['shipped', 'delivered'].includes(order.status) ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <strong>Shipped</strong>
                      <span>{order.status === 'shipped' || order.status === 'delivered' ? 'Completed' : 'Pending'}</span>
                    </div>
                  </div>
                  <div className={`timeline-item ${order.status === 'delivered' ? 'completed' : ''}`}>
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <strong>Delivered</strong>
                      <span>{order.status === 'delivered' ? 'Completed' : 'Pending'}</span>
                    </div>
                  </div>
                </>
              )}
              {order.status === 'cancelled' && (
                <div className="timeline-item completed cancelled">
                  <div className="timeline-dot cancelled"></div>
                  <div className="timeline-content">
                    <strong>Cancelled</strong>
                    <span>Order was cancelled</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;