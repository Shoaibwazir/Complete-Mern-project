// src/pages/Returns/Returns.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Shield, 
  Clock, 
  Truck, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ArrowLeft,
  Package,
  CreditCard,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Gift,
  Loader,
  Check
} from 'lucide-react';
import './Returns.css';
import { BRAND_NAME, BRAND_EMAIL, BRAND_PHONE_DISPLAY } from '../../config/brand';

const Returns = () => {
  const [formData, setFormData] = useState({
    orderNumber: '',
    email: '',
    returnType: '',
    reason: '',
    comments: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' or 'error'
  const [statusMessage, setStatusMessage] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!formData.orderNumber.trim()) newErrors.orderNumber = 'Order number is required';
    if (!formData.email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.returnType) newErrors.returnType = 'Please select a return type';
    if (!formData.reason) newErrors.reason = 'Please select a reason';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  
  const newErrors = validateForm();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setIsSubmitting(true);
  setSubmitStatus(null);

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    
    console.log('📤 Submitting to:', `${API_URL}/returns`);
    console.log('📦 Data:', formData);
    
    const response = await axios.post(`${API_URL}/returns`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
    
    console.log('✅ Response:', response.data);
    
    if (response.data.success) {
      setSubmitStatus('success');
      setStatusMessage(response.data.message || 'Your return request has been submitted successfully! We\'ll contact you within 24 hours.');
      setFormData({
        orderNumber: '',
        email: '',
        returnType: '',
        reason: '',
        comments: ''
      });
    }
  } catch (error) {
    console.error('❌ Return submission error:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      if (error.response.status === 500) {
        setSubmitStatus('error');
        setStatusMessage('Server error. Please try again later or contact us directly.');
      } else if (error.response.status === 404) {
        setSubmitStatus('error');
        setStatusMessage('Server endpoint not found. Please contact support.');
      } else {
        setSubmitStatus('error');
        setStatusMessage(error.response.data?.message || 'Something went wrong. Please try again.');
      }
    } else if (error.request) {
      setSubmitStatus('error');
      setStatusMessage('No response from server. Please check your internet connection.');
    } else {
      // Fallback to localStorage
      try {
        const returns = JSON.parse(localStorage.getItem('returns') || '[]');
        const newReturn = {
          ...formData,
          id: Date.now().toString(),
          submittedAt: new Date().toISOString(),
          status: 'pending'
        };
        returns.push(newReturn);
        localStorage.setItem('returns', JSON.stringify(returns));
        
        setSubmitStatus('success');
        setStatusMessage('Your return request has been saved locally. Our team will contact you soon!');
        setFormData({
          orderNumber: '',
          email: '',
          returnType: '',
          reason: '',
          comments: ''
        });
      } catch (localError) {
        setSubmitStatus('error');
        setStatusMessage('Unable to submit your request. Please try again or contact us directly.');
      }
    }
  } finally {
    setIsSubmitting(false);
  }
};
  return (
    <div className="returns-page">
      {/* Hero Section */}
      <section className="returns-hero">
        <div className="container">
          <div className="returns-hero-content">
            <div className="returns-hero-badge">
              <RefreshCw size={20} />
              <span>Returns & Exchange Policy</span>
            </div>
            <h1>Easy Returns & <span>Exchanges</span></h1>
            <p>
              We want you to love your purchase. If you're not completely satisfied,
              we're here to help with our hassle-free returns process.
            </p>
            <div className="returns-hero-stats">
              <div className="stat-item">
                <Clock size={24} />
                <div>
                  <strong>30 Days</strong>
                  <span>Return Window</span>
                </div>
              </div>
              <div className="stat-item">
                <Truck size={24} />
                <div>
                  <strong>Free Returns</strong>
                  <span>On all orders</span>
                </div>
              </div>
              <div className="stat-item">
                <Shield size={24} />
                <div>
                  <strong>100% Secure</strong>
                  <span>Money-back guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Return Process */}
      <section className="return-process">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2>Simple Return <span>Process</span></h2>
            <p>Follow these easy steps to return or exchange your item</p>
          </div>
          <div className="process-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Package size={32} />
              </div>
              <h3>Request Return</h3>
              <p>Contact us within 30 days of receiving your order to initiate a return</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">
                <FileText size={32} />
              </div>
              <h3>Print Label</h3>
              <p>We'll email you a prepaid return shipping label and instructions</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Package size={32} />
              </div>
              <h3>Pack & Ship</h3>
              <p>Pack items securely and drop off at your nearest shipping location</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-icon">
                <CreditCard size={32} />
              </div>
              <h3>Get Refund</h3>
              <p>We'll process your refund within 5-7 business days after inspection</p>
            </div>
          </div>
        </div>
      </section>

      {/* Return Policy Details */}
      <section className="policy-details">
        <div className="container">
          <div className="policy-grid">
            <div className="policy-card">
              <div className="policy-card-header">
                <CheckCircle size={28} className="policy-icon accepted" />
                <h3>Eligible for Return</h3>
              </div>
              <ul className="policy-list">
                <li>Items in original condition with tags attached</li>
                <li>Unworn, unwashed, and undamaged items</li>
                <li>Return initiated within 30 days of delivery</li>
                <li>Original packaging and receipts included</li>
                <li>Sale items (unless marked final sale)</li>
                <li>Gift items with gift receipt</li>
              </ul>
            </div>

            <div className="policy-card">
              <div className="policy-card-header">
                <XCircle size={28} className="policy-icon rejected" />
                <h3>Not Eligible for Return</h3>
              </div>
              <ul className="policy-list">
                <li>Items without original tags or packaging</li>
                <li>Worn, washed, or damaged items</li>
                <li>Returns initiated after 30 days</li>
                <li>Final sale items (clearly marked)</li>
                <li>Customized or personalized items</li>
                <li>Intimate apparel and swimwear</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Policy Sections */}
      <section className="policy-sections">
        <div className="container">
          <div className="sections-grid">
            <div className="policy-section">
              <h3>
                <RefreshCw size={24} />
                Exchange Policy
              </h3>
              <p>
                We offer free exchanges for size or color changes within 30 days 
                of purchase. Please contact our support team to initiate an exchange.
              </p>
              <ul>
                <li>Free shipping on exchange items</li>
                <li>Exchange for different size or color</li>
                <li>Subject to stock availability</li>
                <li>Price difference adjustment available</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>
                <Clock size={24} />
                Refund Timeline
              </h3>
              <p>
                Refunds are processed promptly after we receive and inspect your return.
              </p>
              <ul>
                <li>Inspection: 1-3 business days</li>
                <li>Refund processing: 3-5 business days</li>
                <li>Bank processing: 3-5 business days</li>
                <li>Original payment method credited</li>
                <li>Email notification on completion</li>
              </ul>
            </div>

            <div className="policy-section">
              <h3>
                <Gift size={24} />
                Gift Returns
              </h3>
              <p>
                We offer special handling for gift returns to make the process easy 
                for both the giver and receiver.
              </p>
              <ul>
                <li>Store credit for gift returns</li>
                <li>No original receipt required</li>
                <li>Gift packaging available</li>
                <li>Extended return period for holidays</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="important-notes">
        <div className="container">
          <div className="notes-wrapper">
            <AlertCircle size={32} className="notes-icon" />
            <div className="notes-content">
              <h3>Important Notes</h3>
              <ul>
                <li>
                  <strong>International Returns:</strong> Customers are responsible 
                  for return shipping costs on international orders
                </li>
                <li>
                  <strong>Damaged Items:</strong> Contact us immediately if you 
                  receive damaged or defective items
                </li>
                <li>
                  <strong>Holiday Returns:</strong> Extended return window for 
                  purchases made during holiday season
                </li>
                <li>
                  <strong>Final Sale:</strong> Items marked as "Final Sale" cannot 
                  be returned or exchanged
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Return Form */}
      <section className="return-form-section">
        <div className="container">
          <div className="form-wrapper">
            <div className="form-info">
              <h2>Start Your <span>Return</span></h2>
              <p>
                Ready to return or exchange an item? Fill out the form below and 
                our team will assist you within 24 hours.
              </p>
              <div className="contact-info">
                <div className="contact-item">
                  <Mail size={20} />
                  <span>{BRAND_EMAIL}</span>
                </div>
                <div className="contact-item">
                  <Phone size={20} />
                  <span>{BRAND_PHONE_DISPLAY}</span>
                </div>
                <div className="contact-item">
                  <Clock size={20} />
                  <span>Mon-Sunday: 9AM - 6PM</span>
                </div>
              </div>
            </div>

            <form className="return-form" onSubmit={handleSubmit}>
              {/* Success/Error Message */}
              {submitStatus && (
                <div className={`status-message ${submitStatus}`}>
                  {submitStatus === 'success' ? (
                    <Check size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                  <div>
                    <h4>{submitStatus === 'success' ? 'Success!' : 'Error!'}</h4>
                    <p>{statusMessage}</p>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="orderNumber">Order Number *</label>
                <input 
                  type="text" 
                  id="orderNumber" 
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  className={errors.orderNumber ? 'error' : ''}
                  placeholder="e.g., QEL-12345"
                  required
                  disabled={isSubmitting}
                />
                {errors.orderNumber && <span className="error-text">{errors.orderNumber}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  placeholder="you@example.com"
                  required
                  disabled={isSubmitting}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="returnType">Return Type *</label>
                <select 
                  id="returnType" 
                  name="returnType"
                  value={formData.returnType}
                  onChange={handleChange}
                  className={errors.returnType ? 'error' : ''}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select return type</option>
                  <option value="return">Return for Refund</option>
                  <option value="exchange">Exchange</option>
                  <option value="damaged">Damaged Item</option>
                  <option value="wrong">Wrong Item Received</option>
                </select>
                {errors.returnType && <span className="error-text">{errors.returnType}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Return *</label>
                <select 
                  id="reason" 
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={errors.reason ? 'error' : ''}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select reason</option>
                  <option value="size">Wrong Size</option>
                  <option value="color">Wrong Color</option>
                  <option value="defect">Defective Product</option>
                  <option value="quality">Quality Issue</option>
                  <option value="fit">Doesn't Fit</option>
                  <option value="change">Changed Mind</option>
                  <option value="other">Other</option>
                </select>
                {errors.reason && <span className="error-text">{errors.reason}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="comments">Additional Comments</label>
                <textarea 
                  id="comments" 
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Please provide any additional details..."
                  disabled={isSubmitting}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="spinner" />
                    Submitting...
                  </>
                ) : (
                  'Submit Return Request'
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2>Common <span>Questions</span></h2>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>How long do I have to return an item?</h4>
              <p>
                You have 30 days from the date of delivery to initiate a return 
                for eligible items.
              </p>
            </div>
            <div className="faq-item">
              <h4>Who pays for return shipping?</h4>
              <p>
                We offer free returns for all UK orders. For international orders, 
                customers are responsible for return shipping costs.
              </p>
            </div>
            <div className="faq-item">
              <h4>How long does it take to get a refund?</h4>
              <p>
                Refunds are processed within 5-7 business days after we receive 
                and inspect your returned item.
              </p>
            </div>
            <div className="faq-item">
              <h4>Can I exchange an item for a different size?</h4>
              <p>
                Yes! We offer free exchanges for size or color changes subject 
                to stock availability.
              </p>
            </div>
            <div className="faq-item">
              <h4>What if I received a damaged item?</h4>
              <p>
                Please contact us immediately. We'll arrange for a free return 
                and send you a replacement as soon as possible.
              </p>
            </div>
            <div className="faq-item">
              <h4>Are sale items returnable?</h4>
              <p>
                Most sale items are returnable unless marked as "Final Sale." 
                Please check the product page for details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="support-cta">
        <div className="container">
          <div className="support-wrapper">
            <div className="support-content">
              <h2>Need Help With <span>Your Return?</span></h2>
              <p>
                Our dedicated support team is here to help you with any questions 
                or concerns about your return or exchange.
              </p>
              <div className="support-buttons">
                <Link to="/contact" className="btn-primary">
                  <Mail size={18} />
                  Contact Support
                </Link>
                <a href={`tel:${BRAND_PHONE_DISPLAY}`} className="btn-secondary">
                  <Phone size={18} />
                  Call Us
                </a>
              </div>
            </div>
            <div className="support-image">
              <Shield size={120} className="support-shield" />
            </div>
          </div>
        </div>
      </section>

      {/* Back to Top */}
      <button 
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <ArrowLeft size={20} />
        Back to Top
      </button>
    </div>
  );
};

export default Returns;