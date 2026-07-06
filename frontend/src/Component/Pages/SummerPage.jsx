import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart, 
  FaHeart, FaRegHeart, FaFilter, FaTimes, FaEye, FaBolt 
} from 'react-icons/fa';
import { addToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import './SummerPage.css';

const SummerPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [wishlist, setWishlist] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  const [notification, setNotification] = useState(null);

  const summerProducts = [
    {
      id: 1,
      name: "Flowing Maxi Dress",
      price: 89.99,
      oldPrice: 129.99,
      discount: 31,
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500",
      category: "dresses",
      rating: 4.8,
      reviews: 124,
      colors: ["Peach", "Sky Blue", "White"],
      material: "Cotton Blend",
      isNew: true
    },
    {
      id: 2,
      name: "Linen Summer Shirt",
      price: 49.99,
      oldPrice: 79.99,
      discount: 38,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
      category: "tops",
      rating: 4.6,
      reviews: 89,
      colors: ["White", "Beige", "Light Blue"],
      material: "Linen",
      isNew: false
    },
    {
      id: 3,
      name: "Beach Cover Up",
      price: 39.99,
      oldPrice: 59.99,
      discount: 33,
      image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500",
      category: "beachwear",
      rating: 4.5,
      reviews: 56,
      colors: ["Turquoise", "Coral", "Yellow"],
      material: "Chiffon",
      isNew: true
    },
    {
      id: 4,
      name: "Summer Sandals",
      price: 59.99,
      oldPrice: 89.99,
      discount: 33,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500",
      category: "footwear",
      rating: 4.7,
      reviews: 203,
      colors: ["Tan", "White", "Gold"],
      material: "Leather",
      isNew: false
    },
    {
      id: 5,
      name: "Straw Sun Hat",
      price: 29.99,
      oldPrice: 49.99,
      discount: 40,
      image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=500",
      category: "accessories",
      rating: 4.4,
      reviews: 78,
      colors: ["Natural", "Black", "Navy"],
      material: "Straw",
      isNew: true
    },
    {
      id: 6,
      name: "Summer Tote Bag",
      price: 49.99,
      oldPrice: 79.99,
      discount: 38,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500",
      category: "bags",
      rating: 4.9,
      reviews: 112,
      colors: ["Straw", "White", "Natural"],
      material: "Straw",
      isNew: false
    },
    {
      id: 7,
      name: "Tropical Print Shorts",
      price: 34.99,
      oldPrice: 54.99,
      discount: 36,
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500",
      category: "bottoms",
      rating: 4.6,
      reviews: 67,
      colors: ["Multi", "Blue", "Pink"],
      material: "Polyester",
      isNew: true
    },
    {
      id: 8,
      name: "Sunglasses Set",
      price: 24.99,
      oldPrice: 44.99,
      discount: 44,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
      category: "accessories",
      rating: 4.8,
      reviews: 145,
      colors: ["Black", "Tortoise", "Gold"],
      material: "Plastic",
      isNew: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All', count: summerProducts.length },
    { id: 'dresses', name: 'Dresses', count: summerProducts.filter(p => p.category === 'dresses').length },
    { id: 'tops', name: 'Tops', count: summerProducts.filter(p => p.category === 'tops').length },
    { id: 'bottoms', name: 'Bottoms', count: summerProducts.filter(p => p.category === 'bottoms').length },
    { id: 'beachwear', name: 'Beachwear', count: summerProducts.filter(p => p.category === 'beachwear').length },
    { id: 'footwear', name: 'Footwear', count: summerProducts.filter(p => p.category === 'footwear').length },
    { id: 'accessories', name: 'Accessories', count: summerProducts.filter(p => p.category === 'accessories').length },
    { id: 'bags', name: 'Bags', count: summerProducts.filter(p => p.category === 'bags').length },
  ];

  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? summerProducts 
    : summerProducts.filter(p => p.category === selectedCategory);

  // Sort products
  const sortedProducts = [...filteredProducts];
  if (sortBy === 'price-low') sortedProducts.sort((a, b) => a.price - b.price);
  if (sortBy === 'price-high') sortedProducts.sort((a, b) => b.price - a.price);
  if (sortBy === 'rating') sortedProducts.sort((a, b) => b.rating - a.rating);
  if (sortBy === 'discount') sortedProducts.sort((a, b) => b.discount - a.discount);
  if (sortBy === 'newest') sortedProducts.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);

  // Toggle wishlist
  const toggleWishlist = (productId, e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [productId]: !prev[productId] }));
    toast.success(wishlist[productId] ? 'Removed from wishlist' : 'Added to wishlist');
  };

  // Handle Add to Cart
const handleAddToCart = (e, product) => {
  e.preventDefault();
  e.stopPropagation();
  
  setAddingToCart(prev => ({ ...prev, [product.id]: true }));
  
  const cartItem = {
    _id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity: 1,
    stock: 10,
    category: product.category,
    size: '',
    color: ''
  };
  
  // Dispatch to Redux
  dispatch(addToCart(cartItem));
  
  // Show success message
  toast.success(`${product.name} added to cart!`);
  
  // Debug: Check if item is added
  console.log('Added to cart:', cartItem);
  
  setAddingToCart(prev => ({ ...prev, [product.id]: false }));
};

  // Handle Buy Now
  const handleBuyNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const buyNowItem = {
      _id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.oldPrice,
      image: product.image,
      quantity: 1,
      category: product.category
    };
    
    localStorage.setItem('buyNowItem', JSON.stringify(buyNowItem));
    toast.success('Redirecting to checkout...');
    navigate('/checkout', { state: { buyNow: true, product: buyNowItem } });
  };

  // Handle Product Click
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Handle Quick View
  const handleQuickView = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info(`Quick view: ${product.name}`);
    // You can open a modal here
  };

  // Render Stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${i}`} className="star-filled" />);
    if (hasHalfStar) stars.push(<FaStarHalfAlt key="half" className="star-half" />);
    for (let i = stars.length; i < 5; i++) stars.push(<FaRegStar key={`empty-${i}`} className="star-empty" />);
    return stars;
  };

  return (
    <div className="summer-page">
      {/* Cart Notification Toast */}
      {notification && (
        <div className="cart-notification">
          <div className="notification-content">
            <span>✅</span>
            <p>{notification.product.name} added to cart!</p>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="summer-hero">
        <div className="hero-backdrop"></div>
        <div className="hero-content">
          <h1 className="hero-title">☀️ SUMMER COLLECTION 2024</h1>
          <p className="hero-subtitle">Embrace the sunshine with our hottest styles</p>
          <div className="hero-offer">
            <span className="offer-badge">✨ Up to 40% OFF</span>
            <span className="offer-badge">🚚 Free Shipping</span>
            <span className="offer-badge">⏰ Limited Time</span>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="category-tabs">
        <div className="container">
          <button className="mobile-filter-btn" onClick={() => setShowFilters(true)}>
            <FaFilter /> Filter & Sort
          </button>
          <div className="tabs-wrapper">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`tab-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name} <span className="count">{cat.count}</span>
              </button>
            ))}
          </div>
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="featured">⭐ Featured</option>
            <option value="newest">🆕 Newest First</option>
            <option value="price-low">💰 Price: Low to High</option>
            <option value="price-high">💰 Price: High to Low</option>
            <option value="rating">🌟 Highest Rated</option>
            <option value="discount">🔥 Biggest Discount</option>
          </select>
        </div>
      </section>

      {/* Products Grid */}
      <section className="products-section">
        <div className="container">
          <div className="products-grid">
            {sortedProducts.map(product => (
              <div 
                key={product.id} 
                className="product-card-home"
                onClick={() => handleProductClick(product.id)}
              >
                {/* Badges */}
                <div className="product-badges">
                  {product.discount > 0 && <span className="badge discount">-{product.discount}%</span>}
                  {product.isNew && <span className="badge new">NEW</span>}
                </div>

                {/* Wishlist Button */}
                <button className="wishlist-btn-home" onClick={(e) => toggleWishlist(product.id, e)}>
                  {wishlist[product.id] ? <FaHeart className="active" /> : <FaHeart />}
                </button>

                {/* Product Image */}
                <div className="product-image-wrapper">
                  <img src={product.image} alt={product.name} className="product-img-home" />
                  <div className="product-actions-overlay">
                    <button className="action-btn-home" onClick={(e) => handleQuickView(e, product)}>
                      <FaEye /> Quick View
                    </button>
                    <button 
                      className="action-btn-home" 
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingToCart[product.id]}
                    >
                      <FaShoppingCart /> {addingToCart[product.id] ? 'Adding...' : 'Add'}
                    </button>
                    <button className="action-btn-home buy-now" onClick={(e) => handleBuyNow(e, product)}>
                      <FaBolt /> Buy Now
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="product-info-home">
                  <div className="product-meta-home">
                    <span className="product-material">{product.material}</span>
                    <div className="product-rating-home">
                      {renderStars(product.rating)}
                      <span className="rating-count">({product.reviews})</span>
                    </div>
                  </div>
                  <h3 className="product-title-home">{product.name}</h3>
                  <div className="product-price-home">
                    <span className="current-price">£{product.price.toFixed(2)}</span>
                    <span className="old-price">£{product.oldPrice.toFixed(2)}</span>
                    <span className="save-price">Save £{(product.oldPrice - product.price).toFixed(0)}</span>
                  </div>
                  <div className="button-group-home">
                    <button 
                      className="add-to-cart-home" 
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={addingToCart[product.id]}
                    >
                      <FaShoppingCart /> {addingToCart[product.id] ? 'Adding...' : 'Add to Cart'}
                    </button>
                    <button className="buy-now-home" onClick={(e) => handleBuyNow(e, product)}>
                      <FaBolt /> Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile Filter Sidebar */}
      {showFilters && (
        <>
          <div className="filter-overlay active" onClick={() => setShowFilters(false)}></div>
          <div className="mobile-filters active">
            <div className="filter-header">
              <h3>Filter Products</h3>
              <button onClick={() => setShowFilters(false)}><FaTimes /></button>
            </div>
            <div className="filter-group">
              <h4>Categories</h4>
              {categories.map(cat => (
                <label key={cat.id}>
                  <input type="radio" name="category" checked={selectedCategory === cat.id} onChange={() => setSelectedCategory(cat.id)} />
                  {cat.name} ({cat.count})
                </label>
              ))}
            </div>
            <div className="filter-group">
              <h4>Sort By</h4>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">⭐ Featured</option>
                <option value="newest">🆕 Newest First</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💰 Price: High to Low</option>
                <option value="rating">🌟 Highest Rated</option>
                <option value="discount">🔥 Biggest Discount</option>
              </select>
            </div>
            <button className="apply-filters" onClick={() => setShowFilters(false)}>Apply Filters</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SummerPage;