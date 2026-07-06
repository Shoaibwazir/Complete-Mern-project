// AdminProducts.js - Updated with proper sidebar integration

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  FaEdit, 
  FaTrashAlt, 
  FaPlus, 
  FaSearch, 
  FaFilter,
  FaEye,
  FaCopy,
  FaArchive,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaTimes
} from 'react-icons/fa';
import { Menu, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { getProductImage } from '../../../utils/imageUrl';
import './AdminProducts.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);

  const categories = ['all', 'men', 'women', 'kids', 'jewelry', 'shoes', 'accessories', 'traditional'];

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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = userInfo?.token;
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const response = await axios.get(`${API_URL}/products?limit=500`, config);
      const list = response.data?.products || response.data || [];
      setProducts(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to load products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let result = [...products];

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((product) => product.category === selectedCategory);
    }

    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        break;
      case 'stock-low':
        result.sort((a, b) => (a.stock || 0) - (b.stock || 0));
        break;
      default:
        result.sort(
          (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
    }

    setFilteredProducts(result);
  };

  const deleteProduct = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      const token = userInfo?.token;
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Product deleted successfully');
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const renderStars = (rating = 0) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="star-filled" />);
    }
    if (hasHalf) {
      stars.push(<FaStarHalfAlt key="half" className="star-half" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="star-empty" />);
    }
    return stars;
  };

  const getStockStatus = (stock = 0) => {
    if (stock <= 0) return { class: 'out', text: 'Out of Stock' };
    if (stock < 10) return { class: 'low', text: `Low Stock (${stock})` };
    return { class: 'in', text: 'In Stock' };
  };

  useEffect(() => {
    fetchProducts();
  }, [userInfo?.token]);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-main-content" style={{ padding: '2rem', textAlign: 'center' }}>
          Loading products...
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
      
      {/* Sidebar with mobile support */}
    {/* // In your AdminProducts.js or main layout component */}

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
          <h2>Product Management</h2>
          <div className="mobile-header-spacer"></div>
        </div>

        {/* Close button for mobile - now inside sidebar wrapper */}
        {isMobile && isMobileMenuOpen && (
          <button 
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        )}

        <div className="admin-products-container">
          {/* Products Header */}
          <div className="products-header">
            <div className="header-left">
              <div className="header-icon">
                <FaArchive size={24} />
              </div>
              <div className="header-text">
                <h1>Product Management</h1>
                <p>Manage your product inventory, prices, and stock</p>
              </div>
            </div>
            <Link to="/admin/add-product" className="add-product-btn">
              <FaPlus /> Add New Product
            </Link>
          </div>

          {/* Stats Summary */}
          <div className="products-stats">
            <div className="stat-box">
              <span className="stat-value">{products.length}</span>
              <span className="stat-label">Total Products</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{products.filter(p => p.stock < 10 && p.stock > 0).length}</span>
              <span className="stat-label">Low Stock</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{products.filter(p => p.stock === 0).length}</span>
              <span className="stat-label">Out of Stock</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">£{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(0)}</span>
              <span className="stat-label">Inventory Value</span>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="products-toolbar">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="clear-search" onClick={() => setSearchTerm('')}>
                  <FaTimes />
                </button>
              )}
            </div>
            <div className="filter-controls">
              <select 
                className="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <select 
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
                <option value="stock-low">Stock: Low to High</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              return (
                <div key={product._id} className="product-card-admin">
                  {/* Product Image */}
                  <div className="product-image-admin">
                    <img 
                      src={getProductImage(product)} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x400?text=No+Image';
                      }}
                    />
                    {stockStatus.class !== 'in' && (
                      <div className={`stock-badge ${stockStatus.class}`}>
                        {stockStatus.text}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="product-info-admin">
                    <div className="product-category">{product.category}</div>
                    <h3 className="product-name">{product.name}</h3>
                    
                    <div className="product-rating">
                      {renderStars(product.rating || 4.5)}
                      <span>({product.reviews || 0})</span>
                    </div>
                    
                    <div className="product-price">
                      <span className="current">£{product.price.toFixed(2)}</span>
                      {product.oldPrice && <span className="old">£{product.oldPrice.toFixed(2)}</span>}
                    </div>
                    
                    <div className="product-stock">
                      <span className={`stock-indicator ${stockStatus.class}`}></span>
                      <span>{stockStatus.text}</span>
                    </div>
                  </div>

                  {/* Product Actions */}
                  <div className="product-actions-admin">
                    <Link to={`/product/${product._id}`} className="action-btn view" title="View Product">
                      <FaEye />
                    </Link>
                    <Link to={`/admin/edit-product/${product._id}`} className="action-btn edit" title="Edit Product">
                      <FaEdit />
                    </Link>
                    <button className="action-btn copy" title="Duplicate Product">
                      <FaCopy />
                    </button>
                    <button 
                      className="action-btn delete" 
                      onClick={() => deleteProduct(product._id, product.name)} 
                      title="Delete Product"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="empty-products">
              <div className="empty-icon">📦</div>
              <h3>No products found</h3>
              <p>Try adjusting your search or filter criteria</p>
              <Link to="/admin/add-product" className="add-product-btn empty-btn">
                <FaPlus /> Add Your First Product
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;