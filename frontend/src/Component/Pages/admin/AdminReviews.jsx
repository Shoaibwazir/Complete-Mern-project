// src/Component/Pages/admin/AdminReviews.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { 
  FaStar, 
  FaTrashAlt, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUser,
  FaBox,
  FaCalendarAlt,
  FaStarHalfAlt,
  FaRegStar,
  FaSpinner,
  FaSearch,
  FaEye,
  FaBell
} from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import { 
  fetchAllReviews, 
  updateReviewStatus, 
  deleteReview,
  selectAllReviews,
  selectReviewsStats,
  selectReviewsLoading,
  selectReviewsError,
} from './../../../redux/slices/reviewSlice';
import toast from 'react-hot-toast';
import './AdminReviews.css';

const AdminReviews = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  // ✅ Use selectors
  const allReviews = useSelector(selectAllReviews);
  const stats = useSelector(selectReviewsStats);
  const loading = useSelector(selectReviewsLoading);
  const error = useSelector(selectReviewsError);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  // ✅ Use ref to prevent multiple fetches
  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  // 🔧 FIX: Pehle ye 'token' naam ki galat localStorage key check kar raha tha,
  // jo app mein kabhi save hi nahi hoti (asal key 'userInfo' hai). Isi wajah se
  // ye hamesha false aata tha aur turant /login pe redirect kar deta tha,
  // jahan se LoginPage wapas /admin/dashboard pe bounce kar deta tha.
  // Ab hum seedha Redux ke userInfo state pe check karte hain — jo already
  // PrivateRoute mein verify ho chuka hota hai.
  useEffect(() => {
    if (!userInfo) {
      toast.error('Please login first');
      navigate('/login', { replace: true });
    }
    
    // ✅ Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [navigate, userInfo]); // 🔧 FIX: userInfo ko dependency mein add kiya

  // ✅ Fetch reviews — ONLY ONCE
  useEffect(() => {
    // ✅ Prevent multiple fetches
    if (hasFetched.current) {
      console.log('⏳ Already fetched, skipping...');
      return;
    }
    
    // 🔧 FIX: Yahan bhi wahi galat 'token' localStorage key check ho rahi thi.
    // Ab userInfo (Redux) se check kar rahe hain.
    if (!userInfo) {
      console.log('⏳ No user, skipping fetch...');
      return;
    }

    console.log('📡 Fetching reviews (first time)...');
    hasFetched.current = true;
    
    dispatch(fetchAllReviews())
      .unwrap()
      .then((result) => {
        if (isMounted.current) {
          console.log('✅ Reviews loaded:', result);
        }
      })
      .catch((err) => {
        if (isMounted.current) {
          console.error('❌ Error loading reviews:', err);
          toast.error(err?.message || 'Failed to load reviews');
        }
      });
      
  }, [dispatch, userInfo]); // 🔧 FIX: userInfo ko dependency mein add kiya

  // ✅ Update local state when reviews change
  useEffect(() => {
    if (allReviews && allReviews.length > 0) {
      setReviews(allReviews);
      setFilteredReviews(allReviews);
    } else if (allReviews && allReviews.length === 0) {
      setReviews([]);
      setFilteredReviews([]);
    }
  }, [allReviews]);

  // ✅ Filter reviews
  useEffect(() => {
    let filtered = [...reviews];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.product?.name?.toLowerCase().includes(term) ||
        r.user?.name?.toLowerCase().includes(term) ||
        r.comment?.toLowerCase().includes(term)
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }
    
    if (ratingFilter !== 'all') {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter(r => Math.floor(r.rating) === rating);
    }
    
    setFilteredReviews(filtered);
  }, [reviews, searchTerm, statusFilter, ratingFilter]);

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

  // ✅ Refresh reviews function
  const refreshReviews = () => {
    hasFetched.current = false;
    dispatch(fetchAllReviews())
      .unwrap()
      .then((result) => {
        console.log('✅ Reviews refreshed:', result);
        toast.success('Reviews refreshed!');
      })
      .catch((err) => {
        console.error('❌ Error refreshing reviews:', err);
        toast.error(err?.message || 'Failed to refresh reviews');
      });
  };

  // ✅ Approve Review
  const handleApprove = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const result = await dispatch(updateReviewStatus({ 
        id, 
        status: 'approved' 
      })).unwrap();
      
      toast.success('✅ Review approved successfully!');
      showNotificationToast(`Review approved for ${result.review?.product?.name || 'product'}`);
      refreshReviews();
      
    } catch (err) {
      console.error('❌ Approve error:', err);
      toast.error(err?.message || 'Failed to approve review');
    }
  };

  // ✅ Reject Review
  const handleReject = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await dispatch(updateReviewStatus({ 
        id, 
        status: 'rejected' 
      })).unwrap();
      
      toast.success('❌ Review rejected');
      refreshReviews();
      
    } catch (err) {
      console.error('❌ Reject error:', err);
      toast.error(err?.message || 'Failed to reject review');
    }
  };

  // ✅ Delete Review
  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to permanently delete this review?')) {
      return;
    }
    
    try {
      await dispatch(deleteReview(id)).unwrap();
      toast.success('🗑️ Review deleted successfully');
      refreshReviews();
      
    } catch (err) {
      console.error('❌ Delete error:', err);
      toast.error(err?.message || 'Failed to delete review');
    }
  };

  // ✅ View Review Details
  const handleViewReview = (e, review) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedReview(review);
    toast.info(`Viewing review for ${review.product?.name || 'product'}`);
  };

  // ✅ Show notification toast
  const showNotificationToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // ✅ Handle row click
  const handleRowClick = (e, review) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedReview(review);
  };

  // ✅ Render stars for rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="star-filled" />);
    }
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star-filled" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FaRegStar key={i} className="star-empty" />);
    }
    return stars;
  };

  // ✅ Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge approved"><FaCheckCircle /> Approved</span>;
      case 'pending':
        return <span className="status-badge pending"><FaTimesCircle /> Pending</span>;
      case 'rejected':
        return <span className="status-badge rejected"><FaTimesCircle /> Rejected</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  // ✅ Stats calculation
  const statsData = {
    total: reviews.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    avgRating: reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : 0,
    distribution: (() => {
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(r => {
        const rating = Math.floor(r.rating || 0);
        if (rating >= 1 && rating <= 5) {
          dist[rating] = (dist[rating] || 0) + 1;
        }
      });
      return dist;
    })()
  };

  // ✅ Loading state
  if (loading && reviews.length === 0 && !error) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="loading-spinner">
            <FaSpinner className="spinning" size={48} />
            <p>Loading reviews...</p>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error state
  if (error && !loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-content">
          <div className="error-container">
            <FaTimesCircle size={48} className="error-icon" />
            <h3>Failed to Load Reviews</h3>
            <p>{typeof error === 'string' ? error : error?.message || 'Unknown error'}</p>
            <button onClick={refreshReviews} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <h2>Customer Reviews</h2>
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

        {/* Notification Banner */}
        {showNotification && (
          <div className="notification-banner">
            <FaBell className="notification-icon" />
            <span>{notificationMessage}</span>
            <button onClick={() => setShowNotification(false)}>
              <X size={16} />
            </button>
          </div>
        )}

        <div className="admin-reviews-container">
          {/* Header */}
          <div className="reviews-header">
            <div className="header-left">
              <div className="header-icon">
                <FaStar size={24} />
              </div>
              <div className="header-text">
                <h1>Customer Reviews</h1>
                <p>Manage and moderate customer product reviews</p>
              </div>
            </div>
            <div className="header-right">
              <button onClick={refreshReviews} className="refresh-btn" title="Refresh Reviews">
                <FaSpinner className={loading ? 'spinning' : ''} size={16} />
                Refresh
              </button>
              <span className="total-reviews-badge">
                {statsData.total} Total Reviews
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="reviews-stats">
            <div className="stat-card total">
              <div className="stat-icon"><FaStar size={20} /></div>
              <div className="stat-info">
                <h3>{statsData.total}</h3>
                <p>Total Reviews</p>
              </div>
            </div>
            <div className="stat-card approved">
              <div className="stat-icon"><FaCheckCircle size={20} /></div>
              <div className="stat-info">
                <h3>{statsData.approved}</h3>
                <p>Approved</p>
              </div>
            </div>
            <div className="stat-card pending">
              <div className="stat-icon"><FaTimesCircle size={20} /></div>
              <div className="stat-info">
                <h3>{statsData.pending}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card rejected">
              <div className="stat-icon"><FaTimesCircle size={20} /></div>
              <div className="stat-info">
                <h3>{statsData.rejected}</h3>
                <p>Rejected</p>
              </div>
            </div>
            <div className="stat-card rating">
              <div className="stat-icon"><FaStar size={20} /></div>
              <div className="stat-info">
                <h3>{statsData.avgRating}</h3>
                <p>Avg Rating</p>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="rating-distribution">
            <h4>Rating Distribution</h4>
            <div className="distribution-bars">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = statsData.distribution[rating] || 0;
                const percentage = reviews.length > 0 
                  ? Math.round((count / reviews.length) * 100) 
                  : 0;
                return (
                  <div key={rating} className="distribution-bar">
                    <span className="rating-label">
                      {rating} <FaStar size={12} />
                    </span>
                    <div className="bar-track">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="reviews-filters">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by product, customer, or review..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="approved">✅ Approved</option>
                <option value="pending">⏳ Pending</option>
                <option value="rejected">❌ Rejected</option>
              </select>
              <select 
                value={ratingFilter} 
                onChange={(e) => setRatingFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Ratings</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="1">⭐ 1 Star</option>
              </select>
            </div>
          </div>

          {/* Reviews Table */}
          <div className="reviews-table-container">
            {loading && (
              <div className="loading-overlay">
                <FaSpinner className="spinning" size={32} />
                <span>Updating...</span>
              </div>
            )}
            
            <div className="table-responsive">
              <table className="reviews-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Rating</th>
                    <th>Review</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReviews.map((review) => (
                    <tr 
                      key={review._id || review.id}
                      onClick={(e) => handleRowClick(e, review)}
                      className="review-row"
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div className="product-info">
                          {review.product?.images?.[0]?.url ? (
                            <img 
                              src={review.product.images[0].url} 
                              alt={review.product.name}
                              className="product-thumb"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <FaBox className="product-icon" />
                          )}
                          <span className="product-name">
                            {review.product?.name || 'Unknown Product'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="customer-info">
                          {review.user?.profileImage ? (
                            <img 
                              src={review.user.profileImage} 
                              alt={review.user.name}
                              className="customer-avatar"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <FaUser className="customer-icon" />
                          )}
                          <span>{review.user?.name || 'Anonymous'}</span>
                        </div>
                      </td>
                      <td className="rating-stars" onClick={(e) => e.stopPropagation()}>
                        {renderStars(review.rating)}
                        <span className="rating-number">{review.rating}</span>
                      </td>
                      <td className="review-comment" onClick={(e) => e.stopPropagation()}>
                        <div className="comment-text">{review.comment}</div>
                      </td>
                      <td className="review-date" onClick={(e) => e.stopPropagation()}>
                        <FaCalendarAlt className="date-icon" />
                        {new Date(review.createdAt || review.date).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        {getStatusBadge(review.status)}
                      </td>
                      <td>
                        <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                          {review.status === 'pending' && (
                            <>
                              <button 
                                className="action-btn approve" 
                                onClick={(e) => handleApprove(e, review._id || review.id)}
                                title="Approve Review"
                                disabled={loading}
                              >
                                <FaCheckCircle /> Approve
                              </button>
                              <button 
                                className="action-btn reject" 
                                onClick={(e) => handleReject(e, review._id || review.id)}
                                title="Reject Review"
                                disabled={loading}
                              >
                                <FaTimesCircle /> Reject
                              </button>
                            </>
                          )}
                          {review.status === 'approved' && (
                            <button 
                              className="action-btn view" 
                              onClick={(e) => handleViewReview(e, review)}
                              title="View Review"
                            >
                              <FaEye /> View
                            </button>
                          )}
                          <button 
                            className="action-btn delete" 
                            onClick={(e) => handleDelete(e, review._id || review.id)}
                            title="Delete Review"
                            disabled={loading}
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

            {filteredReviews.length === 0 && !loading && (
              <div className="no-reviews">
                <FaStar className="no-icon" />
                <h3>No Reviews Found</h3>
                <p>
                  {searchTerm || statusFilter !== 'all' || ratingFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Customer reviews will appear here once they are submitted'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;