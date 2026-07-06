// src/Component/Pages/admin/AdminSidebar.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { logout } from '../../../redux/slices/authSlice';
import logo from './../../../assets/Images/logo.jpeg';
import {
  LayoutDashboard,
  Package,
  Plus,
  ShoppingCart,
  Users,
  LogOut,
  Settings,
  ChartLine,
  Tag,
  Star,
  UserCircle,
  Key,
  X,
  Video,
  Menu
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingOrders: 0,
  });

  // Check if screen is mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 991;
      setIsMobile(mobile);
      // Auto-close mobile menu when resizing to desktop
      if (!mobile && isMobileMenuOpen && setIsMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && isMobile && setIsMobileMenuOpen) {
        const sidebar = document.querySelector('.admin-sidebar');
        const menuBtn = document.querySelector('.menu-toggle-btn');
        if (sidebar && !sidebar.contains(event.target) && !menuBtn?.contains(event.target)) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, isMobile, setIsMobileMenuOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen, isMobile]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = userInfo?.token || localStorage.getItem('token');
        if (!token) return;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:5000/api/admin/stats', config);
        setStats({
          totalOrders: response.data.totalOrders || 0,
          totalProducts: response.data.totalProducts || 0,
          totalUsers: response.data.totalUsers || 0,
          pendingOrders: response.data.pendingOrders || 0,
        });
      } catch {
        /* keep defaults */
      }
    };
    fetchStats();
  }, [userInfo?.token]);

  const mainNav = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/products', name: 'All Products', icon: <Package size={20} />, badge: stats.totalProducts || null },
    { path: '/admin/add-product', name: 'Add Product', icon: <Plus size={20} /> },
    { path: '/admin/orders', name: 'Orders', icon: <ShoppingCart size={20} />, badge: stats.pendingOrders || null },
    { path: '/admin/control-user', name: 'Customers', icon: <Users size={20} />, badge: stats.totalUsers || null },
  ];

  const secondaryNav = [
    { path: '/admin/discounts', name: 'Discounts', icon: <Tag size={20} /> },
    { path: '/admin/reports', name: 'Reports', icon: <ChartLine size={20} /> },
    // ✅ Reviews path — properly set
    { path: '/admin/reviews', name: 'Reviews', icon: <Star size={20} /> },
    { path: '/admin/tiktok', name: 'TikTok Videos', icon: <Video size={20} /> },
    { path: '/admin/settings', name: 'Settings', icon: <Settings size={20} /> },
  ];

  // ✅ Updated isActive function — better matching
  const isActive = (path) => {
    // Exact match
    if (location.pathname === path) return true;
    
    // For nested routes (e.g., /admin/reviews/123)
    if (path !== '/admin/dashboard' && location.pathname.startsWith(path)) return true;
    
    return false;
  };

  // ✅ Updated logout handler
  const handleLogout = async () => {
    try {
      // Dispatch logout action to clear Redux state
      await dispatch(logout());
      
      // Clear any stored tokens/cookies if needed
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      sessionStorage.clear();
      
      // Close mobile menu
      if (isMobile && setIsMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
      
      // Navigate to login page
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, force navigation to login
      navigate('/login', { replace: true });
    }
  };

  // Handle link click - close mobile menu
  const handleLinkClick = () => {
    if (isMobile && setIsMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const renderSection = (title, items) => (
    <div className="nav-section">
      {!isCollapsed && <h3 className="nav-section-title">{title}</h3>}
      <div className="nav-items">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={handleLinkClick}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && (
              <>
                <span className="nav-name">{item.name}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </>
            )}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'open' : ''}`}>
      {/* Mobile Close Button */}
      {isMobile && isMobileMenuOpen && (
        <button
          type="button"
          className="mobile-close-btn-sidebar"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={24} />
        </button>
      )}

      <button
        type="button"
        className="sidebar-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      <div className="sidebar-logo">
        <Link to="/" className="sidebar-logo-link" onClick={handleLinkClick}>
          <span className="sidebar-emblem-wrap">
            <img 
              src={logo} 
              alt="QASR-E-LIBAS Ltd" 
              className="sidebar-emblem" 
            />
          </span>
          {!isCollapsed && (
            <div className="logo-text">
              <h2>QASR-E-LIBAS Ltd</h2>
              <p>Admin Workspace</p>
            </div>
          )}
        </Link>
      </div>

      <div className="sidebar-profile">
        <div className="profile-avatar">
          <UserCircle size={40} />
        </div>
        {!isCollapsed && (
          <div className="profile-info">
            <h4>{userInfo?.name || 'Administrator'}</h4>
            <p>{userInfo?.email || 'info@qasrelibas.co.uk'}</p>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {renderSection('Overview', mainNav.slice(0, 1))}
        {renderSection('Inventory', mainNav.slice(1, 3))}
        {renderSection('Operations', mainNav.slice(3))}
        {renderSection('System', secondaryNav)}
      </nav>

      <div className="sidebar-footer">
        <button type="button" onClick={handleLogout} className="logout-btn">
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;