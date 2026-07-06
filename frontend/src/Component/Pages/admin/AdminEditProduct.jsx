// src/Component/Pages/admin/AdminEditProduct.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import { PRODUCT_CATEGORIES, LISTING_TYPES } from '../../../config/categories';
import {
  Plus,
  Package,
  DollarSign,
  Tag,
  Layers,
  List,
  Calendar,
  Shield,
  Check,
  Image,
  AlignLeft,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Home,
  ShoppingBag,
  Briefcase,
  Star,
  Heart,
  Crown,
  Sparkles,
  Menu,
  X as XIcon,
  Save,
  Trash2
} from 'lucide-react';
import { getImageUrl } from '../../../utils/imageUrl';
import './AdminAddProduct.css';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [product, setProduct] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('women');
  const [listingType, setListingType] = useState('sale');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [rentalPricePerDay, setRentalPricePerDay] = useState('');
  const [rentalDeposit, setRentalDeposit] = useState('');
  const [rentalAvailable, setRentalAvailable] = useState(true);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Check if screen is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 991);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // ✅ Fetch product data
  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = userInfo?.token;
      
      if (!token) {
        toast.error('Please login first');
        navigate('/admin/products');
        return;
      }

      const config = { 
        headers: { 
          'Authorization': `Bearer ${token}` 
        } 
      };

      const response = await axios.get(`${API_URL}/products/${id}`, config);
      const productData = response.data;
      
      setProduct(productData);
      
      // ✅ Populate form fields
      setName(productData.name || '');
      setPrice(productData.price || '');
      setCategory(productData.category || 'women');
      setListingType(productData.listingType || 'sale');
      setStock(productData.stock || '');
      setDescription(productData.description || '');
      
      // ✅ Rental fields
      if (productData.listingType === 'rental') {
        setRentalPricePerDay(productData.rental?.pricePerDay || '');
        setRentalDeposit(productData.rental?.deposit || '');
        setRentalAvailable(productData.rental?.available || true);
      }
      
      // ✅ Existing images
      if (productData.images && productData.images.length > 0) {
        setExistingImages(productData.images);
      }
      
      toast.success('Product loaded successfully');
      
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle image change for new images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILES = 10;
    const totalImages = existingImages.length + images.length + files.length;
    
    if (totalImages > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} images allowed. You have ${existingImages.length + images.length} already.`);
      return;
    }

    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" exceeds 5MB limit`);
        return;
      }
      
      const ext = file.name.split('.').pop().toLowerCase();
      const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif'];
      if (!allowed.includes(ext)) {
        errors.push(`"${file.name}" is not a supported format`);
        return;
      }
      
      validFiles.push(file);
    });

    if (errors.length > 0) {
      errors.slice(0, 3).forEach((msg) => toast.error(msg));
      setImageErrors(errors);
    }

    if (validFiles.length === 0) return;

    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
    setImages((prev) => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} image(s) added`);
  };

  // ✅ Remove new image
  const removeNewImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = images.filter((_, i) => i !== index);
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    setImagePreviews(newPreviews);
    setImages(newImages);
  };

  // ✅ Remove existing image
  const removeExistingImage = (index) => {
    const updated = existingImages.filter((_, i) => i !== index);
    setExistingImages(updated);
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (listingType === 'rental' && !rentalPricePerDay) {
      toast.error('Rental price per day is required');
      return;
    }
    if (existingImages.length === 0 && images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setSaving(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('price', parseFloat(price));
    formData.append('category', category);
    formData.append('listingType', listingType);
    formData.append('stock', parseInt(stock, 10) || 10);
    formData.append('description', description.trim() || `${name} — QASR-E-LIBAS LTD`);
    
    // ✅ Rental data
    formData.append(
      'rental',
      JSON.stringify({
        available: listingType === 'rental' ? rentalAvailable : false,
        pricePerDay: parseFloat(rentalPricePerDay) || 0,
        deposit: parseFloat(rentalDeposit) || 0,
      })
    );

    // ✅ Existing images (keep)
    formData.append('existingImages', JSON.stringify(existingImages));

    // ✅ New images
    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const token = userInfo?.token;
      if (!token) {
        toast.error('Please login first');
        setSaving(false);
        return;
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        },
      };

      const response = await axios.put(
        `${API_URL}/products/${id}`,
        formData,
        config
      );

      toast.success('Product updated successfully!');
      
      // ✅ Clean up previews
      imagePreviews.forEach(preview => {
        if (preview) URL.revokeObjectURL(preview);
      });
      
      // ✅ Navigate back to products
      setTimeout(() => {
        navigate('/admin/products');
      }, 1500);

    } catch (error) {
      console.error('Error updating product:', error);
      const errorMsg = error.response?.data?.message || 'Failed to update product';
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  // ✅ Handle delete product
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const token = userInfo?.token;
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.delete(`${API_URL}/products/${id}`, config);
      toast.success('Product deleted successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <div className="admin-main-content">
          <div className="admin-loading">
            <div className="spinner"></div>
            <p>Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && isMobile && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <div className={`admin-sidebar-wrapper ${isMobileMenuOpen ? 'open' : ''}`}>
        <AdminSidebar 
          isMobileMenuOpen={isMobileMenuOpen} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
        />
        {isMobile && (
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <XIcon size={24} />
          </button>
        )}
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
          <h2>Edit Product</h2>
          <div className="mobile-header-spacer"></div>
        </div>

        <div className="admin-add-product-container">
          <div className="product-card">
            <div className="card-header">
              <div className="header-left">
                <div className="header-icon">
                  <Package size={28} />
                </div>
                <div className="header-text">
                  <h1>Edit Product</h1>
                  <p>Update product details</p>
                </div>
              </div>
              <div className="header-right">
                <button
                  className="delete-product-btn"
                  onClick={handleDelete}
                  title="Delete Product"
                >
                  <Trash2 size={20} /> Delete
                </button>
                <button
                  className="back-button"
                  onClick={() => navigate('/admin/products')}
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                  <span className="back-text">Back</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="product-form" noValidate>
              <div className="form-grid">
                {/* Product Name */}
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="productName">
                    <Package size={18} className="label-icon" />
                    <span className="label-text">Product Name</span>
                    <span className="required-asterisk">*</span>
                  </label>
                  <input
                    id="productName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="form-input"
                    placeholder="Enter product name"
                    disabled={saving}
                    required
                  />
                </div>

                {/* Price */}
                <div className="form-group form-group-half">
                  <label className="form-label" htmlFor="productPrice">
                    <DollarSign size={18} className="label-icon" />
                    <span className="label-text">Price (£)</span>
                    <span className="required-asterisk">*</span>
                  </label>
                  <input
                    id="productPrice"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="form-input"
                    placeholder="99.99"
                    step="0.01"
                    min="0"
                    disabled={saving}
                    required
                  />
                </div>

                {/* Stock */}
                <div className="form-group form-group-half">
                  <label className="form-label" htmlFor="productStock">
                    <Package size={18} className="label-icon" />
                    <span className="label-text">Stock</span>
                    <span className="required-asterisk">*</span>
                  </label>
                  <input
                    id="productStock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="form-input"
                    placeholder="10"
                    min="0"
                    disabled={saving}
                  />
                </div>

                {/* Category */}
                <div className="form-group form-group-half">
                  <label className="form-label" htmlFor="productCategory">
                    <Layers size={18} className="label-icon" />
                    <span className="label-text">Category</span>
                    <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="productCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                    disabled={saving}
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Listing Type */}
                <div className="form-group form-group-half">
                  <label className="form-label" htmlFor="listingType">
                    <List size={18} className="label-icon" />
                    <span className="label-text">Listing Type</span>
                    <span className="required-asterisk">*</span>
                  </label>
                  <select
                    id="listingType"
                    value={listingType}
                    onChange={(e) => setListingType(e.target.value)}
                    className="form-select"
                    disabled={saving}
                  >
                    {LISTING_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rental Fields */}
                {listingType === 'rental' && (
                  <div className="rental-fields">
                    <div className="form-group">
                      <label className="form-label" htmlFor="rentalPrice">
                        <Calendar size={18} />
                        Rental Price/Day (£) *
                      </label>
                      <input
                        id="rentalPrice"
                        type="number"
                        value={rentalPricePerDay}
                        onChange={(e) => setRentalPricePerDay(e.target.value)}
                        className="form-input"
                        placeholder="25.00"
                        step="0.01"
                        min="0"
                        disabled={saving}
                        required={listingType === 'rental'}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="rentalDeposit">
                        <Shield size={18} />
                        Security Deposit (£)
                      </label>
                      <input
                        id="rentalDeposit"
                        type="number"
                        value={rentalDeposit}
                        onChange={(e) => setRentalDeposit(e.target.value)}
                        className="form-input"
                        placeholder="100.00"
                        step="0.01"
                        min="0"
                        disabled={saving}
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={rentalAvailable}
                          onChange={(e) => setRentalAvailable(e.target.checked)}
                          disabled={saving}
                        />
                        <span className="checkmark"></span>
                        Available for rental
                      </label>
                    </div>
                  </div>
                )}

                {/* Images */}
                <div className="form-group form-group-full">
                  <label className="form-label">
                    <Image size={18} />
                    Product Images *
                    <span className="image-count">
                      ({existingImages.length + images.length} images)
                    </span>
                  </label>

                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="image-preview-grid">
                      {existingImages.map((img, idx) => (
                        <div key={`existing-${idx}`} className="image-preview-item">
                          <img
                            src={getImageUrl(img.url)}
                            alt={`Product ${idx + 1}`}
                            className="preview-image"
                          />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeExistingImage(idx)}
                            disabled={saving}
                            aria-label="Remove image"
                          >
                            <X size={16} />
                          </button>
                          <span className="image-order">{idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* New Images */}
                  {imagePreviews.length > 0 && (
                    <div className="image-preview-grid">
                      {imagePreviews.map((preview, idx) => (
                        <div key={`new-${idx}`} className="image-preview-item">
                          <img
                            src={preview}
                            alt={`New ${idx + 1}`}
                            className="preview-image"
                          />
                          <button
                            type="button"
                            className="remove-image-btn"
                            onClick={() => removeNewImage(idx)}
                            disabled={saving}
                            aria-label="Remove image"
                          >
                            <X size={16} />
                          </button>
                          <span className="image-order">New {idx + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload New Images */}
                  <div className={`image-upload-area ${saving ? 'disabled' : ''}`}>
                    <input
                      id="imageInput"
                      type="file"
                      multiple
                      accept="image/*,.heic,.heif"
                      onChange={handleImageChange}
                      className="image-input"
                      disabled={saving || (existingImages.length + images.length) >= 10}
                    />
                    <div className="upload-placeholder">
                      <Upload size={40} />
                      <p>Click or drag to add more images</p>
                      <span className="upload-hint">
                        {existingImages.length + images.length}/10 images • Max 5MB each
                      </span>
                    </div>
                  </div>

                  <div className={`image-status ${existingImages.length + images.length > 0 ? 'success' : 'error'}`}>
                    {existingImages.length + images.length === 0 ? (
                      <>
                        <AlertCircle size={16} />
                        <span>No images selected</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>{existingImages.length + images.length} image(s) ready</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group form-group-full">
                  <label className="form-label" htmlFor="productDescription">
                    <AlignLeft size={18} />
                    Description
                  </label>
                  <textarea
                    id="productDescription"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="form-textarea"
                    placeholder="Describe fabric, fit, occasion, care instructions..."
                    disabled={saving}
                    rows="4"
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {saving && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{uploadProgress}%</span>
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => navigate('/admin/products')}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`submit-button ${saving ? 'loading' : ''}`}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="spinner" />
                      Saving... {uploadProgress > 0 && `(${uploadProgress}%)`}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Update Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProduct;