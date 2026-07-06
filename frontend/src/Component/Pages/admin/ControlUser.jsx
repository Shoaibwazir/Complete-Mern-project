import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { 
  Eye, 
  Crown, 
  Trash2, 
  Lock, 
  User, 
  Shield, 
  Phone, 
  Calendar,
  ShoppingBag,
  Search,
  Users,
  Filter,
  Mail,
  Menu,
  X
} from 'lucide-react';
import AdminSidebar from './../admin/AdminSidebar';
import './ControlUser.css';

const ControlUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);

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
    fetchUsers(); 
  }, []);

  const fetchUsers = async () => {
    try {
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get('http://localhost:5000/api/admin/users', config);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Sample data for testing
      setUsers([
        { _id: 1, name: 'Super Admin', email: 'admin@fancyimpress.com', isAdmin: true, createdAt: new Date(), phone: '03082575890', orders: 0 },
        { _id: 2, name: 'Shoaib Ur Rehman', email: 'shoaibrehman513@gmail.com', isAdmin: false, createdAt: new Date('2024-04-24'), phone: '03082575890', orders: 0 },
        { _id: 3, name: 'John Doe', email: 'john@example.com', isAdmin: false, createdAt: new Date('2024-04-20'), phone: '+44 7123 456789', orders: 12 },
        { _id: 4, name: 'Sarah Khan', email: 'sarah@example.com', isAdmin: false, createdAt: new Date('2024-04-15'), phone: '+44 7987 654321', orders: 8 },
      ]);
    } finally { 
      setLoading(false); 
    }
  };

  const toggleAdminStatus = async (userId, currentStatus) => {
    try {
      const token = userInfo?.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`http://localhost:5000/api/admin/users/${userId}`, { isAdmin: !currentStatus }, config);
      fetchUsers();
      alert(`User admin status updated successfully!`);
    } catch (error) { 
      console.error('Error updating user:', error);
      alert('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const token = userInfo?.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, config);
        fetchUsers();
        alert('User deleted successfully!');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || 
                       (filterRole === 'admin' && user.isAdmin) ||
                       (filterRole === 'user' && !user.isAdmin);
    return matchesSearch && matchesRole;
  });

  // Statistics
  const totalUsers = users.length;
  const adminCount = users.filter(u => u.isAdmin).length;
  const userCount = totalUsers - adminCount;
  const totalOrders = users.reduce((sum, u) => sum + (u.orders || 0), 0);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
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
          <h2>User Management</h2>
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

        <div className="admin-users-container">
          {/* Header */}
          <div className="users-header">
            <div className="header-left">
              <div className="header-icon">
                <Users size={24} />
              </div>
              <div className="header-text">
                <h1>User Management</h1>
                <p>Manage and control all user accounts</p>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="stats-grid">
            <div className="stat-card total">
              <div className="stat-icon"><Users size={20} /></div>
              <div className="stat-info">
                <h3>{totalUsers}</h3>
                <p>Total Users</p>
              </div>
            </div>
            <div className="stat-card admin">
              <div className="stat-icon"><Shield size={20} /></div>
              <div className="stat-info">
                <h3>{adminCount}</h3>
                <p>Admins</p>
              </div>
            </div>
            <div className="stat-card user">
              <div className="stat-icon"><User size={20} /></div>
              <div className="stat-info">
                <h3>{userCount}</h3>
                <p>Customers</p>
              </div>
            </div>
            <div className="stat-card orders">
              <div className="stat-icon"><ShoppingBag size={20} /></div>
              <div className="stat-info">
                <h3>{totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="user-controls-bar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button 
                className={`filter-chip ${filterRole === 'all' ? 'active' : ''}`}
                onClick={() => setFilterRole('all')}
              >
                <Filter size={14} /> All <span className="count">{totalUsers}</span>
              </button>
              <button 
                className={`filter-chip ${filterRole === 'admin' ? 'active' : ''}`}
                onClick={() => setFilterRole('admin')}
              >
                <Shield size={14} /> Admins <span className="count">{adminCount}</span>
              </button>
              <button 
                className={`filter-chip ${filterRole === 'user' ? 'active' : ''}`}
                onClick={() => setFilterRole('user')}
              >
                <User size={14} /> Users <span className="count">{userCount}</span>
              </button>
            </div>
          </div>

          {/* Users Grid */}
          <div className="users-grid">
            {filteredUsers.map((user, index) => (
              <div key={user._id} className="user-card" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="user-info-section">
                  <div className="user-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </div>
                </div>
                
                <div className="user-meta">
                  <div className="contact-info">
                    <Phone size={14} />
                    <span>{user.phone || '07460816860'}</span>
                  </div>
                  
                  <div className="orders-info">
                    <ShoppingBag size={14} />
                    <div className="order-count">
                      {user.orders || 0}
                      <span>orders</span>
                    </div>
                  </div>
                  
                  <div className={`role-badge ${user.isAdmin ? 'admin' : 'user'}`}>
                    {user.isAdmin ? <Shield size={14} /> : <User size={14} />}
                    {user.isAdmin ? 'Admin' : 'User'}
                  </div>
                  
                  <div className="join-date">
                    <Calendar size={14} />
                    <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="action-buttons-group">
                  <button 
                    className="action-btn view"
                    title="View Details"
                    onClick={() => alert(`User Details:\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone || 'N/A'}\nOrders: ${user.orders || 0}`)}
                  >
                    <Eye size={18} />
                  </button>
                  {!user.isAdmin && (
                    <button 
                      className="action-btn make-admin"
                      onClick={() => toggleAdminStatus(user._id, user.isAdmin)}
                      title="Make Admin"
                    >
                      <Crown size={18} />
                    </button>
                  )}
                  {!user.isAdmin && (
                    <button 
                      className="action-btn delete"
                      onClick={() => deleteUser(user._id)}
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                  {user.isAdmin && user.email === 'admin@fancyimpress.com' && (
                    <button className="action-btn locked" disabled title="Super Admin cannot be modified">
                      <Lock size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="no-data">
              <Users size={64} />
              <p>No users found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ControlUser;