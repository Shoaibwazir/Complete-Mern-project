import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag,
  ArrowLeft,
  Tag,
  Truck,
  Shield,
  CreditCard,
  ArrowRight,
  AlertCircle,
  Key,
  CalendarDays,
  Edit2,
  X,
  Save,
  Clock,
  Calendar
} from 'lucide-react';
import { addToCart, removeFromCart, clearCart, updateCartQuantity } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUrl';
import couponService from './../../../../Backend/services/couponService';
import './CartPage.css';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { items: reduxItems } = useSelector((state) => state.cart || { items: [] });
  const { userInfo } = useSelector((state) => state.auth || {});
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  
  // ✅ Edit state
  const [editingItem, setEditingItem] = useState(null);
  const [editRentalDays, setEditRentalDays] = useState(1);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editCollectionDate, setEditCollectionDate] = useState('');
  const [editReturnDate, setEditReturnDate] = useState('');

  // Load cart from Redux
  useEffect(() => {
    setLoading(true);
    
    if (reduxItems && reduxItems.length > 0) {
      setCartItems(reduxItems);
    } else {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            setCartItems(parsedCart);
            parsedCart.forEach(item => {
              dispatch(addToCart(item));
            });
          } else {
            setCartItems([]);
          }
        } catch (e) {
          console.error('Error parsing cart:', e);
          setCartItems([]);
        }
      } else {
        setCartItems([]);
      }
    }
    
    setLoading(false);
  }, [reduxItems, dispatch]);

  // Fetch available coupons
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await couponService.getActiveCoupons();
        if (response.success) {
          setAvailableCoupons(response.data?.regular || []);
        }
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };
    fetchCoupons();
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cartItems]);

  // ✅ Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    
    dispatch(updateCartQuantity({ id: productId, quantity: newQuantity }));
    
    const updatedItems = cartItems.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
  };

  // ✅ Remove item
  const removeItem = (productId) => {
    dispatch(removeFromCart(productId));
    const updatedItems = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedItems);
    toast.success('Item removed from cart');
  };

  // ✅ Clear all items
  const clearAllItems = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
      setCartItems([]);
      localStorage.removeItem('cart');
      toast.success('Cart cleared');
    }
  };

  // ✅ Start editing an item
  const startEditing = (item) => {
    setEditingItem(item._id);
    setEditQuantity(item.quantity || 1);
    setEditRentalDays(item.rentalDays || 1);
    setEditCollectionDate(item.collectionDate || '');
    setEditReturnDate(item.returnDate || '');
  };

  // ✅ Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
  };

  // ✅ Save edited item
  const saveEdit = (item) => {
    const updatedItem = {
      ...item,
      quantity: editQuantity,
      rentalDays: editRentalDays,
      collectionDate: editCollectionDate,
      returnDate: editReturnDate,
      // Recalculate rental total if rental
      rentalTotal: item.isRental ? (item.rentalPricePerDay || item.price) * editRentalDays * editQuantity : undefined,
      totalWithDeposit: item.isRental ? ((item.rentalPricePerDay || item.price) * editRentalDays * editQuantity) + (item.deposit || 0) : undefined,
    };

    // Remove old item from Redux
    dispatch(removeFromCart(item._id));
    
    // Add updated item to Redux
    dispatch(addToCart(updatedItem));
    
    // Update local state
    const updatedItems = cartItems.map(cartItem =>
      cartItem._id === item._id ? updatedItem : cartItem
    );
    setCartItems(updatedItems);
    
    setEditingItem(null);
    toast.success('Item updated successfully!');
  };

  // ✅ Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      let price = item.price || 0;
      
      if (item.isRental && item.rentalTotal) {
        price = item.rentalTotal;
      } else if (item.isRental && item.rentalPricePerDay) {
        price = item.rentalPricePerDay * (item.rentalDays || 1);
      }
      
      return sum + (price * (item.quantity || 1));
    }, 0);
  };

  const calculateDiscount = () => {
    return discount;
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal() - calculateDiscount();
    if (subtotal >= 50) return 0;
    return 4.99;
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateShipping();
  };

  // ✅ Apply coupon
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    try {
      const cartTotal = calculateSubtotal();
      const response = await couponService.validateCoupon(
        couponCode,
        cartTotal,
        userInfo?._id || null
      );

      if (response.success) {
        setDiscount(response.data.discountAmount);
        setAppliedCoupon(couponCode.toUpperCase());
        toast.success(response.data.message || 'Coupon applied successfully!');
      } else {
        toast.error(response.message || 'Invalid coupon code');
      }
    } catch (error) {
      console.error('Coupon error:', error);
      toast.error('Failed to apply coupon. Please try again.');
    } finally {
      setCouponLoading(false);
      setCouponCode('');
    }
  };

  // ✅ Remove coupon
  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon('');
    toast.success('Coupon removed');
  };

  // ✅ Quick apply coupon
  const quickApplyCoupon = (code) => {
    setCouponCode(code);
    setTimeout(() => {
      applyCoupon();
    }, 100);
  };

  // ✅ Get item display price
  const getItemDisplayPrice = (item) => {
    if (item.isRental && item.rentalTotal) {
      return item.rentalTotal;
    }
    if (item.isRental && item.rentalPricePerDay) {
      return item.rentalPricePerDay * (item.rentalDays || 1);
    }
    return item.price || 0;
  };

  // ✅ Get item total
  const getItemTotal = (item) => {
    return getItemDisplayPrice(item) * (item.quantity || 1);
  };

  // ✅ Get rental period text
  const getRentalPeriod = (item) => {
    if (item.isRental && item.rentalDays) {
      return `${item.rentalDays} day${item.rentalDays > 1 ? 's' : ''}`;
    }
    return null;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    navigate('/checkout');
  };

  // ✅ Get today's date for date inputs
  const getTodayStr = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Loading state
  if (loading) {
    return (
      <div className="cart-loading">
        <div className="loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any items to your cart yet.</p>
        <div className="empty-cart-buttons">
          <Link to="/rental-shop" className="continue-shopping-btn">
            Browse Rental Collection <ArrowRight size={16} />
          </Link>
          <Link to="/" className="shop-men-btn">
            Back to Home
          </Link>
        </div>
        <div className="featured-categories">
          <h4>Quick Links</h4>
          <div className="category-links">
            <Link to="/rental-shop">Rental Collection</Link>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        {/* Header */}
        <div className="cart-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={20} /> Back
          </button>
          <h1>Shopping Cart</h1>
          <p className="cart-count">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
        </div>

        <div className="cart-content">
          {/* Left Column - Cart Items */}
          <div className="cart-items-section">
            {/* Cart Items Header */}
            <div className="cart-items-header">
              <div className="product-info-col">Product</div>
              <div className="product-price-col">Price</div>
              <div className="product-quantity-col">Quantity</div>
              <div className="product-total-col">Total</div>
              <div className="product-actions-col">Actions</div>
            </div>

            {/* Cart Items List */}
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const displayPrice = getItemDisplayPrice(item);
                const itemTotal = getItemTotal(item);
                const rentalPeriod = getRentalPeriod(item);
                const isEditing = editingItem === item._id;

                return (
                  <div key={item._id} className={`cart-item ${isEditing ? 'editing' : ''}`}>
                    <div className="cart-item-product">
                      <div className="item-image">
                        <img 
                          src={getImageUrl(item.image || item.images?.[0]?.url)} 
                          alt={item.name}
                          onError={(e) => {
                            e.target.src = '/placeholder-image.jpg';
                          }}
                        />
                        {item.isRental && (
                          <div className="item-rental-badge">
                            <Key size={12} /> Rental
                          </div>
                        )}
                      </div>
                      <div className="item-details">
                        <h3>{item.name}</h3>
                        {item.category && <p className="item-category">{item.category}</p>}
                        
                        {item.isRental && rentalPeriod && (
                          <p className="item-rental-info">
                            <CalendarDays size={14} />
                            Rental: {rentalPeriod} at £{item.rentalPricePerDay?.toFixed(2) || item.price?.toFixed(2)}/day
                          </p>
                        )}
                        
                        {item.isRental && item.deposit && (
                          <p className="item-deposit-info">
                            <Shield size={14} />
                            Security Deposit: £{item.deposit.toFixed(2)}
                          </p>
                        )}
                        
                        {item.selectedColor && <p className="item-color">Color: {item.selectedColor}</p>}
                        {item.selectedSize && <p className="item-size">Size: {item.selectedSize}</p>}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="cart-item-price">
                      {isEditing ? (
                        <div className="edit-price-info">
                          <span className="price-label">Per Day:</span>
                          <span className="price-value">
                            £{item.rentalPricePerDay?.toFixed(2) || item.price?.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        item.isRental ? (
                          <div className="rental-price-display">
                            <span className="price-main">£{displayPrice.toFixed(2)}</span>
                            <span className="price-period">/ {item.rentalDays || 1} day{item.rentalDays > 1 ? 's' : ''}</span>
                          </div>
                        ) : (
                          `£${displayPrice.toFixed(2)}`
                        )
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="cart-item-quantity">
                      {isEditing ? (
                        <div className="edit-quantity-group">
                          <button 
                            onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                            disabled={editQuantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span>{editQuantity}</span>
                          <button 
                            onClick={() => setEditQuantity(editQuantity + 1)}
                            disabled={editQuantity >= 5}
                          >
                            <Plus size={14} />
                          </button>
                          {item.isRental && (
                            <div className="edit-rental-days">
                              <Clock size={12} />
                              <button 
                                onClick={() => setEditRentalDays(Math.max(1, editRentalDays - 1))}
                                disabled={editRentalDays <= 1}
                              >
                                <Minus size={12} />
                              </button>
                              <span>{editRentalDays} days</span>
                              <button 
                                onClick={() => setEditRentalDays(Math.min(30, editRentalDays + 1))}
                                disabled={editRentalDays >= 30}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          )}
                          {item.isRental && (
                            <div className="edit-dates">
                              <Calendar size={12} />
                              <input
                                type="date"
                                value={editCollectionDate || getTodayStr()}
                                onChange={(e) => setEditCollectionDate(e.target.value)}
                                min={getTodayStr()}
                              />
                              <span>to</span>
                              <input
                                type="date"
                                value={editReturnDate || getTodayStr()}
                                onChange={(e) => setEditReturnDate(e.target.value)}
                                min={editCollectionDate || getTodayStr()}
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span>{item.quantity || 1}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                            disabled={(item.quantity || 1) >= (item.stock || 99)}
                          >
                            <Plus size={14} />
                          </button>
                        </>
                      )}
                    </div>

                    {/* Total */}
                    <div className="cart-item-total">
                      {isEditing ? (
                        <div className="edit-total-preview">
                          <div className="total-amount">
                            £{(item.rentalPricePerDay || item.price) * editRentalDays * editQuantity}
                          </div>
                          {item.isRental && item.deposit && (
                            <div className="total-deposit">
                              +£{item.deposit} deposit
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div className="total-amount">
                            £{itemTotal.toFixed(2)}
                          </div>
                          {item.isRental && item.deposit && (
                            <div className="total-deposit">
                              +£{item.deposit.toFixed(2)} deposit
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="cart-item-actions">
                      {isEditing ? (
                        <div className="edit-actions">
                          <button 
                            className="save-edit-btn"
                            onClick={() => saveEdit(item)}
                            title="Save changes"
                          >
                            <Save size={18} />
                          </button>
                          <button 
                            className="cancel-edit-btn"
                            onClick={cancelEditing}
                            title="Cancel editing"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ) : (
                        <div className="view-actions">
                          <button 
                            className="edit-item-btn"
                            onClick={() => startEditing(item)}
                            title="Edit item"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            className="remove-item-btn"
                            onClick={() => removeItem(item._id)} 
                            title="Remove item"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="cart-actions">
              <Link to="/rental-shop" className="continue-shopping-link">
                ← Continue Shopping
              </Link>
              <button onClick={clearAllItems} className="clear-cart-btn">
                Clear Cart
              </button>
            </div>

            {/* Coupon Section */}
            <div className="coupon-section">
              <div className="coupon-header">
                <Tag size={18} />
                <span>Apply Coupon Code</span>
              </div>
              <div className="coupon-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                  disabled={couponLoading}
                />
                <button onClick={applyCoupon} disabled={couponLoading}>
                  {couponLoading ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {appliedCoupon && (
                <div className="applied-coupon">
                  <span>✅ Coupon {appliedCoupon} applied!</span>
                  <button onClick={removeCoupon}>Remove</button>
                </div>
              )}
              
              {availableCoupons.length > 0 && (
                <div className="coupon-hint">
                  <p>Available Coupons:</p>
                  <div className="coupon-examples">
                    {availableCoupons.map((coupon) => (
                      <span 
                        key={coupon._id}
                        onClick={() => quickApplyCoupon(coupon.code)}
                        className="coupon-tag"
                        title={`${coupon.description}${coupon.minOrderAmount > 0 ? ` (Min. £${coupon.minOrderAmount})` : ''}`}
                      >
                        {coupon.code}
                        {coupon.type === 'percentage' && ` (${coupon.value}% off)`}
                        {coupon.type === 'fixed' && ` (£${coupon.value} off)`}
                        {coupon.type === 'free_shipping' && ' (Free Shipping)'}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="cart-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>£{calculateSubtotal().toFixed(2)}</span>
            </div>
            
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount {appliedCoupon && `(${appliedCoupon})`}</span>
                <span>-£{discount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>{calculateShipping() === 0 ? 'FREE' : `£${calculateShipping().toFixed(2)}`}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row total">
              <span>Total</span>
              <span>£{calculateTotal().toFixed(2)}</span>
            </div>

            {/* Show deposit summary for rental items */}
            {cartItems.some(item => item.isRental && item.deposit) && (
              <div className="deposit-summary">
                <Shield size={14} />
                <span>Total Security Deposit: </span>
                <strong>
                  £{cartItems
                    .filter(item => item.isRental && item.deposit)
                    .reduce((sum, item) => sum + (item.deposit || 0), 0)
                    .toFixed(2)}
                </strong>
                <small>(Refundable upon return)</small>
              </div>
            )}

            {/* Free Shipping Progress */}
            {calculateSubtotal() - calculateDiscount() < 50 && (
              <div className="free-shipping-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${((calculateSubtotal() - calculateDiscount()) / 50) * 100}%` }}
                  ></div>
                </div>
                <p>
                  Spend £{(50 - (calculateSubtotal() - calculateDiscount())).toFixed(2)} more for 
                  <strong> FREE UK shipping!</strong>
                </p>
              </div>
            )}

            <button onClick={handleCheckout} className="checkout-btn">
              Proceed to Checkout <ArrowRight size={18} />
            </button>

            <div className="secure-checkout">
              <Shield size={14} />
              <span>Secure Checkout</span>
              <CreditCard size={14} />
            </div>

            <div className="shipping-info">
              <Truck size={16} />
              <div>
                <strong>Free UK shipping on orders over £50</strong>
                <p>Standard delivery 2-3 business days</p>
              </div>
            </div>

            <div className="payment-methods">
              <span>We accept:</span>
              <div className="payment-icons">
                <span>💳 Visa</span>
                <span>💳 Mastercard</span>
                <span>📱 PayPal</span>
                <span>🍎 Apple Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;