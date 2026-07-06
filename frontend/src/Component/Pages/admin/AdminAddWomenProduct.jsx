import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import { MAX_PRODUCT_IMAGES } from '../../../config/uploadLimits';
import {
  processImageFileSelection,
  revokeImagePreviews,
  MAX_MB,
} from '../../../utils/imageUpload';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import './AdminAddProduct.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminAddWomenProduct = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Size options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  
  // Color options
  const colorOptions = [
    'Maroon', 'Crimson Red', 'Antique Gold', 'Dusty Rose', 'Burgundy',
    'Deep Red', 'Gold', 'Silver', 'Emerald Green', 'Royal Blue',
    'Purple', 'Black', 'White', 'Beige', 'Navy Blue', 'Pink', 'Lavender'
  ];

  // Handle size toggle
  const handleSizeToggle = (size) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter(s => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  // Handle color toggle
  const handleColorToggle = (color) => {
    if (colors.includes(color)) {
      setColors(colors.filter(c => c !== color));
    } else {
      setColors([...colors, color]);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const { validFiles, errors, addedCount, totalAfter } = processImageFileSelection(
      e.target.files,
      images.length
    );
    e.target.value = '';

    if (errors.length > 0) {
      setImageErrors(errors);
      errors.slice(0, 3).forEach((msg) => toast.error(msg, { duration: 6000 }));
    } else {
      setImageErrors([]);
    }

    if (validFiles.length === 0) return;

    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
    setImages((prev) => [...prev, ...validFiles]);
    setImageErrors([]);
    toast.success(`${addedCount} image(s) added (${totalAfter}/${MAX_PRODUCT_IMAGES})`);
  };

  // Remove image
  const removeImage = (index) => {
    if (imagePreviews[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setImages(prev => prev.filter((_, i) => i !== index));
    toast.success('Image removed');
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("=== SUBMITTING WOMEN'S PRODUCT ===");

    // Validation
    if (!name) {
      toast.error('Product name is required');
      return;
    }

    if (!price) {
      toast.error('Price is required');
      return;
    }

    if (images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    
    // Add text fields
    formData.append('name', name);
    formData.append('price', parseFloat(price));
    formData.append('category', 'women'); // ✅ FORCED to 'women' for Women's Collection
    formData.append('stock', parseInt(stock) || 10);
    formData.append('description', description || `${name} - Beautiful women's collection product`);
    
    // Optional fields
    if (discountPrice) {
      formData.append('discountPrice', parseFloat(discountPrice));
    }
    if (material) {
      formData.append('material', material);
    }
    
    // Add arrays as JSON strings
    if (sizes.length > 0) {
      formData.append('sizes', JSON.stringify(sizes));
    }
    if (colors.length > 0) {
      formData.append('colors', JSON.stringify(colors));
    }
    
    // Add boolean fields
    formData.append('isFeatured', isFeatured);
    formData.append('isNew', isNew);

    // Add images
    images.forEach((image) => {
      formData.append('images', image);
    });

    // Debug log
    console.log("Sending Women's product with category: women");
    console.log("Product name:", name);
    console.log("Price:", price);
    console.log("Sizes:", sizes);
    console.log("Colors:", colors);
    console.log("Images count:", images.length);

    try {
      const token = userInfo?.token;
      
      if (!token) {
        toast.error('You must be logged in as admin');
        setUploading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/products`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("Success:", response.data);
      toast.success('Women\'s product created successfully!');

      // Reset form
      setName('');
      setPrice('');
      setDiscountPrice('');
      setStock('');
      setDescription('');
      setMaterial('');
      setSizes([]);
      setColors([]);
      setIsFeatured(false);
      setIsNew(true);
      
      // Clear images
      revokeImagePreviews(imagePreviews);
      setImagePreviews([]);
      setImages([]);
      setImageErrors([]);
      
      // Reset file input
      const fileInput = document.getElementById('womenImageInput');
      if (fileInput) fileInput.value = '';

      // Optional: Redirect after 2 seconds
      setTimeout(() => {
        // window.location.href = '/admin/products';
      }, 2000);

    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-add-product-container">
        <div className="product-card">
          <div className="card-header">
            <h1>➕ Add Women's Product</h1>
            <p>Add new product to Women's Collection</p>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
            {/* Product Name */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Product Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                placeholder="e.g., Traditional Maroon and Gold Afghan Kuchi Bridal Dress"
                required
              />
            </div>

            {/* Price and Discount Price */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Price (£) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                  placeholder="99.99"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Discount Price (£)
                </label>
                <input
                  type="number"
                  value={discountPrice}
                  onChange={(e) => setDiscountPrice(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                  placeholder="79.99"
                  step="0.01"
                />
                <small style={{ color: '#666' }}>Original price before discount</small>
              </div>
            </div>

            {/* Stock and Material */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                  placeholder="10"
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Material
                </label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                  placeholder="Premium Velvet, Silk, etc."
                />
              </div>
            </div>

            {/* Sizes Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Available Sizes
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {sizeOptions.map(size => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => handleSizeToggle(size)}
                    style={{
                      padding: '8px 16px',
                      border: `1px solid ${sizes.includes(size) ? '#4CAF50' : '#ccc'}`,
                      borderRadius: '4px',
                      background: sizes.includes(size) ? '#4CAF50' : 'white',
                      color: sizes.includes(size) ? 'white' : '#333',
                      cursor: 'pointer'
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizes.length > 0 && (
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  Selected: {sizes.join(', ')}
                </small>
              )}
            </div>

            {/* Colors Section */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Available Colors
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {colorOptions.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleColorToggle(color)}
                    style={{
                      padding: '8px 16px',
                      border: `1px solid ${colors.includes(color) ? '#4CAF50' : '#ccc'}`,
                      borderRadius: '4px',
                      background: colors.includes(color) ? '#4CAF50' : 'white',
                      color: colors.includes(color) ? 'white' : '#333',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: color.toLowerCase().replace(/ /g, ''),
                      display: 'inline-block'
                    }}></span>
                    {color}
                  </button>
                ))}
              </div>
              {colors.length > 0 && (
                <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                  Selected: {colors.join(', ')}
                </small>
              )}
            </div>

            {/* Featured and New Flags */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>⭐ Featured Product</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  style={{ width: '20px', height: '20px' }}
                />
                <span>🆕 New Arrival</span>
              </label>
            </div>

            {/* Images Section */}
            <div className="form-group form-group-full" style={{ marginBottom: '20px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 'bold' }}>
                <ImageIcon size={18} />
                Product Images *
                {images.length > 0 && (
                  <span className="image-count">({images.length}/{MAX_PRODUCT_IMAGES})</span>
                )}
              </label>
              <div className={`image-upload-area ${uploading ? 'disabled' : ''}`}>
                <input
                  id="womenImageInput"
                  type="file"
                  multiple
                  accept="image/*,.heic,.heif"
                  onChange={handleImageChange}
                  className="image-input"
                  disabled={uploading || images.length >= MAX_PRODUCT_IMAGES}
                />
                <div className="upload-placeholder">
                  <Upload size={40} />
                  <p>Click to add images (select multiple at once)</p>
                  <span className="upload-hint">
                    Up to {MAX_PRODUCT_IMAGES} images • Max {MAX_MB}MB each • JPG, PNG, HEIC (iPhone)
                  </span>
                </div>
              </div>

              {imageErrors.length > 0 && (
                <div className="image-reject-list">
                  {imageErrors.map((msg, i) => (
                    <p key={i}>⚠️ {msg}</p>
                  ))}
                </div>
              )}

              {imagePreviews.length > 0 && (
                <div className="image-preview-grid">
                  {imagePreviews.map((preview, idx) => (
                    <div key={preview} className="image-preview-item">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="preview-image" />
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
                      {idx === 0 && (
                        <span style={{
                          position: 'absolute',
                          bottom: '6px',
                          left: '6px',
                          background: '#4CAF50',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600
                        }}>
                          Main
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className={`image-status ${images.length > 0 ? 'success' : 'error'}`} style={{ marginTop: '10px' }}>
                {images.length === 0
                  ? imageErrors.length > 0
                    ? '⚠️ Fix the issues above and select images again'
                    : '⚠️ No images selected — click the upload box above'
                  : `✅ ${images.length} image(s) ready. First image is the main photo.`}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
                placeholder="Describe your product in detail..."
                rows="4"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              style={{
                width: '100%',
                padding: '15px',
                background: uploading ? '#ccc' : '#e91e63',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? '⏳ Publishing...' : '👗 Add to Women\'s Collection'}
            </button>
          </form>

          {/* Live Preview Section */}
          {(name || imagePreviews[0]) && (
            <div style={{ padding: '20px', borderTop: '1px solid #eee', marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>🔍 Live Preview</h3>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                {imagePreviews[0] && (
                  <img 
                    src={imagePreviews[0]} 
                    alt="Preview" 
                    style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                )}
                <div>
                  <h4>{name || 'Product Name'}</h4>
                  <div>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63' }}>
                      £{discountPrice || price || '0'}
                    </span>
                    {discountPrice && price && (
                      <span style={{ marginLeft: '10px', textDecoration: 'line-through', color: '#999' }}>
                        £{price}
                      </span>
                    )}
                  </div>
                  {material && <p><strong>Material:</strong> {material}</p>}
                  {sizes.length > 0 && <p><strong>Sizes:</strong> {sizes.join(', ')}</p>}
                  {colors.length > 0 && <p><strong>Colors:</strong> {colors.join(', ')}</p>}
                  <span style={{ display: 'inline-block', marginTop: '10px', padding: '5px 10px', background: '#4CAF50', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                    Women's Collection
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAddWomenProduct;