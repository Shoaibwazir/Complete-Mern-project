import React, { useState } from 'react';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaPaperPlane,
  FaCheckCircle,
  FaHeadset,
  FaShippingFast,
  FaUndo,
  FaShieldAlt,
  FaChevronRight,
  FaWhatsapp,
  FaArrowRight
} from 'react-icons/fa';
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
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
      const response = await fetch(`${API_URL}/contact/support-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
      setTimeout(() => setSubmitStatus(null), 8000);
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaMapMarkerAlt />,
      title: 'Visit Our Showroom',
      details: ['Unit 107 Jubilee trade Centre 130 Pershore St, Birmingham B5 6ND, UK'],
      action: 'Get Directions',
      actionLink: 'https://share.google/gWrg2TVHbon2VuuYr',
      badge: 'Visit Us'
    },
    {
      icon: <FaPhone />,
      title: 'Call Us',
      details: ['+44 7460 816860'],
      subDetails: ['Mon-Fri: 11AM - 7PM', 'Sun: 11AM - 7PM'],
      action: 'Call Now',
      actionLink: 'tel:+447460816860',
      badge: '24/7 Support'
    },
    {
      icon: <FaEnvelope />,
      title: 'Email Us',
      details: ['info@qasrelibas.co.uk'],
      subDetails: ['Response within 24 hours'],
      action: 'Send Email',
      actionLink: 'mailto:info@qasrelibas.co.uk',
      badge: 'Quick Response'
    },
    {
      icon: <FaClock />,
      title: 'Working Hours',
      details: ['Monday - Friday: 11:00 - 19:00', 'Sunday: 11:00 - 19:00'],
      subDetails: ['Holiday hours may vary'],
      badge: 'Open Now',
      isOpen: true
    }
  ];

  const features = [
    { icon: <FaShippingFast />, title: 'Free Shipping', desc: 'On orders over £50' },
    { icon: <FaUndo />, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: <FaShieldAlt />, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: <FaHeadset />, title: '24/7 Support', desc: 'Dedicated assistance anytime' }
  ];

  const faqs = [
    { q: 'How long does shipping take?', a: 'Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business days.' },
    { q: 'What is your return policy?', a: 'We offer a 30-day return policy for all items in original condition with tags attached.' },
    { q: 'Do you ship internationally?', a: 'Yes, we ship worldwide. International shipping rates apply and delivery times vary by location.' },
    { q: 'How can I track my order?', a: 'You will receive a tracking number via email once your order ships. Track it through our website.' }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              Get in Touch
            </div>
            <h1>We'd Love to <span>Hear From You</span></h1>
            <p>
              Have questions about our products, need assistance with an order,
              or want to collaborate? Our team is here to help.
            </p>
            <div className="hero-breadcrumb">
              <a href="/">Home</a>
              <FaChevronRight size={12} />
              <span>Contact Us</span>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
        </div>
      </section>

      <div className="contact-container">
        {/* Contact Cards */}
        <div className="contact-cards-grid">
          {contactInfo.map((item, index) => (
            <div key={index} className={`contact-card ${item.isOpen ? 'open' : ''}`}>
              <div className="card-header">
                <div className="card-icon">{item.icon}</div>
                <div className="card-header-right">
                  <h3>{item.title}</h3>
                  {item.badge && (
                    <span className={`card-badge ${item.isOpen ? 'badge-open' : ''}`}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>
              <div className="card-body">
                {item.details.map((detail, idx) => (
                  <p key={idx} className="detail-text">{detail}</p>
                ))}
                {item.subDetails && item.subDetails.map((sub, idx) => (
                  <p key={`sub-${idx}`} className="sub-detail">{sub}</p>
                ))}
              </div>
              {item.action && (
                <div className="card-footer">
                  <a href={item.actionLink} className="card-action">
                    {item.action}
                    <FaArrowRight size={14} />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Features Strip */}
        <div className="features-strip">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-icon-wrapper">
                {feature.icon}
              </div>
              <div>
                <h4>{feature.title}</h4>
                <p>{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Map & Form Section */}
        <div className="map-form-section">
          <div className="map-wrapper">
            <iframe
              title="Store Location"
              src="https://maps.google.com/maps?q=London%20EC1A%201BB&t=&z=14&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            <div className="map-overlay">
              <FaMapMarkerAlt />
              <div>
                <strong>QASR-E-LIBAS LTD</strong>
                <span>Unit 107 Jubilee trade Centre 130 Pershore St, Birmingham B5 6ND, UK</span>
              </div>
            </div>
          </div>

          <div className="form-wrapper">
            <div className="form-header">
              <span className="form-badge">Send a Message</span>
              <h2>Get in Touch</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours.</p>
            </div>

            {submitStatus === 'success' && (
              <div className="success-message">
                <FaCheckCircle />
                <div>
                  <h4>Message Sent Successfully!</h4>
                  <p>Thank you for contacting us. We'll respond shortly.</p>
                </div>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="error-message-banner">
                <p>Unable to send your message. Please try again or email us at qasrelibasltd@gmail.com</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="your@email.com"
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+44 7460 816860"
                  />
                </div>

                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={errors.subject ? 'error' : ''}
                    placeholder="What is this regarding?"
                  />
                  {errors.subject && <span className="error-text">{errors.subject}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={errors.message ? 'error' : ''}
                  rows="5"
                  placeholder="Please provide details about your inquiry..."
                ></textarea>
                {errors.message && <span className="error-text">{errors.message}</span>}
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="faq-header">
            <span className="faq-badge">FAQ</span>
            <h2>Frequently Asked <span>Questions</span></h2>
            <p>Find quick answers to the most common questions our customers ask</p>
          </div>
          <div className="faq-grid">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <div className="faq-question">
                  <span className="faq-icon">❓</span>
                  <h3>{faq.q}</h3>
                </div>
                <p className="faq-answer">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-content">
            <div>
              <h2>Need Immediate <span>Assistance?</span></h2>
              <p>Our support team is available 24/7 to help with any urgent inquiries</p>
            </div>
            <div className="cta-buttons">
              <a href="tel:+44 7460 816860" className="cta-btn primary">
                <FaPhone />
                Call Now
              </a>
              <a href="https://wa.me/44 7460 816860" target="_blank" rel="noopener noreferrer" className="cta-btn secondary">
                <FaWhatsapp />
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="social-content">
          <h3>Connect With Us</h3>
          <p>Follow us on social media for updates, promotions, and style inspiration</p>
          <div className="social-links">
            <a href="https://www.facebook.com/profile.php?id=61590656864100" target="_blank" rel="noopener noreferrer" className="social-link facebook" aria-label="Facebook">
              <FaFacebookF />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram" aria-label="Instagram">
              <FaInstagram />
            </a>
            <a href="https://www.tiktok.com/@qasrelibasltd?lang=en" target="_blank" rel="noopener noreferrer" className="social-link tiktok" aria-label="TikTok">
              <FaTiktok />
            </a>
            <a href="https://www.youtube.com/@QASR-E-LIBASLTD" target="_blank" rel="noopener noreferrer" className="social-link youtube" aria-label="YouTube">
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;