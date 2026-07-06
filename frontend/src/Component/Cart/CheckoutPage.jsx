import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaLock, FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa'
import { clearCart } from '../../redux/slices/cartSlice'
import toast from 'react-hot-toast'
import './CheckoutPage.css'

const CheckoutPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userInfo } = useSelector((state) => state.auth)
  
  const [processing, setProcessing] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  
  const [cartData, setCartData] = useState({
    items: [],
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'card'
  })
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  })

  useEffect(() => {
    // Get data from location state or localStorage
    if (location.state) {
      setCartData({
        items: location.state.cartItems || [],
        subtotal: location.state.subtotal || 0,
        shipping: location.state.shipping || 0,
        tax: location.state.tax || 0,
        discount: location.state.discount || 0,
        total: location.state.total || 0,
        paymentMethod: location.state.paymentMethod || 'card'
      })
    } else {
      // Fallback to localStorage
      const buyNowItem = localStorage.getItem('buyNowItem')
      if (buyNowItem) {
        const item = JSON.parse(buyNowItem)
        setCartData({
          items: [item],
          subtotal: item.price,
          shipping: item.price > 50 ? 0 : 5.99,
          tax: item.price * 0.1,
          discount: 0,
          total: item.price + (item.price > 50 ? 0 : 5.99) + (item.price * 0.1),
          paymentMethod: 'card'
        })
      }
    }
    
    // Pre-fill user info if logged in
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        email: userInfo.email,
        firstName: userInfo.name?.split(' ')[0] || '',
        lastName: userInfo.name?.split(' ')[1] || ''
      }))
    }
  }, [location, userInfo])

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.address) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      setPaymentSuccess(true)
      
      // Clear cart after successful payment
      dispatch(clearCart())
      localStorage.removeItem('buyNowItem')
      
      toast.success('Payment successful! Thank you for your order.')
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/')
      }, 3000)
    }, 2000)
  }

  if (paymentSuccess) {
    return (
      <div className="payment-success">
        <div className="success-content">
          <div className="success-icon">✅</div>
          <h2>Payment Successful!</h2>
          <p>Your order has been placed successfully.</p>
          <p className="order-id">Order ID: ORD-{Date.now()}</p>
          <Link to="/" className="home-btn">Return to Home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        <div className="checkout-content">
          {/* Left Column - Billing Form */}
          <div className="billing-form">
            <h2>Billing Details</h2>
            
            <form onSubmit={handlePayment}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House number and street name"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code *</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Country *</label>
                <select name="country" value={formData.country} onChange={handleInputChange}>
                  <option>United Kingdom</option>
                  <option>United States</option>
                  <option>Canada</option>
                  <option>Australia</option>
                  <option>Germany</option>
                  <option>France</option>
                  <option>Italy</option>
                  <option>Spain</option>
                </select>
              </div>
              
              {/* Payment Details */}
              <div className="payment-section">
                <h3>Payment Method</h3>
                
                <div className="payment-icons">
                  <FaCcVisa />
                  <FaCcMastercard />
                  <FaCcAmex />
                </div>
                
                <div className="form-group">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                  />
                </div>
                
                <div className="form-group">
                  <label>Cardholder Name *</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="Name on card"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV *</label>
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="4"
                    />
                  </div>
                </div>
              </div>
              
              <button type="submit" className="pay-btn" disabled={processing}>
                {processing ? (
                  <>
                    <span className="spinner"></span>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <FaLock /> Pay £{cartData.total.toFixed(2)}
                  </>
                )}
              </button>
            </form>
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="order-summary">
            <h2>Your Order</h2>
            
            <div className="order-items">
              {cartData.items.map((item, index) => (
                <div key={index} className="order-item">
                  <img src={item.image} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    {item.size && <p>Size: {item.size}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                    <p>Quantity: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    £{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>£{cartData.subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{cartData.shipping === 0 ? 'Free' : `£${cartData.shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row">
                <span>Tax (10%)</span>
                <span>£{cartData.tax.toFixed(2)}</span>
              </div>
              {cartData.discount > 0 && (
                <div className="summary-row discount">
                  <span>Discount</span>
                  <span>-£{cartData.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="summary-row total">
                <span>Total</span>
                <span>£{cartData.total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="secure-badge">
              <FaLock /> Secure Payment
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage