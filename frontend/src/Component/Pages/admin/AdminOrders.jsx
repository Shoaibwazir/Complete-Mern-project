import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaBox, FaHourglassHalf, FaCog, FaTruck, FaCheckCircle, 
  FaTimesCircle, FaSearch, FaEye, FaDollarSign,
  FaShoppingBag, FaSyncAlt, FaTrashAlt  // ✅ Changed FaRefresh → FaSyncAlt
} from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

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
    fetchOrders();
  }, [userInfo, navigate]);

  const fetchOrders = async () => {
    try {
      const token = userInfo?.token;
      if (!token) {
        toast.error('Please login again');
        navigate('/login');
        return;
      }

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/api/orders', config);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { status }, config);
      toast.success(`Order status updated to ${status.toUpperCase()}`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to permanently delete this order? This action cannot be undone.')) {
      try {
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5000/api/orders/${orderId}`, config);
        toast.success('Order deleted successfully');
        fetchOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        toast.error('Failed to delete order');
      }
    }
  };

  const deleteAllCancelledOrders = async () => {
    const cancelledOrders = orders.filter(o => o.status === 'cancelled');
    if (cancelledOrders.length === 0) {
      toast.error('No cancelled orders to delete');
      return;
    }
    
    if (window.confirm(`Are you sure you want to permanently delete ${cancelledOrders.length} cancelled orders? This action cannot be undone.`)) {
      try {
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        for (const order of cancelledOrders) {
          await axios.delete(`http://localhost:5000/api/orders/${order._id}`, config);
        }
        
        toast.success(`${cancelledOrders.length} cancelled orders deleted successfully`);
        fetchOrders();
      } catch (error) {
        console.error('Error deleting cancelled orders:', error);
        toast.error('Failed to delete cancelled orders');
      }
    }
  };

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const processingOrders = orders.filter(o => o.status === 'processing').length;
  const shippedOrders = orders.filter(o => o.status === 'shipped').length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  const statusConfig = {
    pending: { icon: <FaHourglassHalf />, color: '#ff9800', bg: '#fff3e0', label: 'Pending' },
    processing: { icon: <FaCog />, color: '#2196f3', bg: '#e3f2fd', label: 'Processing' },
    shipped: { icon: <FaTruck />, color: '#9c27b0', bg: '#f3e5f5', label: 'Shipped' },
    delivered: { icon: <FaCheckCircle />, color: '#4caf50', bg: '#e8f5e9', label: 'Delivered' },
    cancelled: { icon: <FaTimesCircle />, color: '#f44336', bg: '#ffebee', label: 'Cancelled' }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
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
          <h2>Order Management</h2>
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

        <div className="admin-orders-container">
          {/* Header */}
          <div className="orders-header">
            <div className="header-left">
              <div className="header-icon">
                <FaShoppingBag size={24} />
              </div>
              <div className="header-text">
                <h1>Order Management</h1>
                <p>View, manage, and update customer orders</p>
              </div>
            </div>
            <div className="header-right">
              <button className="refresh-btn" onClick={fetchOrders}>
                <FaSyncAlt /> Refresh
              </button>
              {cancelledOrders > 0 && (
                <button className="delete-all-btn" onClick={deleteAllCancelledOrders}>
                  <FaTrashAlt /> Delete All ({cancelledOrders})
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon"><FaShoppingBag /></div>
              <div className="stat-info">
                <h3>{totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-icon"><FaDollarSign /></div>
              <div className="stat-info">
                <h3>£{totalRevenue.toFixed(2)}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon"><FaHourglassHalf /></div>
              <div className="stat-info">
                <h3>{pendingOrders}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card processing">
              <div className="stat-icon"><FaCog /></div>
              <div className="stat-info">
                <h3>{processingOrders}</h3>
                <p>Processing</p>
              </div>
            </div>
            <div className="stat-card shipped">
              <div className="stat-icon"><FaTruck /></div>
              <div className="stat-info">
                <h3>{shippedOrders}</h3>
                <p>Shipped</p>
              </div>
            </div>
            <div className="stat-card delivered">
              <div className="stat-icon"><FaCheckCircle /></div>
              <div className="stat-info">
                <h3>{deliveredOrders}</h3>
                <p>Delivered</p>
              </div>
            </div>
            <div className="stat-card cancelled">
              <div className="stat-icon"><FaTimesCircle /></div>
              <div className="stat-info">
                <h3>{cancelledOrders}</h3>
                <p>Cancelled</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by order ID, customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button 
                className={`filter-chip ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All <span className="count">{totalOrders}</span>
              </button>
              <button 
                className={`filter-chip ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                <FaHourglassHalf /> Pending <span className="count">{pendingOrders}</span>
              </button>
              <button 
                className={`filter-chip ${filterStatus === 'processing' ? 'active' : ''}`}
                onClick={() => setFilterStatus('processing')}
              >
                <FaCog /> Processing <span className="count">{processingOrders}</span>
              </button>
              <button 
                className={`filter-chip ${filterStatus === 'shipped' ? 'active' : ''}`}
                onClick={() => setFilterStatus('shipped')}
              >
                <FaTruck /> Shipped <span className="count">{shippedOrders}</span>
              </button>
              <button 
                className={`filter-chip ${filterStatus === 'delivered' ? 'active' : ''}`}
                onClick={() => setFilterStatus('delivered')}
              >
                <FaCheckCircle /> Delivered <span className="count">{deliveredOrders}</span>
              </button>
              <button 
                className={`filter-chip ${filterStatus === 'cancelled' ? 'active' : ''}`}
                onClick={() => setFilterStatus('cancelled')}
              >
                <FaTimesCircle /> Cancelled <span className="count">{cancelledOrders}</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="orders-table-container">
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <tr key={order._id}>
                        <td className="order-id">
                          <span className="order-id-badge">#{order._id.slice(-8)}</span>
                        </td>
                        <td>
                          <div className="customer-info">
                            <strong>{order.user?.name || 'Guest'}</strong>
                            <small>{order.user?.email || 'No email'}</small>
                          </div>
                        </td>
                        <td className="items-count">
                          <span className="items-badge">{order.orderItems?.length || 0} items</span>
                        </td>
                        <td className="amount">£{order.totalPrice?.toFixed(2)}</td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            className={`status-select ${order.status}`}
                            style={{ 
                              backgroundColor: status.bg,
                              color: status.color,
                              borderColor: status.color
                            }}
                          >
                            <option value="pending">⏳ Pending</option>
                            <option value="processing">🔄 Processing</option>
                            <option value="shipped">🚚 Shipped</option>
                            <option value="delivered">✅ Delivered</option>
                            <option value="cancelled">❌ Cancelled</option>
                          </select>
                        </td>
                        <td>
                          <span className={`payment-badge ${order.isPaid ? 'paid' : 'unpaid'}`}>
                            {order.isPaid ? '✓ Paid' : '○ Unpaid'}
                          </span>
                        </td>
                        <td className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="view-btn"
                              onClick={() => navigate(`/admin/orders/${order._id}`)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            {order.status === 'cancelled' && (
                              <button
                                className="delete-btn"
                                onClick={() => deleteOrder(order._id)}
                                title="Delete Order"
                              >
                                <FaTrashAlt />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="no-orders">
                <div className="no-orders-icon">📭</div>
                <h3>No orders found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;