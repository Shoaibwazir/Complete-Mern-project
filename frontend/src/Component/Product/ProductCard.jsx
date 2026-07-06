import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Heart, ShoppingCart, Star, StarHalf, Zap } from 'lucide-react';
import { addToCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import { getProductImage } from '../../utils/imageUrl';
import './ProductCard.css';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [wishlisted, setWishlisted] = useState(false);
  const [adding, setAdding] = useState(false);

  if (!product?._id) return null;

  const productImage = getProductImage(product);

  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  const renderStars = (rating = 0) => {
    const stars = [];
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    for (let i = 0; i < full; i++) {
      stars.push(<Star key={`f-${i}`} size={12} fill="#b8860b" stroke="#b8860b" />);
    }
    if (half) {
      stars.push(<StarHalf key="half" size={12} fill="#b8860b" stroke="#b8860b" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`e-${i}`} size={12} stroke="#ddd" />);
    }
    return stars;
  };

  const handleNavigate = () => navigate(`/product/${product._id}`);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setAdding(true);

    dispatch(
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: productImage,
        quantity: 1,
        stock: product.stock || 10,
        category: product.category,
      })
    );

    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAdding(false), 300);
  };

  const handleBuyNow = (e) => {
    e.stopPropagation();
    navigate('/checkout', {
      state: {
        buyNow: true,
        product: {
          _id: product._id,
          name: product.name,
          price: product.price,
          image: productImage,
          quantity: 1,
        },
      },
    });
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setWishlisted((prev) => !prev);
    toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <article
      className={`shop-product-card ${viewMode}`}
      onClick={handleNavigate}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleNavigate()}
    >
      <div className="shop-product-image-wrap">
        {discount > 0 && <span className="shop-badge discount">-{discount}%</span>}
        {product.isNew && <span className="shop-badge new">New</span>}

        <button
          type="button"
          className={`shop-wishlist-btn ${wishlisted ? 'active' : ''}`}
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
        >
          <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        <img
          src={productImage}
          alt={product.name}
          className="shop-product-image"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="shop-product-body">
        <div className="shop-product-meta">
          <span className="shop-product-material">{product.material || 'Premium'}</span>
          <div className="shop-product-rating">
            {renderStars(product.rating)}
            <span>({product.reviews || 0})</span>
          </div>
        </div>

        <h3 className="shop-product-name">{product.name}</h3>

        <div className="shop-product-pricing">
          <span className="shop-current-price">£{product.price?.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="shop-old-price">£{product.originalPrice?.toFixed(2)}</span>
          )}
        </div>

        <div className="shop-product-actions">
          <button
            type="button"
            className="shop-add-btn"
            onClick={handleAddToCart}
            disabled={adding}
          >
            <ShoppingCart size={16} />
            {adding ? 'Adding…' : 'Add to Cart'}
          </button>
          <button type="button" className="shop-buy-btn" onClick={handleBuyNow}>
            <Zap size={16} />
            Buy
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
