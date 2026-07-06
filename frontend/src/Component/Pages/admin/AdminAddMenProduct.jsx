import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import { 
  Plus, 
  Package, 
  DollarSign, 
  Box, 
  Image, 
  AlignLeft,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { MAX_PRODUCT_IMAGES } from '../../../config/uploadLimits';
import { processImageFileSelection, revokeImagePreviews, MAX_MB } from '../../../utils/imageUpload';
import './AdminAddProduct.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminAddMenProduct = () => {
  const { userInfo } = useSelector((state) => state.auth);
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageErrors, setImageErrors] = useState([]);
  const [uploading, setUploading] = useState(false);

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

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newImages = images.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(newPreviews);
    setImages(newImages);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!price || parseFloat(price) <= 0) {
      toast.error('Valid price is required');
      return;
    }

    if (images.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('price', parseFloat(price));
    formData.append('category', 'men');
    formData.append('stock', parseInt(stock) || 10);
    formData.append('description', description.trim() || `${name} - Men's collection product`);

    images.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const token = userInfo?.token;
      
      const response = await axios.post(
        `${API_URL}/products`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.success('Men\'s product created successfully!');

      // Reset form
      setName('');
      setPrice('');
      setStock('');
      setDescription('');
      
      revokeImagePreviews(imagePreviews);
      setImagePreviews([]);
      setImages([]);
      setImageErrors([]);
      
      const fileInput = document.getElementById('imageInput');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error("Upload error:", error);
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
            <div className="header-left">
              <div className="header-icon">
                <Plus size={28} />
              </div>
              <div>
                <h1>Add Men's Product</h1>
                <p>Add new product to Men's Collection</p>
              </div>
            </div>
            <button className="back-button" onClick={() => window.history.back()}>
              <ArrowLeft size={20} />
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Package size={18} />
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Enter product name"
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <DollarSign size={18} />
                  Price (£) *
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="form-input"
                  placeholder="99.99"
                  step="0.01"
                  min="0"
                  disabled={uploading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Box size={18} />
                  Stock *
                </label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="form-input"
                  placeholder="10"
                  min="0"
                  disabled={uploading}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <AlignLeft size={18} />
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  placeholder="Describe your product..."
                  disabled={uploading}
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <Image size={18} />
                  Product Images *
                </label>
                <div className="image-upload-area">
                  <input
                    id="imageInput"
                    type="file"
                    multiple
                    accept="image/*,.heic,.heif"
                    onChange={handleImageChange}
                    className="image-input"
                    disabled={uploading || images.length >= MAX_PRODUCT_IMAGES}
                  />
                  <div className="upload-placeholder">
                    <Upload size={40} />
                    <p>Click or drag to upload images</p>
                    <span className="upload-hint">Up to {MAX_PRODUCT_IMAGES} • Max {MAX_MB}MB • JPG, PNG, HEIC</span>
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
                        <img 
                          src={preview} 
                          alt={`Preview ${idx}`} 
                          className="preview-image" 
                        />
                        <button 
                          type="button"
                          className="remove-image-btn"
                          onClick={() => removeImage(idx)}
                          disabled={uploading}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={`image-status ${images.length > 0 ? 'success' : 'error'}`}>
                  {images.length === 0 ? (
                    <>
                      <AlertCircle size={16} />
                      <span>No images selected</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      <span>{images.length} image(s) selected</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className={`submit-button ${uploading ? 'loading' : ''}`}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 size={20} className="spinner" />
                  Publishing...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add to Men's Collection
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddMenProduct;
