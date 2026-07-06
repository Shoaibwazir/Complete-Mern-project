// src/Component/Pages/admin/AdminAddProduct.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import { PRODUCT_CATEGORIES, LISTING_TYPES } from '../../../config/categories';
import { MAX_PRODUCT_IMAGES } from '../../../config/uploadLimits';
import {
  processImageFileSelection,
  revokeImagePreviews,
  MAX_MB,
} from '../../../utils/imageUpload';
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
  X as XIcon
} from 'lucide-react';
import './AdminAddProduct.css';

const AdminAddProduct = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  // State with proper initial values
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
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const getCategoryIcon = (catValue) => {
    const icons = {
      'women': <ShoppingBag size={18} />,
      'men': <Briefcase size={18} />,
      'kids': <Star size={18} />,
      'luxury': <Crown size={18} />,
      'accessories': <Sparkles size={18} />,
      'home': <Home size={18} />
    };
    return icons[catValue] || <Tag size={18} />;
  };

  // ✅ FIXED: Better image handling with HEIC support
 // In AdminAddProduct.jsx - Update handleImageChange

const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  // ✅ Set new max file size (20MB)
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
  
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif'];
  
  const validFiles = [];
  const errors = [];

  files.forEach((file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    const isValidType = allowedTypes.includes(file.type) || allowedExtensions.includes(ext);
    
    // ✅ Check file size with new limit (20MB)
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`"${file.name}" exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB)`);
      return;
    }
    
    if (!isValidType) {
      errors.push(`"${file.name}" is not a supported image format`);
      return;
    }
    
    validFiles.push(file);
  });

  // Show errors
  if (errors.length > 0) {
    errors.slice(0, 3).forEach((msg) => toast.error(msg, { duration: 6000 }));
    if (errors.length > 3) {
      toast.error(`+ ${errors.length - 3} more issue(s)`);
    }
    setImageErrors(errors);
  } else {
    setImageErrors([]);
  }

  if (validFiles.length === 0) return;

  // Check max images limit
  const totalAfter = images.length + validFiles.length;
  if (totalAfter > MAX_PRODUCT_IMAGES) {
    toast.error(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`);
    const availableSlots = MAX_PRODUCT_IMAGES - images.length;
    if (availableSlots > 0) {
      const limitedFiles = validFiles.slice(0, availableSlots);
      const previews = limitedFiles.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...previews]);
      setImages((prev) => [...prev, ...limitedFiles]);
      toast.warning(`Added ${limitedFiles.length} images (max limit reached)`);
    }
    return;
  }

  // Create previews
  const previews = validFiles.map((file) => URL.createObjectURL(file));
  setImagePreviews((prev) => [...prev, ...previews]);
  setImages((prev) => [...prev, ...validFiles]);
  setImageErrors([]);
  
  const heicCount = validFiles.filter(f => 
    ['heic', 'heif', 'avif'].includes(f.name.split('.').pop().toLowerCase())
  ).length;
  
  toast.success(`${validFiles.length} image(s) added${heicCount > 0 ? ` (${heicCount} HEIC/HEIF)` : ''}`);
};

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = images.filter((_, i) => i !== index);
    // Revoke object URL to free memory
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    setImagePreviews(newPreviews);
    setImages(newImages);
    toast.info('Image removed');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if ((listingType === 'rental' || listingType === 'both') && !rentalPricePerDay) {
      toast.error('Rental price per day is required');
      return;
    }
    if (images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('price', parseFloat(price));
    formData.append('category', category);
    formData.append('listingType', listingType);
    formData.append('stock', parseInt(stock, 10) || 10);
    formData.append('description', description.trim() || `${name} — QASR-E-LIBAS LTD`);
    formData.append(
      'rental',
      JSON.stringify({
        available: listingType === 'rental' || listingType === 'both' ? rentalAvailable : false,
        pricePerDay: parseFloat(rentalPricePerDay) || 0,
        deposit: parseFloat(rentalDeposit) || 0,
      })
    );

    // Append each image with proper field name
    images.forEach((image, index) => {
      formData.append('images', image);
    });

    try {
      const token = userInfo?.token;

      if (!token) {
        toast.error('You must be logged in as admin');
        setUploading(false);
        return;
      }

      // Log FormData for debugging
      console.log('📦 FormData entries:');
      for (let pair of formData.entries()) {
        if (pair[0] === 'images') {
          console.log(`📸 ${pair[0]}: ${pair[1].name} (${(pair[1].size / 1024).toFixed(2)}KB)`);
        } else {
          console.log(`${pair[0]}: ${pair[1]}`);
        }
      }

      const response = await axios.post(
        `${API_URL}/products`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          },
        }
      );

      console.log("✅ Success:", response.data);
      toast.success('Product created successfully!');
      
      // Reset all fields
      setName('');
      setPrice('');
      setCategory('women');
      setListingType('sale');
      setRentalPricePerDay('');
      setRentalDeposit('');
      setRentalAvailable(true);
      setStock('');
      setDescription('');
      setUploadProgress(0);

      // Clean up previews
      revokeImagePreviews(imagePreviews);
      setImagePreviews([]);
      setImages([]);
      setImageErrors([]);

      const fileInput = document.getElementById('imageInput');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("❌ Upload error:", error);
      
      // Better error handling
      let errorMessage = 'Failed to create product';
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        // ✅ Show helpful tips if available
        if (error.response.data?.tip) {
          toast.error(`${errorMessage}\n💡 ${error.response.data.tip}`);
          return;
        }
      } else if (error.request) {
        errorMessage = 'Network error - Please check your internet connection';
        console.error('Request:', error.request);
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  // ✅ Check if max images reached
  const isMaxImagesReached = images.length >= MAX_PRODUCT_IMAGES;

  return (
    <div className="admin-layout">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && isMobile && (
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar with mobile support */}
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
          <h2>Add New Product</h2>
          <div className="mobile-header-spacer"></div>
        </div>

        <div className="admin-add-product-container">
          <div className="product-card">
            <div className="card-header">
              <div className="header-left">
                <div className="header-icon">
                  <Plus size={28} />
                </div>
                <div className="header-text">
                  <h1>Add New Product</h1>
                  <p>QASR-E-LIBAS LTD inventory management</p>
                </div>
              </div>
              <button
                className="back-button"
                onClick={() => window.history.back()}
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
                <span className="back-text">Back</span>
              </button>
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
                    disabled={uploading}
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
                    disabled={uploading}
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
                    disabled={uploading}
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
                    disabled={uploading}
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
                    disabled={uploading}
                  >
                    {LISTING_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rental Fields */}
                {(listingType === 'rental' || listingType === 'both') && (
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
                        disabled={uploading}
                        required={listingType === 'rental' || listingType === 'both'}
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
                        disabled={uploading}
                      />
                    </div>
                    <div className="form-group checkbox-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={rentalAvailable}
                          onChange={(e) => setRentalAvailable(e.target.checked)}
                          disabled={uploading}
                        />
                        <span className="checkmark"></span>
                        Available for rental
                      </label>
                    </div>
                  </div>
                )}

                {/* Images - UPDATED */}
                <div className="form-group form-group-full">
                  <label className="form-label">
                    <Image size={18} />
                    Product Images *
                    <span className="image-count">
                      {images.length > 0 ? `(${images.length}/${MAX_PRODUCT_IMAGES})` : `(max ${MAX_PRODUCT_IMAGES})`}
                    </span>
                    <span className="image-hint">Max 5MB each • JPEG, PNG, WebP, HEIC</span>
                  </label>
                  <div className={`image-upload-area ${uploading || isMaxImagesReached ? 'disabled' : ''}`}>
                    <input
                      id="imageInput"
                      type="file"
                      multiple
                      accept="image/*,.heic,.heif"
                      onChange={handleImageChange}
                      className="image-input"
                      disabled={uploading || isMaxImagesReached}
                    />
                    <div className="upload-placeholder">
                      <Upload size={40} />
                      <p>{isMaxImagesReached ? 'Maximum images reached' : 'Click or drag to upload images'}</p>
                      <span className="upload-hint">Up to {MAX_PRODUCT_IMAGES} images • Max 5MB each • JPG, PNG, HEIC (iPhone)</span>
                    </div>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="image-preview-grid">
                      {imagePreviews.map((preview, idx) => {
                        const isHeic = images[idx]?.name?.split('.').pop().toLowerCase() === 'heic' ||
                                       images[idx]?.name?.split('.').pop().toLowerCase() === 'heif';
                        return (
                          <div key={idx} className="image-preview-item">
                            <img
                              src={preview}
                              alt={`Preview ${idx + 1}`}
                              className="preview-image"
                              loading="lazy"
                              onError={(e) => {
                                if (isHeic) {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="55" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle"%3E📸 HEIC%3C/text%3E%3C/svg%3E';
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="remove-image-btn"
                              onClick={() => removeImage(idx)}
                              disabled={uploading}
                              aria-label="Remove image"
                            >
                              <X size={16} />
                            </button>
                            <span className="image-order">{idx + 1}</span>
                            {isHeic && <span className="image-format-badge">HEIC</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {imageErrors.length > 0 && (
                    <div className="image-reject-list">
                      {imageErrors.slice(0, 5).map((msg, i) => (
                        <p key={i}>⚠️ {msg}</p>
                      ))}
                      {imageErrors.length > 5 && (
                        <p>⚠️ + {imageErrors.length - 5} more issues</p>
                      )}
                    </div>
                  )}

                  <div className={`image-status ${images.length > 0 ? 'success' : 'error'}`}>
                    {images.length === 0 ? (
                      <>
                        <AlertCircle size={16} />
                        <span>
                          {imageErrors.length > 0
                            ? 'Fix the issues above and try again'
                            : 'No images selected — click the box above to choose photos'}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={16} />
                        <span>{images.length} image(s) ready to upload</span>
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
                    placeholder="Describe fabric, fit, occasion, care instructions, and unique features..."
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Upload Progress */}
              {uploading && uploadProgress > 0 && uploadProgress < 100 && (
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

              <button
                type="submit"
                className={`submit-button ${uploading ? 'loading' : ''}`}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Publishing... {uploadProgress > 0 && `(${uploadProgress}%)`}
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Publish Product
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct;