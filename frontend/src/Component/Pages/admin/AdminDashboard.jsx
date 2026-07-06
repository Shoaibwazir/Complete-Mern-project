import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell,
  BarChart, Bar
} from 'recharts';
import { 
  FaDollarSign, FaShoppingBag, FaHourglassHalf, FaCheckCircle, 
  FaBoxes, FaUsers, FaPlus, FaEdit, FaEye, FaChartLine,
  FaTruck, FaTimesCircle, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    recentOrders: [],
    lowStockProducts: []
  });
  const [chartData, setChartData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
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
    if (!userInfo) {
      toast.error("Please login first");
      navigate('/login');
      return;
    }
    if (!userInfo.isAdmin) {
      toast.error("Access Denied: Admin only!");
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [userInfo, navigate]);

  const fetchDashboardData = async () => {
    try {
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [statsRes, chartRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/stats', config),
        axios.get('http://localhost:5000/api/admin/chart-data', config)
      ]);
      
      setStats(statsRes.data);
      setChartData(chartRes.data?.daily || []);
      setMonthlyData(chartRes.data?.monthly || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Sample data for demo
      setStats({
        totalUsers: 1250,
        totalProducts: 245,
        totalOrders: 1890,
        totalSales: 45678,
        pendingOrders: 23,
        processingOrders: 15,
        shippedOrders: 8,
        deliveredOrders: 1852,
        cancelledOrders: 12,
        recentOrders: [
          { _id: 'ORD8932', user: { name: 'John Doe' }, totalPrice: 299.99, status: 'pending', createdAt: new Date() },
          { _id: 'ORD8931', user: { name: 'Jane Smith' }, totalPrice: 159.99, status: 'processing', createdAt: new Date() },
          { _id: 'ORD8930', user: { name: 'Ali Khan' }, totalPrice: 89.99, status: 'delivered', createdAt: new Date() },
          { _id: 'ORD8929', user: { name: 'Sarah Ahmed' }, totalPrice: 440.00, status: 'cancelled', createdAt: new Date() },
          { _id: 'ORD8928', user: { name: 'David Brown' }, totalPrice: 176.00, status: 'shipped', createdAt: new Date() },
        ],
        lowStockProducts: [
          { _id: 1, name: 'Classic Denim Jacket', stock: 3 },
          { _id: 2, name: 'Premium Cotton Shirt', stock: 5 },
        ]
      });
      
      setChartData([
        { date: 'Mon', sales: 1200, orders: 8 },
        { date: 'Tue', sales: 1900, orders: 12 },
        { date: 'Wed', sales: 1500, orders: 10 },
        { date: 'Thu', sales: 2100, orders: 15 },
        { date: 'Fri', sales: 2500, orders: 18 },
        { date: 'Sat', sales: 1800, orders: 11 },
        { date: 'Sun', sales: 1400, orders: 9 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#c6a43f', '#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0'];
  
  const categoryData = [
    { name: 'Women', value: 45, color: '#c6a43f' },
    { name: 'Men', value: 35, color: '#4caf50' },
    { name: 'Jewelry', value: 12, color: '#2196f3' },
    { name: 'Accessories', value: 8, color: '#ff9800' },
  ];

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <FaHourglassHalf />;
      case 'processing': return <FaChartLine />;
      case 'shipped': return <FaTruck />;
      case 'delivered': return <FaCheckCircle />;
      case 'cancelled': return <FaTimesCircle />;
      default: return <FaShoppingBag />;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge ${status}`;
  };

  const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon" style={{ background: `${color}15`, color: color }}>
        {icon}
      </div>
      <div className="stat-info">
        <h3>{typeof value === 'number' ? value.toLocaleString() : value}</h3>
        <p>{title}</p>
        {trend && (
          <span className={`trend ${trend === 'up' ? 'positive' : 'negative'}`}>
            {trend === 'up' ? <FaArrowUp /> : <FaArrowDown />}
            {trendValue}%
          </span>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
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
          <h2>Dashboard</h2>
          <div className="mobile-header-spacer"></div>
        </div>

        <div className="admin-dashboard-container">
          {/* Header */}
          <div className="dashboard-header">
            <div className="header-left">
              <div className="header-icon">
                <FaChartLine size={24} />
              </div>
              <div className="header-text">
                <h1>Dashboard</h1>
                <p>Welcome back, {userInfo?.name}</p>
              </div>
            </div>
            <div className="header-right">
              <div className="date-range">
                <button 
                  className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('week')}
                >
                  Week
                </button>
                <button 
                  className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('month')}
                >
                  Month
                </button>
                <button 
                  className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('year')}
                >
                  Year
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <div className="stats-grid">
            <StatCard 
              title="Total Revenue" 
              value={`£${stats.totalSales.toLocaleString()}`} 
              icon={<FaDollarSign />} 
              color="#c6a43f"
              trend="up"
              trendValue="12"
            />
            <StatCard 
              title="Total Orders" 
              value={stats.totalOrders} 
              icon={<FaShoppingBag />} 
              color="#2196f3"
              trend="up"
              trendValue="8"
            />
            <StatCard 
              title="Pending Orders" 
              value={stats.pendingOrders} 
              icon={<FaHourglassHalf />} 
              color="#ff9800"
            />
            <StatCard 
              title="Processing" 
              value={stats.processingOrders} 
              icon={<FaChartLine />} 
              color="#9c27b0"
            />
            <StatCard 
              title="Shipped" 
              value={stats.shippedOrders || 0} 
              icon={<FaTruck />} 
              color="#00bcd4"
            />
            <StatCard 
              title="Delivered" 
              value={stats.deliveredOrders} 
              icon={<FaCheckCircle />} 
              color="#4caf50"
            />
            <StatCard 
              title="Cancelled" 
              value={stats.cancelledOrders || 0} 
              icon={<FaTimesCircle />} 
              color="#f44336"
            />
            <StatCard 
              title="Total Products" 
              value={stats.totalProducts} 
              icon={<FaBoxes />} 
              color="#795548"
            />
            <StatCard 
              title="Total Users" 
              value={stats.totalUsers} 
              icon={<FaUsers />} 
              color="#607d8b"
            />
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            <div className="chart-card">
              <div className="chart-header">
                <h3>Sales Overview</h3>
                <div className="chart-legend">
                  <span><span className="legend-dot sales"></span> Sales (£)</span>
                  <span><span className="legend-dot orders"></span> Orders</span>
                </div>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#999" />
                    <YAxis yAxisId="left" stroke="#999" />
                    <YAxis yAxisId="right" orientation="right" stroke="#999" />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                    />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#c6a43f" 
                      name="Sales (£)" 
                      strokeWidth={2}
                      dot={{ fill: '#c6a43f', strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="orders" 
                      stroke="#2196f3" 
                      name="Orders" 
                      strokeWidth={2}
                      dot={{ fill: '#2196f3', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="chart-card">
              <h3>Products by Category</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Two Columns Layout */}
          <div className="two-columns">
            {/* Recent Orders */}
            <div className="recent-orders-card">
              <div className="card-header">
                <h3>📋 Recent Orders</h3>
                <button className="view-all-btn" onClick={() => navigate('/admin/orders')}>
                  View All →
                </button>
              </div>
              <div className="table-responsive">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.slice(0, 5).map((order) => (
                      <tr key={order._id}>
                        <td className="order-id">#{order._id.slice(-6)}</td>
                        <td>{order.user?.name || 'Guest'}</td>
                        <td className="amount">£{order.totalPrice}</td>
                        <td>
                          <span className={getStatusClass(order.status)}>
                            {getStatusIcon(order.status)} {order.status}
                          </span>
                        </td>
                        <td className="date">{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {stats.recentOrders.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center' }}>No orders found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Low Stock Alerts */}
            <div className="low-stock-card">
              <div className="card-header">
                <h3>⚠️ Low Stock Alert</h3>
                <button className="view-all-btn" onClick={() => navigate('/admin/products')}>
                  Manage Stock →
                </button>
              </div>
              <div className="stock-list">
                {stats.lowStockProducts?.length > 0 ? (
                  stats.lowStockProducts.map((product) => (
                    <div key={product._id} className="stock-item">
                      <div className="stock-info">
                        <span className="product-name">{product.name}</span>
                        <span className="stock-count critical">{product.stock} left</span>
                      </div>
                      <div className="stock-bar">
                        <div className="stock-fill" style={{ width: `${(product.stock / 50) * 100}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-stock">
                    <span>✅</span>
                    <p>All products have sufficient stock</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions-card">
            <h3>⚡ Quick Actions</h3>
            <div className="action-grid">
              <button className="action-btn primary" onClick={() => navigate('/admin/add-product')}>
                <FaPlus /> Add New Product
              </button>
              <button className="action-btn secondary" onClick={() => navigate('/admin/orders')}>
                <FaShoppingBag /> Manage Orders
              </button>
              <button className="action-btn secondary" onClick={() => navigate('/admin/products')}>
                <FaEdit /> Edit Products
              </button>
              <button className="action-btn secondary" onClick={() => navigate('/admin/control-user')}>
                <FaUsers /> Manage Users
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;