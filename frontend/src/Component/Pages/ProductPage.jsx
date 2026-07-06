// src/Component/Pages/ProductPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Star, 
  StarHalf, 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Eye,
  CheckCircle,
  Award,
  Sparkles,
  MapPin,
  Clock,
  CreditCard,
  Info,
  Globe,
  Package,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchProductById } from '../../redux/slices/productSlice';
import { getImageUrl, getProductImages } from '../../utils/imageUrl';
import toast from 'react-hot-toast';
import './ProductPage.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { selectedProduct: product, loading, error } = useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (product) {
      if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
      if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
      setQuantity(1);
      setActiveImage(0);
    }
  }, [product]);

  const handleQuantityChange = (type) => {
    if (type === 'increase' && quantity < (product?.stock || 10)) {
      setQuantity(prev => prev + 1);
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCart = async () => {
    if (product?.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    if (product?.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    setAddingToCart(true);
    
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.images?.[activeImage]?.url || product.image),
      quantity: quantity,
      size: selectedSize,
      color: selectedColor,
      stock: product.stock,
      category: product.category
    };
    
    try {
      await dispatch(addToCart(cartItem)).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (product?.sizes?.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    
    if (product?.colors?.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    
    const buyNowItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: getImageUrl(product.images?.[activeImage]?.url || product.image),
      quantity: quantity,
      size: selectedSize,
      color: selectedColor
    };
    
    localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
    navigate('/checkout', { state: { buyNow: true, product: buyNowItem } });
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="star-filled" size={18} fill="#ffc107" stroke="#ffc107" />);
    }
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="star-half" size={18} fill="#ffc107" stroke="#ffc107" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="star-empty" size={18} stroke="#e0e0e0" />);
    }
    return stars;
  };

  const discountPercent = product?.originalPrice && product?.originalPrice > product?.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const images = product ? getProductImages(product) : [];
  const productDescription =
    product?.description?.trim() ||
    `${product?.name || 'This piece'} from QASR-E-LIBAS LTD — premium luxury clothing crafted with authentic tradition and modern elegance. Perfect for weddings, celebrations, and special occasions.`;
  const inStock = product?.stock > 0;
  const lowStock = product?.stock > 0 && product?.stock < 10;

  // Shipping Countries
  const countries = [
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'DEU', name: 'Germany', flag: '🇩🇪' },
    { code: 'FRA', name: 'France', flag: '🇫🇷' },
    { code: 'ITA', name: 'Italy', flag: '🇮🇹' },
    { code: 'NLD', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'ESP', name: 'Spain', flag: '🇪🇸' },
    { code: 'USA', name: 'United States', flag: '🇺🇸' },
    { code: 'CAN', name: 'Canada', flag: '🇨🇦' },
    { code: 'AUS', name: 'Australia', flag: '🇦🇺' },
    { code: 'BEL', name: 'Belgium', flag: '🇧🇪' },
    { code: 'CHE', name: 'Switzerland', flag: '🇨🇭' },
    { code: 'AUT', name: 'Austria', flag: '🇦🇹' },
    { code: 'SWE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NOR', name: 'Norway', flag: '🇳🇴' },
    { code: 'DNK', name: 'Denmark', flag: '🇩🇰' },
  ];

  const getShippingInfo = (countryCode) => {
    if (countryCode === 'UK') {
      return {
        method: 'Royal Mail Tracked 48',
        cost: 'FREE',
        deliveryTime: '2-4 business days',
        tracking: true
      };
    } else {
      return {
        method: 'Royal Mail International Tracked',
        cost: 'Calculated at checkout',
        deliveryTime: '5-10 business days',
        tracking: true
      };
    }
  };

  const handleShippingClick = (countryCode) => {
    setSelectedCountry(countryCode);
    setShowShippingModal(true);
  };

  if (loading) {
    return (
      <div className="product-loading">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-error">
        <span>⚠️</span>
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist or has been removed.</p>
        <Link to="/shop" className="back-btn">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="product-page">
      <div className="product-breadcrumb">
        <div className="container">
          <Link to="/">Home</Link> / 
          <Link to="/shop">Shop</Link> / 
          <span>{product.name}</span>
        </div>
      </div>

      <div className="product-container">
        {/* Left Column - Images */}
        <div className="product-gallery">
          <div className="main-image">
            <img src={images[activeImage]?.url} alt={product.name} />
            {discountPercent > 0 && (
              <div className="discount-badge">-{discountPercent}%</div>
            )}
            {product.isNew && <div className="new-badge">NEW</div>}
          </div>
          
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${activeImage === index ? 'active' : ''}`}
                  onClick={() => setActiveImage(index)}
                >
                  <img src={img.url} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div className="product-info">
          <div className="product-category">{product.category}</div>
          <h1 className="product-title">{product.name}</h1>

          <p className="product-short-description">{productDescription}</p>
          
          <div className="product-rating-section">
            <div className="stars">{renderStars(product.rating || 0)}</div>
            <span className="rating-count">{product.rating || 0} out of 5</span>
            <span className="review-count">({product.numReviews || 0} reviews)</span>
          </div>

          <div className="product-price-section">
            <div className="product-price">
              <span className="current-price">£{product.price?.toFixed(2)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="original-price">£{product.originalPrice?.toFixed(2)}</span>
                  <span className="save-price">Save £{(product.originalPrice - product.price).toFixed(2)}</span>
                </>
              )}
            </div>
            
            {lowStock && (
              <div className="stock-status low-stock">
                ⚠️ Only {product.stock} left in stock - order soon
              </div>
            )}
            {inStock && !lowStock && (
              <div className="stock-status in-stock">
                <CheckCircle size={14} /> In Stock | Ready to ship
              </div>
            )}
            {!inStock && (
              <div className="stock-status out-of-stock">
                ✗ Out of Stock
              </div>
            )}
          </div>

          {/* Material / Details */}
          {product.material && (
            <div className="product-detail-item">
              <strong>Material:</strong> {product.material}
            </div>
          )}
          
          {product.origin && (
            <div className="product-detail-item">
              <strong>Origin:</strong> {product.origin}
            </div>
          )}
          
          {product.style && (
            <div className="product-detail-item">
              <strong>Style:</strong> {product.style}
            </div>
          )}
          
          {product.sleeveLength && (
            <div className="product-detail-item">
              <strong>Sleeve Length:</strong> {product.sleeveLength}
            </div>
          )}

          {/* Size Selection */}
          {product.sizes?.length > 0 && (
            <div className="product-option">
              <div className="option-header">
                <span>Select Size</span>
                <button className="size-guide-btn" onClick={() => setActiveTab('size-guide')}>
                  Size Guide
                </button>
              </div>
              <div className="size-options">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors?.length > 0 && (
            <div className="product-option">
              <span>Select Color</span>
              <div className="color-options">
                {product.colors.map(color => (
                  <button
                    key={color}
                    className={`color-btn ${selectedColor === color ? 'active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    <span className="color-swatch" style={{ backgroundColor: color.toLowerCase().replace(/ /g, '') }}></span>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          <div className="product-option">
            <span>Quantity</span>
            <div className="quantity-selector">
              <button onClick={() => handleQuantityChange('decrease')} disabled={quantity <= 1}>-</button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange('increase')} disabled={quantity >= (product.stock || 10)}>+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="product-actions">
            <button 
              className={`add-to-cart-btn ${!inStock ? 'disabled' : ''}`}
              onClick={handleAddToCart}
              disabled={!inStock || addingToCart}
            >
              <ShoppingCart size={18} /> {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              className={`buy-now-btn ${!inStock ? 'disabled' : ''}`}
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              <Zap size={18} /> Buy Now
            </button>
            <button className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={() => setIsWishlisted(!isWishlisted)}>
              <Heart size={18} />
            </button>
          </div>

          {/* Delivery Info */}
          <div className="delivery-info">
            <div className="delivery-item" onClick={() => handleShippingClick('UK')}>
              <Truck size={18} />
              <div>
                <strong>Free UK Delivery</strong>
                <span>Royal Mail Tracked 48 • 2-4 days</span>
              </div>
            </div>
            <div className="delivery-item" onClick={() => handleShippingClick('DEU')}>
              <Globe size={18} />
              <div>
                <strong>International Shipping</strong>
                <span>Royal Mail International • 5-10 days</span>
              </div>
            </div>
            <div className="delivery-item">
              <RefreshCw size={18} />
              <div>
                <strong>Easy Returns</strong>
                <span>14 days return policy</span>
              </div>
            </div>
            <div className="delivery-item">
              <Shield size={18} />
              <div>
                <strong>Secure Payment</strong>
                <span>100% secure transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="product-tabs">
        <div className="container">
          <div className="tab-headers">
            <button className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>
              Description
            </button>
            <button className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>
              Product Details
            </button>
            <button className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`} onClick={() => setActiveTab('shipping')}>
              Shipping Info
            </button>
            <button className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>
              Returns & Refund
            </button>
            {/* <button className={`tab-btn ${activeTab === 'size-guide' ? 'active' : ''}`} onClick={() => setActiveTab('size-guide')}>
              Size Guide
            </button> */}
          </div>

          <div className="tab-content">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="description-content">
                <h3>Product Description</h3>
                <p>{productDescription}</p>
                
                {product.material && (
                  <div className="product-detail-item">
                    <strong>Material:</strong> {product.material}
                  </div>
                )}
                
                <div className="features-list">
                  <h4>Key Features:</h4>
                  <ul>
                    <li><Sparkles size={14} /> Premium quality craftsmanship</li>
                    <li><Award size={14} /> Authentic traditional design</li>
                    <li><CheckCircle size={14} /> Comfortable fit</li>
                    <li><CheckCircle size={14} /> Durable material</li>
                    <li><CheckCircle size={14} /> Perfect for special occasions</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Product Details Tab */}
            {activeTab === 'details' && (
              <div className="specifications-content">
                <table className="specs-table">
                  <tbody>
                    <tr>
                      <td>Product Name</td>
                      <td>{product.name}</td>
                    </tr>
                    <tr>
                      <td>Category</td>
                      <td>{product.category}</td>
                    </tr>
                    {product.material && (
                      <tr>
                        <td>Material</td>
                        <td>{product.material}</td>
                      </tr>
                    )}
                    {product.origin && (
                      <tr>
                        <td>Origin</td>
                        <td>{product.origin}</td>
                      </tr>
                    )}
                    {product.style && (
                      <tr>
                        <td>Style</td>
                        <td>{product.style}</td>
                      </tr>
                    )}
                    {product.sleeveLength && (
                      <tr>
                        <td>Sleeve Length</td>
                        <td>{product.sleeveLength}</td>
                      </tr>
                    )}
                    {product.brand && (
                      <tr>
                        <td>Brand</td>
                        <td>{product.brand}</td>
                      </tr>
                    )}
                    {product.sizes?.length > 0 && (
                      <tr>
                        <td>Available Sizes</td>
                        <td>{product.sizes.join(', ')}</td>
                      </tr>
                    )}
                    {product.colors?.length > 0 && (
                      <tr>
                        <td>Available Colors</td>
                        <td>{product.colors.join(', ')}</td>
                      </tr>
                    )}
                    <tr>
                      <td>Stock Status</td>
                      <td className={inStock ? 'in-stock-text' : 'out-stock-text'}>
                        {inStock ? 'In Stock' : 'Out of Stock'}
                      </td>
                    </tr>
                    <tr>
                      <td>SKU</td>
                      <td>{product.sku || `FI-${product._id}`}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Shipping Info Tab */}
            {activeTab === 'shipping' && (
              <div className="shipping-content">
                <h3>Shipping Information</h3>
                
                <div className="shipping-card">
                  <h4><Truck size={18} /> United Kingdom (FREE Shipping)</h4>
                  <ul>
                    <li><CheckCircle size={14} /> Free Royal Mail Tracked 48</li>
                    <li><Clock size={14} /> Delivery: 2-4 business days</li>
                    <li><CheckCircle size={14} /> Tracking number provided</li>
                    <li><CheckCircle size={14} /> Free on all orders</li>
                  </ul>
                </div>

                <div className="shipping-card">
                  <h4><Globe size={18} /> International Shipping</h4>
                  <ul>
                    <li><CheckCircle size={14} /> Royal Mail International Tracked</li>
                    <li><Clock size={14} /> Delivery: 5-10 business days</li>
                    <li><CheckCircle size={14} /> Full tracking available</li>
                    <li><Info size={14} /> Shipping costs calculated at checkout</li>
                  </ul>
                </div>

                <div className="shipping-countries">
                  <h4>We Ship To:</h4>
                  <div className="country-grid">
                    {countries.map((country) => (
                      <div key={country.code} className="country-item">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                        <button 
                          className="country-rate-btn"
                          onClick={() => handleShippingClick(country.code)}
                        >
                          Check Rate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="shipping-note">
                  <p>
                    <Info size={16} />
                    For accurate shipping rates, please visit:{' '}
                    <a 
                      href={`https://send.royalmail.com/?compensation=250&country=${selectedCountry || 'DEU'}&format=SmallParcel&service=ITROLP&weight=1000&weightUnit=G`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="royal-mail-link"
                    >
                      Royal Mail Send
                    </a>
                  </p>
                  <p className="shipping-instruction">
                    To get an accurate quote, please first select your destination country. 
                    Then, select "Small Parcel" for weights up to 2kg, or "Medium Parcel" for weights between 3kg and 20kg.
                  </p>
                </div>
              </div>
            )}

            {/* Returns & Refund Tab */}
            {activeTab === 'returns' && (
              <div className="returns-content">
                <h3>Returns & Refund Policy</h3>
                
                <div className="policy-card">
                  <h4><RefreshCw size={18} /> 14-Day Return Policy</h4>
                  <p>We want you to be completely satisfied with your purchase. If for any reason you are not happy, you can return your item within 14 days of receipt.</p>
                </div>

                <div className="policy-card">
                  <h4><CheckCircle size={18} /> Conditions for Returns</h4>
                  <ul>
                    <li>Items must be unused and in original condition</li>
                    <li>All tags and packaging must be intact</li>
                    <li>Proof of purchase required</li>
                    <li>Return shipping costs are the customer's responsibility</li>
                  </ul>
                </div>

                <div className="policy-card">
                  <h4><Shield size={18} /> Refund Process</h4>
                  <ul>
                    <li>Refunds processed within 5-7 business days</li>
                    <li>Refund issued to original payment method</li>
                    <li>Shipping costs are non-refundable</li>
                    <li>You will receive a confirmation email</li>
                  </ul>
                </div>

                <div className="policy-card">
                  <h4><MessageCircle size={18} /> Need Help?</h4>
                  <div className="contact-info">
                    <div className="contact-item">
                      <Mail size={16} />
                      <span>qasrelibasltd@gmail.com</span>
                    </div>
                    <div className="contact-item">
                      <Phone size={16} />
                      <span>+44 7460816860</span>
                    </div>
                    <div className="contact-item">
                      <MessageCircle size={16} />
                      <span>Live Chat - Available 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Size Guide Tab */}
            {/* {activeTab === 'size-guide' && (
              <div className="size-guide-content">
                <h3>Size Guide</h3>
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest (inches)</th>
                      <th>Waist (inches)</th>
                      <th>Hips (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Small</td><td>34-36</td><td>28-30</td><td>34-36</td></tr>
                    <tr><td>Medium</td><td>38-40</td><td>32-34</td><td>38-40</td></tr>
                    <tr><td>Large</td><td>42-44</td><td>36-38</td><td>42-44</td></tr>
                    <tr><td>X-Large</td><td>46-48</td><td>40-42</td><td>46-48</td></tr>
                    <tr><td>XX-Large</td><td>50-52</td><td>44-46</td><td>50-52</td></tr>
                  </tbody>
                </table>
                <p className="size-note">Note: Measurements are approximate. For the best fit, please refer to our size guide or contact customer support.</p>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Shipping Modal */}
      {showShippingModal && (
        <div className="shipping-modal-overlay" onClick={() => setShowShippingModal(false)}>
          <div className="shipping-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowShippingModal(false)}>✕</button>
            <h3><Truck size={20} /> Shipping to {countries.find(c => c.code === selectedCountry)?.name}</h3>
            
            <div className="shipping-details">
              {selectedCountry === 'UK' ? (
                <>
                  <div className="shipping-method">
                    <strong>Method:</strong> Royal Mail Tracked 48
                  </div>
                  <div className="shipping-cost">
                    <strong>Cost:</strong> FREE
                  </div>
                  <div className="shipping-time">
                    <strong>Delivery Time:</strong> 2-4 business days
                  </div>
                  <div className="shipping-tracking">
                    <strong>Tracking:</strong> ✓ Included
                  </div>
                </>
              ) : (
                <>
                  <div className="shipping-method">
                    <strong>Method:</strong> Royal Mail International Tracked
                  </div>
                  <div className="shipping-cost">
                    <strong>Cost:</strong> Calculated at checkout
                  </div>
                  <div className="shipping-time">
                    <strong>Delivery Time:</strong> 5-10 business days
                  </div>
                  <div className="shipping-tracking">
                    <strong>Tracking:</strong> ✓ Included
                  </div>
                  <div className="shipping-rate-link">
                    <a 
                      href={`https://send.royalmail.com/?compensation=250&country=${selectedCountry}&format=SmallParcel&service=ITROLP&weight=1000&weightUnit=G`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="royal-mail-link"
                    >
                      <Package size={16} /> Get Exact Shipping Rate
                    </a>
                  </div>
                </>
              )}
            </div>

            <div className="shipping-note-modal">
              <p>
                <Info size={14} />
                For the most accurate shipping quote, visit the Royal Mail website.
                Select your destination country, parcel size, and weight.
              </p>
            </div>

            <button className="shipping-modal-close" onClick={() => setShowShippingModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;