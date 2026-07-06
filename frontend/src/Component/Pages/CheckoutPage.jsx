// src/Component/Pages/Checkout/CheckoutPage.jsx
// Updated with International Validation

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
  Truck,
  Shield,
  ArrowLeft,
  CreditCard,
  MapPin,
  User,
  ChevronRight,
  Lock,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Building,
  Landmark,
  AlertCircle,
  Check,
  X,
  Loader2,
  Globe,
  Phone,
  Mail,
  Home,
  Map
} from 'lucide-react';
import { clearCart, removeFromCart } from '../../redux/slices/cartSlice';
import toast from 'react-hot-toast';
import axios from 'axios';
import './CheckoutPage.css';

// ========================================
// ✅ IMPORT INTERNATIONAL VALIDATION
// ========================================
import {
  validateInternationalPhone,
  validateInternationalAddress,
  validateInternationalPostcode,
  validateInternationalCity,
  validateInternationalName,
  validateInternationalEmail,
  getPhoneExample,
  getCountryCode,
  countryList,
  countryPhoneRegex
} from '../../utils/validation';

// ========================================
// STRIPE & PAYPAL CONFIG
// ========================================
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const isValidStripeKey = STRIPE_KEY && 
  STRIPE_KEY !== 'pk_test_your_test_key' && 
  (STRIPE_KEY.startsWith('pk_test_') || STRIPE_KEY.startsWith('pk_live_'));
const stripePromise = isValidStripeKey ? loadStripe(STRIPE_KEY) : null;

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const isValidPayPalId = PAYPAL_CLIENT_ID && 
  PAYPAL_CLIENT_ID !== 'YOUR_REAL_CLIENT_ID' && 
  PAYPAL_CLIENT_ID.length > 10;
const paypalOptions = isValidPayPalId
  ? { clientId: PAYPAL_CLIENT_ID, currency: 'GBP', intent: 'capture' }
  : null;

// ========================================
// PAYMENT STATUS COMPONENT
// ========================================
const PaymentStatus = ({ status, message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (!visible) return null;

  return (
    <div className={`payment-status-overlay ${status}`}>
      <div className="payment-status-card">
        {status === 'processing' && (
          <>
            <Loader2 size={48} className="spinning" />
            <h3>Processing Payment...</h3>
            <p>Please wait while we confirm your payment</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="status-icon success">
              <Check size={48} />
            </div>
            <h3>{message?.includes('pending') ? 'Order Placed!' : 'Payment Successful! 🎉'}</h3>
            <p>{message || 'Your payment has been confirmed'}</p>
            <div className="status-details">
              <div className="status-row">
                <span>Order ID:</span>
                <strong>{localStorage.getItem('lastOrderId') || 'QEL-' + Date.now()}</strong>
              </div>
              <div className="status-row">
                <span>Payment Method:</span>
                <strong>{localStorage.getItem('lastPaymentMethod') || 'Card'}</strong>
              </div>
              <div className="status-row">
                <span>Status:</span>
                <span className={`status-badge ${message?.includes('pending') ? 'pending' : 'paid'}`}>
                  {message?.includes('pending') ? '⏳ PENDING' : '✓ PAID'}
                </span>
              </div>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="status-icon error">
              <X size={48} />
            </div>
            <h3>{message?.includes('Bank') ? 'Bank Verification Failed' : 'Payment Failed'}</h3>
            <p>{message || 'Please try again or use another payment method'}</p>
            <button className="retry-btn" onClick={onClose}>
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ========================================
// BANK TRANSFER SECTION (UPDATED)
// ========================================
const BankTransferSection = ({
  totalAmount,
  orderNumber,
  onConfirm,
  onReject,
  isProcessing,
  customerName,
  customerCountry // ✅ Added
}) => {
  const [clientBankDetails, setClientBankDetails] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    sortCode: '',
  });

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('idle');
  const [verificationResult, setVerificationResult] = useState(null);

  // ✅ Only UK banks support sort code validation
  const isUK = customerCountry === 'United Kingdom';

  const validateMOD11 = (accountNumber, sortCode) => {
    const cleanAccount = accountNumber.replace(/\D/g, '');
    const cleanSortCode = sortCode.replace(/\D/g, '');
    
    if (cleanAccount.length !== 8 || cleanSortCode.length !== 6) {
      return { valid: false, message: 'Invalid length' };
    }
    
    const weights = [0, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    const combined = (cleanSortCode + cleanAccount).split('').map(Number);
    
    let sum = 0;
    for (let i = 0; i < combined.length; i++) {
      sum += combined[i] * weights[i + 1];
    }
    
    const remainder = sum % 11;
    const exceptions = ['12345678', '87654321', '11111111', '22222222', '33333333', '44444444', '55555555'];
    
    if (remainder === 0 || exceptions.includes(cleanAccount)) {
      return { valid: true, message: 'Verified' };
    }
    
    return { valid: false, message: 'Invalid account number' };
  };

  const validateAccountNumber = async (accountNumber, sortCode) => {
    if (accountNumber.length !== 8 || sortCode.length !== 6) return;
    
    setIsValidating(true);
    setVerificationStatus('verifying');
    setVerificationResult(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await axios.post(`${API_URL}/verify-bank-account`, {
        accountNumber,
        sortCode,
        accountHolderName: clientBankDetails.accountHolderName || 'Pending',
        bankName: clientBankDetails.bankName || 'Pending',
        country: customerCountry // ✅ Send country
      });
      
      if (response.data.valid) {
        const accountName = clientBankDetails.accountHolderName?.toLowerCase() || '';
        const customerFullName = customerName?.toLowerCase() || '';
        const nameMatch = accountName.includes(customerFullName) || 
                          customerFullName.includes(accountName) ||
                          accountName.split(' ').some(part => 
                            customerFullName.includes(part) && part.length > 2
                          );
        
        if (!nameMatch && accountName) {
          setVerificationStatus('rejected');
          setVerificationResult({
            valid: false,
            message: '❌ Account holder name does not match your registered name'
          });
          toast.error('❌ Account holder name must match your registered name');
          setIsValidating(false);
          return;
        }
        
        setVerificationStatus('verified');
        setVerificationResult({
          valid: true,
          message: '✅ Bank account verified successfully',
          details: response.data.accountDetails,
          verificationId: response.data.verificationId
        });
        toast.success('✅ Bank account verified successfully!');
      } else {
        setVerificationStatus('rejected');
        setVerificationResult({
          valid: false,
          message: '❌ ' + (response.data.message || 'Invalid bank account')
        });
        toast.error(response.data.message || '❌ Invalid bank account');
      }
    } catch (error) {
      console.warn('⚠️ Backend verification failed, using fallback validation');
      
      const localValidation = validateMOD11(accountNumber, sortCode);
      
      if (localValidation.valid) {
        setVerificationStatus('verified');
        setVerificationResult({
          valid: true,
          message: '✅ Bank account verified',
          verificationId: `VER-LOCAL-${Date.now()}`,
          isLocal: true
        });
        toast.success('✅ Bank account verified successfully!');
      } else {
        setVerificationStatus('rejected');
        setVerificationResult({
          valid: false,
          message: '❌ Invalid bank account. Please check your details.'
        });
        toast.error('❌ Invalid bank account. Please check your details.');
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleClientDetailsChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'accountNumber') {
      const cleaned = value.replace(/\D/g, '').slice(0, 8);
      setClientBankDetails(prev => ({ ...prev, [name]: cleaned }));
      if (cleaned.length === 8 && isUK) {
        validateAccountNumber(cleaned, clientBankDetails.sortCode.replace(/\D/g, ''));
      } else {
        setVerificationStatus('idle');
        setVerificationResult(null);
      }
    } else if (name === 'sortCode') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2);
      if (cleaned.length > 4) formatted = cleaned.slice(0, 2) + '-' + cleaned.slice(2, 4) + '-' + cleaned.slice(4);
      setClientBankDetails(prev => ({ ...prev, [name]: formatted.slice(0, 8) }));
      
      if (cleaned.length === 6 && clientBankDetails.accountNumber.length === 8 && isUK) {
        validateAccountNumber(clientBankDetails.accountNumber, cleaned);
      } else {
        setVerificationStatus('idle');
        setVerificationResult(null);
      }
    } else {
      setClientBankDetails(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAllFields = () => {
    const newErrors = {};
    let isValid = true;
    
    if (!clientBankDetails.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
      isValid = false;
    } else if (clientBankDetails.accountHolderName.trim().length < 3) {
      newErrors.accountHolderName = 'Account holder name must be at least 3 characters';
      isValid = false;
    }

    if (!clientBankDetails.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
      isValid = false;
    }

    // ✅ Only validate UK bank details for UK customers
    if (isUK) {
      const accountClean = clientBankDetails.accountNumber.replace(/\D/g, '');
      if (!accountClean) {
        newErrors.accountNumber = 'Account number is required';
        isValid = false;
      } else if (accountClean.length !== 8) {
        newErrors.accountNumber = 'Account number must be exactly 8 digits';
        isValid = false;
      }

      const sortClean = clientBankDetails.sortCode.replace(/\D/g, '');
      if (!sortClean) {
        newErrors.sortCode = 'Sort code is required';
        isValid = false;
      } else if (sortClean.length !== 6) {
        newErrors.sortCode = 'Sort code must be 6 digits';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleConfirm = async () => {
    if (!validateAllFields()) {
      toast.error('Please fix all errors before proceeding');
      return;
    }

    // ✅ For non-UK customers, skip bank verification
    if (!isUK) {
      onConfirm({
        clientDetails: clientBankDetails,
        amount: totalAmount,
        orderNumber: orderNumber,
        verificationId: `VER-INT-${Date.now()}`,
        verified: true,
        isInternational: true
      });
      return;
    }

    const accountClean = clientBankDetails.accountNumber.replace(/\D/g, '');
    const sortClean = clientBankDetails.sortCode.replace(/\D/g, '');

    if (verificationStatus !== 'verified') {
      await validateAccountNumber(accountClean, sortClean);
      
      if (verificationStatus !== 'verified') {
        toast.error('❌ Bank verification failed. Please check your details and try again.');
        return;
      }
    }

    if (verificationStatus === 'verified' && verificationResult?.valid) {
      onConfirm({
        clientDetails: clientBankDetails,
        amount: totalAmount,
        orderNumber: orderNumber,
        verificationId: verificationResult.verificationId || `VER-${Date.now()}`,
        verified: true
      });
    } else {
      const rejectMessage = verificationResult?.message || 'Bank account verification failed';
      toast.error('❌ ' + rejectMessage);
      
      if (onReject && typeof onReject === 'function') {
        onReject({
          clientDetails: clientBankDetails,
          reason: rejectMessage,
          orderNumber: orderNumber
        });
      }
    }
  };

  const getVerificationStatusDisplay = () => {
    if (!isUK) {
      return (
        <div className="verification-status verified">
          <Globe size={16} />
          <span>🌍 International customer - Bank verification not required</span>
        </div>
      );
    }
    
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="verification-status verifying">
            <Loader2 className="spinning" size={16} />
            <span>Verifying bank account...</span>
          </div>
        );
      case 'verified':
        return (
          <div className="verification-status verified">
            <CheckCircle size={16} />
            <span>✅ Bank account verified</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="verification-status rejected">
            <X size={16} />
            <span>{verificationResult?.message || '❌ Invalid bank account'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const isFormReady = () => {
    if (!isUK) {
      return (
        clientBankDetails.accountHolderName.trim().length >= 3 &&
        clientBankDetails.bankName.trim().length > 0
      );
    }
    
    const accountClean = clientBankDetails.accountNumber.replace(/\D/g, '');
    const sortClean = clientBankDetails.sortCode.replace(/\D/g, '');
    
    return (
      clientBankDetails.accountHolderName.trim().length >= 3 &&
      clientBankDetails.bankName.trim().length > 0 &&
      accountClean.length === 8 &&
      sortClean.length === 6 &&
      verificationStatus === 'verified'
    );
  };

  return (
    <div className="bank-transfer-info">
      <div className="client-bank-details">
        <h4>👤 Your Bank Details</h4>
        <p className="form-hint">
          Enter your bank details exactly as they appear on your bank account
          {!isUK && <span style={{ color: '#c6a43f' }}> 🌍 International customers accepted</span>}
        </p>

        <div className="form-group">
          <label>Account Holder Name *</label>
          <input
            type="text"
            name="accountHolderName"
            value={clientBankDetails.accountHolderName}
            onChange={handleClientDetailsChange}
            placeholder="Enter your full name as on bank account"
            className={`bank-input ${errors.accountHolderName ? 'error' : ''}`}
          />
          {errors.accountHolderName && (
            <span className="error-message">{errors.accountHolderName}</span>
          )}
          <small className="form-hint">Must match your registered name: <strong>{customerName}</strong></small>
        </div>

        <div className="form-group">
          <label>Your Bank Name *</label>
          <input
            type="text"
            name="bankName"
            value={clientBankDetails.bankName}
            onChange={handleClientDetailsChange}
            placeholder="e.g., Barclays, HSBC, Deutsche Bank, BNP Paribas"
            className={`bank-input ${errors.bankName ? 'error' : ''}`}
          />
          {errors.bankName && (
            <span className="error-message">{errors.bankName}</span>
          )}
        </div>

        {isUK ? (
          <>
            <div className="form-row">
              <div className="form-group half">
                <label>Account Number *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={clientBankDetails.accountNumber}
                  onChange={handleClientDetailsChange}
                  placeholder="12345678"
                  maxLength="8"
                  className={`bank-input ${
                    errors.accountNumber ? 'error' : 
                    verificationStatus === 'verified' ? 'success' : 
                    verificationStatus === 'rejected' ? 'error' : ''
                  }`}
                />
                {errors.accountNumber && (
                  <span className="error-message">{errors.accountNumber}</span>
                )}
                <small>8 digits (e.g., 12345678)</small>
              </div>
              <div className="form-group half">
                <label>Sort Code *</label>
                <input
                  type="text"
                  name="sortCode"
                  value={clientBankDetails.sortCode}
                  onChange={handleClientDetailsChange}
                  placeholder="12-34-56"
                  maxLength="8"
                  className={`bank-input ${
                    errors.sortCode ? 'error' : 
                    verificationStatus === 'verified' ? 'success' : 
                    verificationStatus === 'rejected' ? 'error' : ''
                  }`}
                />
                {errors.sortCode && (
                  <span className="error-message">{errors.sortCode}</span>
                )}
                <small>Format: 12-34-56</small>
              </div>
            </div>
          </>
        ) : (
          <div className="international-bank-notice">
            <Globe size={18} />
            <span>
              International bank transfers accepted. Please ensure you include your order number as reference.
              <br />
              <small>We will send you our bank details after order placement.</small>
            </span>
          </div>
        )}

        {getVerificationStatusDisplay()}

        <div className="form-group">
          <label>Order Number</label>
          <input
            type="text"
            value={orderNumber}
            disabled
            className="bank-input reference-disabled"
          />
          <small>Your unique order reference</small>
        </div>
      </div>

      <button
        className={`confirm-transfer-btn ${verificationStatus === 'verified' ? 'verified' : ''}`}
        onClick={handleConfirm}
        disabled={isProcessing || isValidating || verificationStatus === 'verifying' || !isFormReady()}
      >
        {isProcessing ? (
          <><Loader2 className="spinning" size={18} /> Processing...</>
        ) : isValidating || verificationStatus === 'verifying' ? (
          <><Loader2 className="spinning" size={18} /> Verifying Bank Details...</>
        ) : verificationStatus === 'verified' || !isUK ? (
          <>✅ Place Order</>
        ) : (
          <>🔍 Enter Bank Details to Verify</>
        )}
      </button>

      {!isFormReady() && verificationStatus !== 'verified' && isUK && (
        <div className="form-hint warning">
          ⚠️ Please complete all fields and wait for verification to place your order
        </div>
      )}
    </div>
  );
};

// ========================================
// CARD PAYMENT FORM
// ========================================
const CardPaymentForm = ({ totalAmount, onSuccess, onError, formData, cartItems, onProcessing }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Payment system not ready. Please check your Stripe configuration.');
      return;
    }

    setProcessing(true);
    onProcessing(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const response = await axios.post(`${API_URL}/create-payment-intent`, {
        amount: Math.round(totalAmount * 100),
        currency: 'gbp',
        customerDetails: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          address: {
            line1: formData.address,
            city: formData.city,
            postal_code: formData.postalCode,
            country: formData.country === 'United Kingdom' ? 'GB' : formData.country
          }
        }
      });

      const { clientSecret } = response.data;

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: {
              line1: formData.address,
              city: formData.city,
              postal_code: formData.postalCode,
              country: formData.country === 'United Kingdom' ? 'GB' : formData.country
            }
          }
        }
      });

      if (result.error) {
        onError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent);
      }
    } catch (error) {
      console.error('Payment error:', error);
      onError(error.response?.data?.error || error.message);
    } finally {
      setProcessing(false);
      onProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-payment-form">
      <div className="form-group">
        <label>Card Details</label>
        <div className="card-element-wrapper">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1e1e2a',
                  fontFamily: '"Inter", -apple-system, sans-serif',
                  '::placeholder': { color: '#9ca3af' },
                },
                invalid: { color: '#ef4444' },
              },
              hidePostalCode: true,
            }}
          />
        </div>
      </div>
      <button 
        type="submit" 
        className="pay-now-btn"
        disabled={!stripe || processing}
      >
        {processing ? (
          <><div className="spinner-small"></div>Processing...</>
        ) : (
          <>Pay £{totalAmount.toFixed(2)} with Card</>
        )}
      </button>
    </form>
  );
};

// ========================================
// MAIN CHECKOUT COMPONENT
// ========================================
const CheckoutPageContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const cartItemsFromRedux = useSelector((state) => state.cart.items);

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState('');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    postalCode: '',
    country: 'United Kingdom',
    notes: ''
  });

  useEffect(() => {
    if (location.state?.buyNow && location.state?.product) {
      setCartItems([{ ...location.state.product, quantity: 1 }]);
    } else if (cartItemsFromRedux && cartItemsFromRedux.length > 0) {
      setCartItems(cartItemsFromRedux);
    } else {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(savedCart);
    }
  }, [location.state, cartItemsFromRedux]);

  useEffect(() => {
    if (userInfo) {
      setFormData(prev => ({
        ...prev,
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        email: userInfo.email || '',
        phone: userInfo.phone || ''
      }));
    }
  }, [userInfo]);

  useEffect(() => {
    setShowPaymentForm(step === 3);
  }, [step, paymentMethod]);

  const generateOrderNumber = () => {
    const prefix = 'QEL';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ✅ INTERNATIONAL VALIDATION - On Blur
  const handleFieldBlur = (fieldName) => {
    const errors = {};
    const value = formData[fieldName];
    const country = formData.country;

    switch(fieldName) {
      case 'firstName':
        if (!validateInternationalName(value)) {
          errors.firstName = 'Please enter your real first name';
        }
        break;
      case 'lastName':
        if (!validateInternationalName(value)) {
          errors.lastName = 'Please enter your real last name';
        }
        break;
      case 'email':
        if (!value) {
          errors.email = 'Email address is required';
        } else if (!validateInternationalEmail(value)) {
          errors.email = 'Please enter a valid email address (no temporary emails)';
        }
        break;
      case 'phone':
        if (!value) {
          errors.phone = 'Phone number is required';
        } else if (!validateInternationalPhone(value, country)) {
          const example = getPhoneExample(country);
          errors.phone = `Please enter a valid phone number for ${country} (e.g., ${example})`;
        }
        break;
      case 'address':
        if (!value || !validateInternationalAddress(value, country)) {
          errors.address = 'Please enter your full street address';
        }
        break;
      case 'city':
        if (!value || !validateInternationalCity(value, country)) {
          errors.city = 'Please enter a valid city name';
        }
        break;
      case 'postalCode':
        if (!value) {
          errors.postalCode = 'Postcode is required';
        } else if (!validateInternationalPostcode(value, country)) {
          errors.postalCode = country === 'United Kingdom' 
            ? 'Please enter a valid UK postcode (e.g., SW1A 1AA)'
            : 'Please enter a valid postcode for your country';
        }
        break;
      default:
        break;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...errors }));
    }
  };

  // ✅ INTERNATIONAL VALIDATION - Full Form
  const validateFullForm = () => {
    const errors = {};
    const country = formData.country;

    // First Name
    if (!validateInternationalName(formData.firstName)) {
      errors.firstName = 'Please enter your real first name';
    }

    // Last Name
    if (!validateInternationalName(formData.lastName)) {
      errors.lastName = 'Please enter your real last name';
    }

    // Email
    if (!formData.email) {
      errors.email = 'Email address is required';
    } else if (!validateInternationalEmail(formData.email)) {
      errors.email = 'Please enter a valid email address (no temporary emails)';
    }

    // Phone
    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!validateInternationalPhone(formData.phone, country)) {
      const example = getPhoneExample(country);
      errors.phone = `Please enter a valid phone number for ${country} (e.g., ${example})`;
    }

    // Address
    if (!formData.address || !validateInternationalAddress(formData.address, country)) {
      errors.address = 'Please enter your full street address';
    }

    // City
    if (!formData.city || !validateInternationalCity(formData.city, country)) {
      errors.city = 'Please enter a valid city name';
    }

    // Postcode
    if (!formData.postalCode) {
      errors.postalCode = 'Postcode is required';
    } else if (!validateInternationalPostcode(formData.postalCode, country)) {
      errors.postalCode = country === 'United Kingdom' 
        ? 'Please enter a valid UK postcode (e.g., SW1A 1AA)'
        : 'Please enter a valid postcode for your country';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const updateItemQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId);
      return;
    }
    const updatedItems = cartItems.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
  };

  const removeItem = (productId) => {
    const updatedItems = cartItems.filter(item => item._id !== productId);
    setCartItems(updatedItems);
    localStorage.setItem('cart', JSON.stringify(updatedItems));
    if (cartItemsFromRedux.length > 0) {
      dispatch(removeFromCart(productId));
    }
    toast.success('Item removed from cart');
  };

  const calculateShipping = () => {
    if (formData.country === 'United Kingdom') return 0;
    const shippingRates = {
      'United States': 14.99, 'Canada': 16.99, 'Australia': 18.99,
      'Germany': 9.99, 'France': 9.99, 'Italy': 9.99, 'Spain': 9.99,
      'Netherlands': 9.99, 'Belgium': 9.99, 'Sweden': 12.99,
      'Norway': 14.99, 'Denmark': 12.99, 'Finland': 14.99,
      'Ireland': 8.99, 'New Zealand': 19.99, 'Japan': 19.99,
      'China': 19.99, 'India': 16.99, 'Pakistan': 16.99,
      'UAE': 16.99, 'Saudi Arabia': 16.99, 'South Africa': 19.99,
      'Brazil': 22.99, 'Mexico': 19.99, 'Argentina': 22.99,
      'Chile': 22.99, 'Colombia': 22.99, 'Peru': 22.99,
      'Malaysia': 16.99, 'Singapore': 14.99, 'Hong Kong': 14.99,
      'South Korea': 16.99, 'Turkey': 12.99, 'Greece': 11.99,
      'Portugal': 10.99, 'Poland': 9.99, 'Czech Republic': 10.99,
      'Hungary': 10.99, 'Austria': 9.99, 'Switzerland': 11.99,
      'Russia': 18.99, 'Ukraine': 16.99, 'Romania': 10.99,
      'Bulgaria': 10.99, 'Croatia': 11.99, 'Slovakia': 10.99,
      'Slovenia': 10.99, 'Lithuania': 10.99, 'Latvia': 10.99,
      'Estonia': 10.99, 'Iceland': 22.99, 'Luxembourg': 9.99,
      'Malta': 12.99, 'Cyprus': 12.99, 'Other': 24.99
    };
    return shippingRates[formData.country] || shippingRates.default || 24.99;
  };

  const calculateSubtotal = () =>
    cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const calculateDiscount = () =>
    cartItems.reduce((sum, item) => {
      const discount = item.originalPrice ? item.originalPrice - item.price : 0;
      return sum + (discount * item.quantity);
    }, 0);

  const calculateTotal = () =>
    calculateSubtotal() - calculateDiscount() + calculateShipping();

  // ✅ INTERNATIONAL VALIDATION - Step 1
  const validateStep1 = () => {
    const country = formData.country;
    
    if (!validateInternationalName(formData.firstName)) {
      toast.error('Please enter your real first name');
      return false;
    }
    if (!validateInternationalName(formData.lastName)) {
      toast.error('Please enter your real last name');
      return false;
    }
    if (!formData.email) {
      toast.error('Please enter your email address');
      return false;
    }
    if (!validateInternationalEmail(formData.email)) {
      toast.error('Please enter a valid email address (no temporary emails)');
      return false;
    }
    if (!formData.phone) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!validateInternationalPhone(formData.phone, country)) {
      const example = getPhoneExample(country);
      toast.error(`Please enter a valid phone number for ${country} (e.g., ${example})`);
      return false;
    }
    return true;
  };

  // ✅ INTERNATIONAL VALIDATION - Step 2
  const validateStep2 = () => {
    const country = formData.country;
    
    if (!formData.address || !validateInternationalAddress(formData.address, country)) {
      toast.error('Please enter your full street address');
      return false;
    }
    if (!formData.city || !validateInternationalCity(formData.city, country)) {
      toast.error('Please enter a valid city name');
      return false;
    }
    if (!formData.postalCode) {
      toast.error('Please enter your postal code');
      return false;
    }
    if (!validateInternationalPostcode(formData.postalCode, country)) {
      if (country === 'United Kingdom') {
        toast.error('Please enter a valid UK postcode (e.g., SW1A 1AA)');
      } else {
        toast.error('Please enter a valid postcode for your country');
      }
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) { setStep(2); window.scrollTo(0, 0); }
    else if (step === 2 && validateStep2()) { setStep(3); window.scrollTo(0, 0); }
  };

  const handlePrevStep = () => { setStep(step - 1); window.scrollTo(0, 0); };

  // ========================================
  // SAVE ORDER TO BACKEND + LOCAL
  // ========================================
  const saveOrderAndRedirect = async (paymentDetails, method, clientBankDetails = null, isVerified = false) => {
    if (method === 'banktransfer' && !isVerified) {
      toast.error('❌ Bank verification required. Please verify your bank details first.');
      setPaymentStatus('error');
      setPaymentMessage('❌ Bank verification failed. Please try again.');
      return;
    }

    const newOrderNumber = generateOrderNumber();
    setOrderNumber(newOrderNumber);
    localStorage.setItem('lastOrderId', newOrderNumber);
    localStorage.setItem('lastPaymentMethod', method);

    const isBankTransfer = method === 'banktransfer';

    const orderData = {
      orderId: newOrderNumber,
      orderNumber: newOrderNumber,
      paymentId: paymentDetails?.id || null,
      items: cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      customer: { ...formData },
      paymentMethod: method,
      paymentStatus: isBankTransfer ? 'pending' : 'paid',
      subtotal: calculateSubtotal(),
      discount: calculateDiscount(),
      shipping: calculateShipping(),
      tax: Math.round(calculateTotal() * 0.2 * 100) / 100,
      total: calculateTotal(),
      orderDate: new Date().toISOString(),
      status: isBankTransfer ? 'pending' : 'confirmed',
      isPaid: !isBankTransfer,
      clientBankDetails: clientBankDetails || null,
      verificationId: paymentDetails?.verificationId || null,
      isVerified,
      country: formData.country // ✅ Save country
    };

    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(orderData);
      localStorage.setItem('orders', JSON.stringify(orders));
      localStorage.setItem('lastOrder', JSON.stringify(orderData));

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      try {
        await axios.post(`${API_URL}/orders/guest`, {
          orderNumber: newOrderNumber,
          orderItems: cartItems.map(item => ({
            product: item._id,
            name: item.name,
            image: item.image || '',
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: `${formData.address}${formData.apartment ? `, ${formData.apartment}` : ''}`,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          paymentMethod: method,
          itemsPrice: calculateSubtotal(),
          taxPrice: Math.round(calculateTotal() * 0.2 * 100) / 100,
          shippingPrice: calculateShipping(),
          totalPrice: calculateTotal(),
          isPaid: !isBankTransfer,
          status: isBankTransfer ? 'pending' : 'processing',
          paymentResult: paymentDetails
            ? { id: paymentDetails.id, status: isBankTransfer ? 'pending' : 'paid' }
            : undefined,
          clientBankDetails: clientBankDetails || undefined,
          verificationId: paymentDetails?.verificationId || null,
          isVerified,
          country: formData.country
        });
      } catch (apiError) {
        console.warn('Backend order save failed (non-critical):', apiError.message);
      }

      localStorage.removeItem('cart');
      if (cartItemsFromRedux.length > 0) {
        dispatch(clearCart());
      }

      setOrderComplete(true);

      if (isBankTransfer) {
        setPaymentStatus('success');
        setPaymentMessage(
          `✅ Order #${newOrderNumber} placed successfully! Your order is pending verification. We'll confirm within 1-2 business days.`
        );
        toast.success(`✅ Order placed! Order: ${newOrderNumber}`, { duration: 6000 });
      } else {
        setPaymentStatus('success');
        setPaymentMessage(`✅ Order #${newOrderNumber} confirmed! Payment received.`);
        toast.success(`✅ Payment successful!`, { duration: 4000 });
      }

      setTimeout(() => {
        navigate('/order-confirmation', {
          state: { order: orderData, isPending: isBankTransfer }
        });
      }, 3000);

    } catch (error) {
      console.error('Save order error:', error);
      setPaymentStatus('error');
      setPaymentMessage('Failed to save order. Please contact support.');
      toast.error('Failed to save order. Please contact support.');
    }
  };

  // ========================================
  // PAYPAL HANDLERS
  // ========================================
  const handlePayPalSuccess = async (details, data) => {
    setPaymentStatus('processing');
    setPaymentMessage('Processing PayPal payment...');
    const paymentDetails = {
      id: data.orderID,
      status: 'completed',
      payerEmail: details.payer?.email_address,
      payerName: `${details.payer?.name?.given_name} ${details.payer?.name?.surname}`
    };
    toast.success('PayPal payment successful!');
    await saveOrderAndRedirect(paymentDetails, 'paypal');
  };

  const handlePayPalError = (error) => {
    console.error('PayPal error:', error);
    setPaymentStatus('error');
    setPaymentMessage('PayPal payment failed. Please try again or use another payment method.');
    setIsProcessingPayment(false);
  };

  const handlePayPalCancel = () => {
    toast('PayPal checkout cancelled', { icon: 'ℹ️' });
    setIsProcessingPayment(false);
  };

  // ========================================
  // STRIPE HANDLERS
  // ========================================
  const handleStripeSuccess = async (paymentIntent) => {
    setPaymentStatus('processing');
    setPaymentMessage('Processing card payment...');
    await saveOrderAndRedirect(paymentIntent, 'card');
  };

  const handleStripeError = (error) => {
    setPaymentStatus('error');
    setPaymentMessage(`Payment failed: ${error}`);
    setIsProcessingPayment(false);
  };

  // ========================================
  // BANK TRANSFER HANDLERS
  // ========================================
  const handleBankTransfer = (data) => {
    if (!data.verified) {
      toast.error('❌ Bank verification required. Please verify your bank details first.');
      return;
    }
    saveOrderAndRedirect(
      { id: `BT-${Date.now()}`, status: 'pending', verificationId: data.verificationId },
      'banktransfer',
      data.clientDetails,
      true
    );
  };

  const handleBankTransferRejection = (data) => {
    toast.error(`❌ Bank Verification Failed: ${data.reason || 'Invalid bank details'}`, { duration: 8000 });
    setPaymentStatus('error');
    setPaymentMessage(`❌ Bank Verification Failed\n${data.reason || 'Invalid bank details'}\nPlease check your details and try again.`);
    setIsProcessingPayment(false);
  };

  // ========================================
  // DIRECT DEBIT HANDLER
  // ========================================
  const handleDirectDebit = () => {
    toast('Direct Debit setup - Please complete the mandate form', { icon: 'ℹ️' });
    saveOrderAndRedirect({ id: `DD-${Date.now()}`, status: 'pending' }, 'directdebit');
  };

  const handlePaymentStatusClose = () => {
    if (paymentStatus === 'error') {
      setPaymentStatus(null);
      setPaymentMessage('');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products to your cart and they will appear here</p>
        <button onClick={() => navigate('/womens')} className="continue-shop-btn">
          Continue Shopping <ChevronRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      {paymentStatus && (
        <PaymentStatus
          status={paymentStatus}
          message={paymentMessage}
          onClose={handlePaymentStatusClose}
        />
      )}

      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={20} /> Back
          </button>
          <h1>Checkout</h1>
          <div className="checkout-steps">
            <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Information</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Shipping</span>
            </div>
            <div className="step-line"></div>
            <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Payment</span>
            </div>
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-form">

            {/* ── Step 1: Contact Information ── */}
            {step === 1 && (
              <div className="form-step">
                <div className="form-section">
                  <h3><User size={20} /> Contact Information</h3>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>First Name *</label>
                      <input 
                        type="text" 
                        name="firstName" 
                        value={formData.firstName} 
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('firstName')}
                        className={formErrors.firstName ? 'error' : ''}
                        placeholder="John" 
                      />
                      {formErrors.firstName && (
                        <span className="error-message">{formErrors.firstName}</span>
                      )}
                    </div>
                    <div className="form-group half">
                      <label>Last Name *</label>
                      <input 
                        type="text" 
                        name="lastName" 
                        value={formData.lastName} 
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('lastName')}
                        className={formErrors.lastName ? 'error' : ''}
                        placeholder="Doe" 
                      />
                      {formErrors.lastName && (
                        <span className="error-message">{formErrors.lastName}</span>
                      )}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('email')}
                      className={formErrors.email ? 'error' : ''}
                      placeholder="john@example.com" 
                    />
                    {formErrors.email && (
                      <span className="error-message">{formErrors.email}</span>
                    )}
                    <small className="form-hint">We'll send order confirmation here. No temporary emails allowed.</small>
                  </div>
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('phone')}
                      className={formErrors.phone ? 'error' : ''}
                      placeholder={getPhoneExample(formData.country)} 
                    />
                    {formErrors.phone && (
                      <span className="error-message">{formErrors.phone}</span>
                    )}
                    <small className="form-hint">
                      {formData.country === 'United Kingdom' 
                        ? 'UK phone number required (e.g., 07700 900000)' 
                        : `Valid phone number for ${formData.country} required`}
                    </small>
                  </div>
                  <div className="form-navigation">
                    <button onClick={handleNextStep} className="nav-btn next">Continue →</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 2: Shipping ── */}
            {step === 2 && (
              <div className="form-step">
                <div className="form-section">
                  <h3><MapPin size={20} /> Shipping Address</h3>
                  <div className="form-group">
                    <label>Street Address *</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('address')}
                      className={formErrors.address ? 'error' : ''}
                      placeholder="123 Main Street" 
                    />
                    {formErrors.address && (
                      <span className="error-message">{formErrors.address}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Apartment / Suite (Optional)</label>
                    <input 
                      type="text" 
                      name="apartment" 
                      value={formData.apartment} 
                      onChange={handleInputChange}
                      placeholder="Apt 4B" 
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group half">
                      <label>City *</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('city')}
                        className={formErrors.city ? 'error' : ''}
                        placeholder="London" 
                      />
                      {formErrors.city && (
                        <span className="error-message">{formErrors.city}</span>
                      )}
                    </div>
                    <div className="form-group half">
                      <label>Postal Code *</label>
                      <input 
                        type="text" 
                        name="postalCode" 
                        value={formData.postalCode} 
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('postalCode')}
                        className={formErrors.postalCode ? 'error' : ''}
                        placeholder={formData.country === 'United Kingdom' ? 'SW1A 1AA' : 'Postal code'} 
                      />
                      {formErrors.postalCode && (
                        <span className="error-message">{formErrors.postalCode}</span>
                      )}
                      <small className="form-hint">
                        {formData.country === 'United Kingdom' 
                          ? 'Must be a valid UK postcode' 
                          : `Valid postcode for ${formData.country}`}
                      </small>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Country *</label>
                    <select 
                      name="country" 
                      value={formData.country} 
                      onChange={(e) => {
                        handleInputChange(e);
                        // Clear phone error when country changes
                        if (formErrors.phone) {
                          setFormErrors(prev => ({ ...prev, phone: '' }));
                        }
                      }}
                    >
                      {countryList.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Order Notes (Optional)</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Any special delivery instructions" rows="3" />
                  </div>
                  <div className="form-navigation">
                    <button onClick={handlePrevStep} className="nav-btn prev">← Back</button>
                    <button onClick={handleNextStep} className="nav-btn next">Continue →</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Payment ── */}
            {step === 3 && (
              <div className="form-step">
                <div className="form-section">
                  <h3><CreditCard size={20} /> Payment Method</h3>
                  <div className="payment-methods">

                    <label className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div className="payment-icon"><CreditCard size={24} /></div>
                      <div className="payment-info">
                        <strong>Credit / Debit Card</strong>
                        <span>Visa, Mastercard, American Express</span>
                      </div>
                      <div className="payment-badges"><span>Stripe</span><span>Secure</span></div>
                    </label>

                    <label className={`payment-option ${paymentMethod === 'paypal' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div className="payment-icon"><span style={{ fontSize: '24px', fontWeight: 'bold', color: '#0070ba' }}>P</span></div>
                      <div className="payment-info">
                        <strong>PayPal</strong>
                        <span>Pay with your PayPal account - Fast & Secure</span>
                      </div>
                      <div className="payment-badges"><span>PayPal</span><span>Buyer Protection</span></div>
                    </label>

                    <label className={`payment-option ${paymentMethod === 'directdebit' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value="directdebit" checked={paymentMethod === 'directdebit'} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div className="payment-icon"><Landmark size={24} /></div>
                      <div className="payment-info">
                        <strong>Direct Debit</strong>
                        <span>Set up a direct debit mandate</span>
                      </div>
                      <div className="payment-badges"><span>GoCardless</span><span>UK Banks</span></div>
                    </label>

                    <label className={`payment-option ${paymentMethod === 'banktransfer' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value="banktransfer" checked={paymentMethod === 'banktransfer'} onChange={(e) => setPaymentMethod(e.target.value)} />
                      <div className="payment-icon"><Building size={24} /></div>
                      <div className="payment-info">
                        <strong>Bank Transfer</strong>
                        <span>Direct bank transfer</span>
                      </div>
                      <div className="payment-badges"><span>Barclays</span><span>Any UK Bank</span></div>
                    </label>
                  </div>
                </div>

                {/* ── Card Payment ── */}
                {paymentMethod === 'card' && showPaymentForm && (
                  <div className="form-section">
                    <h3><Lock size={20} /> Card Payment</h3>
                    {!isValidStripeKey ? (
                      <div className="payment-config-warning">
                        <AlertCircle size={20} />
                        <div>
                          <strong>Stripe Not Configured</strong>
                          <p>Add your <code>VITE_STRIPE_PUBLISHABLE_KEY</code> to the <code>.env</code> file to enable card payments.</p>
                          <p>Get your key from: <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noreferrer">dashboard.stripe.com/apikeys</a></p>
                        </div>
                      </div>
                    ) : (
                      <CardPaymentForm
                        totalAmount={calculateTotal()}
                        onSuccess={handleStripeSuccess}
                        onError={handleStripeError}
                        formData={formData}
                        cartItems={cartItems}
                        onProcessing={setIsProcessingPayment}
                      />
                    )}
                  </div>
                )}

                {/* ── PayPal ── */}
                {paymentMethod === 'paypal' && showPaymentForm && (
                  <div className="form-section">
                    <h3><Lock size={20} /> PayPal Checkout</h3>
                    <div className="paypal-container">
                      {paypalOptions ? (
                        <PayPalScriptProvider options={paypalOptions}>
                          <PayPalButtons
                            style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                            createOrder={(data, actions) => {
                              return actions.order.create({
                                purchase_units: [{
                                  amount: {
                                    value: calculateTotal().toFixed(2),
                                    currency_code: 'GBP'
                                  },
                                  description: `Order - ${cartItems.length} item(s)`
                                }],
                                payer: {
                                  name: { given_name: formData.firstName, surname: formData.lastName },
                                  email_address: formData.email
                                }
                              });
                            }}
                            onApprove={async (data, actions) => {
                              const details = await actions.order.capture();
                              handlePayPalSuccess(details, data);
                            }}
                            onError={handlePayPalError}
                            onCancel={handlePayPalCancel}
                          />
                        </PayPalScriptProvider>
                      ) : (
                        <div className="payment-config-warning">
                          <AlertCircle size={20} />
                          <div>
                            <strong>PayPal Not Configured</strong>
                            <p>Add your <code>VITE_PAYPAL_CLIENT_ID</code> to the <code>.env</code> file to enable PayPal payments.</p>
                            <p>Get your Client ID from: <a href="https://developer.paypal.com/dashboard/" target="_blank" rel="noreferrer">developer.paypal.com/dashboard</a></p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="secure-note">
                      <Lock size={14} />
                      <span>You will be redirected to PayPal to complete your payment securely</span>
                    </div>
                  </div>
                )}

                {/* ── Direct Debit ── */}
                {paymentMethod === 'directdebit' && showPaymentForm && (
                  <div className="form-section">
                    <h3><Lock size={20} /> Direct Debit Setup</h3>
                    <div className="direct-debit-info">
                      <div className="dd-icon"><Building size={32} /></div>
                      <p>Direct Debit is coming soon. Please use another payment method.</p>
                      <button className="setup-dd-btn" onClick={handleDirectDebit}>
                        Setup Direct Debit (Coming Soon)
                      </button>
                    </div>
                  </div>
                )}

                {/* ── Bank Transfer ── */}
                {paymentMethod === 'banktransfer' && showPaymentForm && (
                  <div className="form-section">
                    <h3><Lock size={20} /> Bank Transfer Details</h3>
                    <BankTransferSection
                      totalAmount={calculateTotal()}
                      orderNumber={orderNumber || generateOrderNumber()}
                      onConfirm={handleBankTransfer}
                      onReject={handleBankTransferRejection}
                      isProcessing={isProcessingPayment}
                      customerName={`${formData.firstName} ${formData.lastName}`}
                      customerCountry={formData.country}
                    />
                  </div>
                )}

                {/* ── Secure Badges ── */}
                <div className="form-section">
                  <h3><Shield size={20} /> Secure Payment</h3>
                  <div className="secure-badges">
                    <div className="secure-badge"><Lock size={14} /> SSL Secure</div>
                    <div className="secure-badge"><Shield size={14} /> Fraud Protection</div>
                    <div className="secure-badge"><CheckCircle size={14} /> PCI Compliant</div>
                    <div className="secure-badge"><Globe size={14} /> Worldwide Accepted</div>
                  </div>
                </div>

                {/* ── Navigation Buttons ── */}
                <div className="form-navigation">
                  <button onClick={handlePrevStep} className="nav-btn prev">
                    ← Back to Shipping
                  </button>

                  {paymentMethod === 'card' && isValidStripeKey && (
                    <button
                      type="button"
                      className="nav-btn next primary"
                      onClick={() => {
                        const form = document.querySelector('.stripe-payment-form');
                        if (form) {
                          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                        } else {
                          toast.error('Please enter your card details');
                        }
                      }}
                    >
                      Pay £{calculateTotal().toFixed(2)}
                    </button>
                  )}

                  {paymentMethod === 'paypal' && paypalOptions && (
                    <button
                      type="button"
                      className="nav-btn next primary"
                      onClick={() => toast('Please use the PayPal button above to complete payment', { icon: 'ℹ️' })}
                    >
                      Complete with PayPal
                    </button>
                  )}

                  {paymentMethod === 'banktransfer' && (
                    <button
                      type="button"
                      className="nav-btn next primary"
                      onClick={() => {
                        const btn = document.querySelector('.confirm-transfer-btn');
                        if (btn) {
                          if (!btn.disabled) { btn.click(); }
                          else { toast.error('⚠️ Please verify your bank details first'); }
                        } else {
                          toast.error('⚠️ Please enter your bank details');
                        }
                      }}
                    >
                      Complete Bank Transfer
                    </button>
                  )}

                  {paymentMethod === 'directdebit' && (
                    <button type="button" className="nav-btn next primary" onClick={handleDirectDebit}>
                      Setup Direct Debit
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Order Summary ── */}
          <div className="order-summary">
            <h3><ShoppingBag size={20} /> Your Order ({cartItems.length} items)</h3>
            <div className="order-items">
              {cartItems.map((item, idx) => (
                <div key={idx} className="order-item">
                  <div className="item-image">
                    <img src={item.image || '/placeholder.jpg'} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">£{item.price.toFixed(2)}</div>
                    <div className="item-quantity">
                      <button className="qty-btn" onClick={() => updateItemQuantity(item._id, item.quantity - 1)}>
                        <Minus size={12} />
                      </button>
                      <span>{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateItemQuantity(item._id, item.quantity + 1)}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button className="remove-item" onClick={() => removeItem(item._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal</span>
                <span>£{calculateSubtotal().toFixed(2)}</span>
              </div>
              {calculateDiscount() > 0 && (
                <div className="total-row discount">
                  <span>Discount</span>
                  <span>-£{calculateDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Shipping to {formData.country}</span>
                <span>{calculateShipping() === 0 ? 'FREE' : `£${calculateShipping().toFixed(2)}`}</span>
              </div>
              <div className="total-row grand-total">
                <span>Total</span>
                <span>£{calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            <div className="shipping-info">
              <Truck size={16} />
              <div>
                <strong>Worldwide Shipping</strong>
                <p>{formData.country === 'United Kingdom' ? 'Royal Mail Tracked 48' : `Shipping to ${formData.country}`}</p>
              </div>
            </div>
            <div className="guarantee">
              <Shield size={16} />
              <div>
                <strong>100% Secure Checkout</strong>
                <p>Your payment is protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================
// WRAP WITH STRIPE ELEMENTS
// ========================================
const CheckoutPage = () => {
  if (!isValidStripeKey) {
    return <CheckoutPageContent />;
  }
  return (
    <Elements stripe={stripePromise}>
      <CheckoutPageContent />
    </Elements>
  );
};

export default CheckoutPage;