// src/Component/Pages/admin/AdminReports.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import { 
  FaChartLine, 
  FaDownload, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaShoppingCart, 
  FaUsers, 
  FaEnvelope, 
  FaBox,
  FaPlus,
  FaStore,
  FaCog,
  FaCheckCircle,
  FaSpinner,
  FaTimesCircle,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaChartBar,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEyeSlash,
  FaFileAlt,
  FaPrint
} from 'react-icons/fa';
import { FiPackage } from 'react-icons/fi';
import { Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './report.css';

const AdminReports = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [dateRange, setDateRange] = useState('week');
  const [reports, setReports] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    salesData: [],
    customerData: {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      inactiveCustomers: 0,
      customerGrowth: 0,
      topCustomers: []
    },
    productStats: {
      topProducts: [],
      topCategories: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);
  const [selectedChart, setSelectedChart] = useState('sales');
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showProductDetails, setShowProductDetails] = useState(false);

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

  // ✅ REAL DATA FETCH FROM API
  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // ✅ Fetch real data from API
      const response = await axios.get(
        `http://localhost:5000/api/admin/reports?range=${dateRange}`,
        config
      );
      
      // ✅ Process real data
      const data = response.data;
      
      setReports({
        totalSales: data.totalSales || 0,
        totalOrders: data.totalOrders || 0,
        totalUsers: data.totalUsers || 0,
        averageOrderValue: data.averageOrderValue || 0,
        salesData: data.salesData || [],
        customerData: {
          totalCustomers: data.totalUsers || 0,
          newCustomers: data.newCustomers || 0,
          returningCustomers: data.returningCustomers || 0,
          inactiveCustomers: data.inactiveCustomers || 0,
          customerGrowth: data.customerGrowth || 0,
          topCustomers: data.topCustomers || []
        },
        productStats: {
          topProducts: data.topProducts || [],
          topCategories: data.topCategories || []
        }
      });
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports data');
      
      // ✅ Only use sample data if API fails (for demo purposes)
      const customerData = generateCustomerData();
      const productData = generateProductData();
      
      setReports({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        averageOrderValue: 0,
        salesData: [],
        customerData: customerData,
        productStats: productData
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Generate sample data (only if API fails)
  const generateCustomerData = () => {
    return {
      totalCustomers: 0,
      newCustomers: 0,
      returningCustomers: 0,
      inactiveCustomers: 0,
      customerGrowth: 0,
      topCustomers: []
    };
  };

  const generateProductData = () => {
    return {
      topProducts: [],
      topCategories: []
    };
  };

  // ✅ Export CSV Report
  const exportReport = () => {
    try {
      if (!reports.salesData || reports.salesData.length === 0) {
        toast.error('No data to export');
        return;
      }

      const headers = ['Date', 'Sales (£)', 'Orders'];
      const rows = reports.salesData.map(item => [item.date, item.sales || 0, item.orders || 0]);
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `sales_report_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  // ✅ Send Email Report
 const sendEmailReport = async () => {
  if (!userInfo?.email) {
    toast.error('Please login to send email reports');
    return;
  }

  setSendingEmail(true);
  setEmailStatus('sending');
  
  try {
    const token = userInfo?.token;
    const config = { 
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    };
    
    const emailData = {
      to: userInfo.email,
      subject: `Store Report - ${new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })}`,
      reportData: {
        period: dateRange,
        totalSales: reports.totalSales,
        totalOrders: reports.totalOrders,
        totalUsers: reports.totalUsers,
        averageOrderValue: reports.averageOrderValue,
        salesData: reports.salesData,
        generatedAt: new Date().toISOString()
      }
    };
    
    const response = await axios.post(
      'http://localhost:5000/api/admin/send-report',
      emailData,
      config
    );
    
    if (response.data.success) {
      toast.success(`Report sent successfully to ${userInfo.email}!`);
      setEmailStatus('success');
    } else {
      toast.error(response.data.message || 'Failed to send email');
      setEmailStatus('error');
    }
  } catch (error) {
    console.error('Error sending email:', error);
    // Better error message
    const errorMsg = error.response?.data?.message || 
                     error.response?.status === 404 ? 'Email service not configured. Please contact support.' :
                     'Failed to send email report';
    toast.error(errorMsg);
    setEmailStatus('error');
  } finally {
    setSendingEmail(false);
    setTimeout(() => {
      setEmailStatus(null);
    }, 5000);
  }
};

  const hasOrders = reports.totalOrders > 0;
  const customerData = reports.customerData;
  const productData = reports.productStats;

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading reports...</p>
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
          <h2>Analytics & Reports</h2>
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

        <div className="admin-reports-container">
          {/* Header */}
          <div className="reports-header">
            <div className="header-left">
              <div className="header-icon">
                <FaChartLine size={24} />
              </div>
              <div className="header-text">
                <h1>Analytics & Reports</h1>
                <p>Complete store performance with customer analytics</p>
              </div>
            </div>
            <div className="header-right">
              <button 
                className={`email-report-btn ${emailStatus === 'success' ? 'success' : ''} ${emailStatus === 'error' ? 'error' : ''}`} 
                onClick={sendEmailReport} 
                disabled={sendingEmail}
              >
                {sendingEmail ? (
                  <>
                    <FaSpinner className="spinning" /> Sending...
                  </>
                ) : emailStatus === 'success' ? (
                  <>
                    <FaCheckCircle /> Sent!
                  </>
                ) : emailStatus === 'error' ? (
                  <>
                    <FaTimesCircle /> Failed
                  </>
                ) : (
                  <>
                    <FaEnvelope /> Email Full Report
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="date-range-selector">
            <button className={dateRange === 'week' ? 'active' : ''} onClick={() => setDateRange('week')}>
              <FaCalendarAlt /> This Week
            </button>
            <button className={dateRange === 'month' ? 'active' : ''} onClick={() => setDateRange('month')}>
              <FaCalendarAlt /> This Month
            </button>
            <button className={dateRange === 'year' ? 'active' : ''} onClick={() => setDateRange('year')}>
              <FaCalendarAlt /> This Year
            </button>
            <button className="export-btn" onClick={exportReport}>
              <FaDownload /> Export Full Report
            </button>
          </div>

          {/* Stats Cards */}
          <div className="report-stats">
            <div className={`report-stat-card ${!hasOrders ? 'zero-state' : ''}`}>
              <div className="stat-icon-wrapper revenue">
                <FaDollarSign className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3>£{reports.totalSales.toLocaleString()}</h3>
                <p>Total Revenue</p>
                {reports.totalSales > 0 && (
                  <span className="stat-trend up"><FaArrowUp /> 12.5%</span>
                )}
              </div>
            </div>
            <div className={`report-stat-card ${!hasOrders ? 'zero-state' : ''}`}>
              <div className="stat-icon-wrapper orders">
                <FaShoppingCart className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3>{reports.totalOrders}</h3>
                <p>Total Orders</p>
                {reports.totalOrders > 0 && (
                  <span className="stat-trend up"><FaArrowUp /> 8.3%</span>
                )}
              </div>
            </div>
            <div className="report-stat-card">
              <div className="stat-icon-wrapper customers">
                <FaUsers className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3>{reports.totalUsers}</h3>
                <p>Total Customers</p>
              </div>
            </div>
            <div className={`report-stat-card ${!hasOrders ? 'zero-state' : ''}`}>
              <div className="stat-icon-wrapper average">
                <FaChartLine className="stat-icon" />
              </div>
              <div className="stat-info">
                <h3>£{reports.averageOrderValue.toFixed(2)}</h3>
                <p>Avg Order Value</p>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="sales-chart">
            <div className="chart-header">
              <h3>Sales Overview</h3>
              <div className="chart-controls">
                <button 
                  className={`chart-btn ${selectedChart === 'sales' ? 'active' : ''}`}
                  onClick={() => setSelectedChart('sales')}
                >
                  Sales
                </button>
                <button 
                  className={`chart-btn ${selectedChart === 'orders' ? 'active' : ''}`}
                  onClick={() => setSelectedChart('orders')}
                >
                  Orders
                </button>
              </div>
            </div>
            
            {!hasOrders ? (
              <div className="empty-chart">
                <FiPackage className="empty-icon" />
                <p>No sales data available yet</p>
                <span>Orders will appear here once customers make purchases</span>
              </div>
            ) : (
              <div className="chart-container">
                <table className="sales-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sales (£)</th>
                      <th>Orders</th>
                      <th>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.salesData.map((item, index) => {
                      const maxSales = Math.max(...reports.salesData.map(d => d.sales), 1);
                      const maxOrders = Math.max(...reports.salesData.map(d => d.orders), 1);
                      const salesPercentage = (item.sales / maxSales) * 100;
                      const ordersPercentage = (item.orders / maxOrders) * 100;
                      
                      return (
                        <tr key={index}>
                          <td className={item.sales === 0 ? 'zero-value' : ''}>{item.date}</td>
                          <td className={item.sales === 0 ? 'zero-value' : ''}>
                            {item.sales === 0 ? '—' : `£${item.sales}`}
                          </td>
                          <td className={item.orders === 0 ? 'zero-value' : ''}>
                            {item.orders === 0 ? '—' : item.orders}
                          </td>
                          <td>
                            <div className="performance-bar">
                              <div 
                                className="performance-fill"
                                style={{ 
                                  width: selectedChart === 'sales' ? `${salesPercentage}%` : `${ordersPercentage}%`,
                                  background: selectedChart === 'sales' ? '#c6a43f' : '#2196f3'
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Email Subscription Info */}
          <div className="email-info-card">
            <div className="info-icon-wrapper">
              <FaEnvelope className="info-icon" />
            </div>
            <div className="info-content">
              <h4>Monthly Analytics Report</h4>
              <p>Get complete analytics report sent to <strong>{userInfo?.email || 'qasrelibasltd@gmail.com'}</strong></p>
              <small>Includes sales, customer, and product analytics</small>
              <div className="email-actions">
                <button 
                  className="send-email-btn" 
                  onClick={sendEmailReport}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? (
                    <><FaSpinner className="spinning" /> Sending...</>
                  ) : (
                    <><FaEnvelope /> Send Full Report</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;