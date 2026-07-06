import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { 
  FaTrashAlt, 
  FaPlus, 
  FaMinus, 
  FaShoppingCart, 
  FaCreditCard, 
  FaPaypal, 
  FaApplePay,
  FaGooglePay,
  FaLock,
  FaTruck,
  FaUndo,
  FaShieldAlt
} from 'react-icons/fa'
import { removeFromCart, updateCartQuantity, clearCart } from '../../redux/slices/cartSlice'
import toast from 'react-hot-toast'
import './CartPage.css'

const CartPage = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { cartItems } = useSelector((state) => state.cart)
  const { userInfo } = useSelector((state) => state.auth)
  
  const [promoCode, setPromoCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [promoApplied, setPromoApplied] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState('card')
  const [processing, setProcessing] = useState(false)

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = subtotal > 50 ? 0 : 5.99
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax - discount

  // Apply promo code
  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setDiscount(subtotal * 0.1)
      setPromoApplied(true)
      toast.success('Promo code applied! 10% discount')
    } else if (promoCode.toUpperCase() === 'FREESHIP') {
      setDiscount(shipping)
      setPromoApplied(true)
      toast.success('Free shipping applied!')
    } else {
      toast.error('Invalid promo code')
    }
  }

  // Update quantity
  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity < 1) return
    if (newQuantity > 10) {
      toast.error('Maximum 10 items per product')
      return
    }
    dispatch(updateCartQuantity({ id, quantity: newQuantity }))
  }

  // Remove item
  const handleRemoveItem = (id, name) => {
    dispatch(removeFromCart(id))
    toast.success(`${name} removed from cart`)
  }

  // Proceed to checkout
  const handleCheckout = () => {
    if (!userInfo) {
      toast.error('Please login to continue')
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    
    setProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      navigate('/checkout', { 
        state: { 
          cartItems, 
          subtotal, 
          shipping, 
          tax, 
          discount, 
          total,
          paymentMethod: selectedPayment
        } 
      })
    }, 1000)
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-content">
          <FaShoppingCart className="empty-icon" />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any items to your cart yet.</p>
          <Link to="/shop" className="shop-now-btn">Continue Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">Shopping Cart</h1>
        
        <div className="cart-content">
          {/* Cart Items Section */}
          <div className="cart-items-section">
            <div className="cart-header">
              <div className="header-product">Product</div>
              <div className="header-price">Price</div>
              <div className="header-quantity">Quantity</div>
              <div className="header-total">Total</div>
              <div className="header-action"></div>
            </div>

            {cartItems.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-product">
                  <img src={item.image} alt={item.name} className="item-image" />
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    {item.size && <p className="item-meta">Size: {item.size}</p>}
                    {item.color && <p className="item-meta">Color: {item.color}</p>}
                  </div>
                </div>
                
                <div className="item-price">
                  £{item.price.toFixed(2)}
                </div>
                
                <div className="item-quantity">
                  <button 
                    className="qty-btn" 
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                  >
                    <FaMinus />
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button 
                    className="qty-btn" 
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                  >
                    <FaPlus />
                  </button>
                </div>
                
                <div className="item-total">
                  £{(item.price * item.quantity).toFixed(2)}
                </div>
                
                <div className="item-action">
                  <button 
                    className="remove-btn" 
                    onClick={() => handleRemoveItem(item._id, item.name)}
                  >
                    <FaTrashAlt />
                  </button>
                </div>
              </div>
            ))}

            <div className="cart-actions">
              <Link to="/shop" className="continue-shopping">
                ← Continue Shopping
              </Link>
              <button className="clear-cart" onClick={() => dispatch(clearCart())}>
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            {/* Promo Code */}
            <div className="promo-section">
              <input
                type="text"
                placeholder="Promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                disabled={promoApplied}
              />
              <button onClick={applyPromoCode} disabled={promoApplied}>
                Apply
              </button>
            </div>
            
            {/* Price Breakdown */}
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>£{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-£{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
            
            {/* Payment Methods */}
            <div className="payment-methods">
              <h3>Payment Method</h3>
              <div className="payment-options">
                <label className={`payment-option ${selectedPayment === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={selectedPayment === 'card'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <FaCreditCard /> Credit/Debit Card
                </label>
                <label className={`payment-option ${selectedPayment === 'paypal' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={selectedPayment === 'paypal'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <FaPaypal /> PayPal
                </label>
                <label className={`payment-option ${selectedPayment === 'apple' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="apple"
                    checked={selectedPayment === 'apple'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <FaApplePay /> Apple Pay
                </label>
                <label className={`payment-option ${selectedPayment === 'google' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="google"
                    checked={selectedPayment === 'google'}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <FaGooglePay /> Google Pay
                </label>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button 
              className="checkout-btn" 
              onClick={handleCheckout}
              disabled={processing}
            >
              {processing ? (
                <>
                  <span className="spinner"></span>
                  Processing...
                </>
              ) : (
                <>
                  <FaLock /> Proceed to Checkout
                </>
              )}
            </button>
            
            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-item">
                <FaTruck />
                <span>Free Shipping on £50+</span>
              </div>
              <div className="trust-item">
                <FaUndo />
                <span>30-Day Returns</span>
              </div>
              <div className="trust-item">
                <FaShieldAlt />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage