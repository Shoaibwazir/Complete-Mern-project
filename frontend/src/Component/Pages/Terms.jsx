// src/pages/Terms/Terms.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Truck,
  RefreshCw,
  ShoppingBag,
  User,
  Lock,
  Mail,
  Phone,
  Scale,
  BookOpen,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import './Terms.css';
import { BRAND_NAME, BRAND_EMAIL, BRAND_PHONE_DISPLAY } from '../../config/brand';

const Terms = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'introduction',
      icon: <FileText />,
      title: 'Introduction',
      content: [
        `Welcome to ${BRAND_NAME}. These Terms & Conditions govern your use of our website and services.`,
        `By accessing or using our website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our website.`,
        `These Terms & Conditions apply to all visitors, users, and others who access or use our services.`
      ]
    },
    {
      id: 'definitions',
      icon: <BookOpen />,
      title: 'Definitions',
      content: [
        `"Company", "We", "Our", "Us" refers to ${BRAND_NAME}.`,
        `"Website" refers to our official website at www.qasr-elibas.co.uk.`,
        `"Products" refers to all clothing, jewelry, and accessories offered on our website.`,
        `"Customer", "You", "Your" refers to the user of our website and services.`,
        `"Order" refers to any purchase request made through our website.`
      ]
    },
    {
      id: 'orders',
      icon: <ShoppingBag />,
      title: 'Orders & Purchases',
      content: [
        'All orders are subject to acceptance and availability.',
        'We reserve the right to refuse or cancel any order for any reason.',
        'In case of pricing errors, we reserve the right to cancel orders and refund payments.',
        'Order confirmation is sent via email upon successful purchase.',
        'We reserve the right to limit quantities of products purchased.'
      ]
    },
    {
      id: 'pricing',
      icon: <CreditCard />,
      title: 'Pricing & Payments',
      content: [
        'All prices are displayed in GBP (£) and include VAT where applicable.',
        'Prices are subject to change without notice.',
        'We accept payment via major credit/debit cards and digital wallets.',
        'Full payment is required before order processing.',
        'Payment information is securely processed and not stored on our servers.'
      ]
    },
    {
      id: 'shipping',
      icon: <Truck />,
      title: 'Shipping & Delivery',
      content: [
        'Delivery times are estimates and not guaranteed.',
        'Standard shipping: 3-5 business days.',
        'Express shipping: 1-2 business days.',
        'International shipping: 7-14 business days.',
        'Shipping costs are calculated at checkout.',
        'We are not responsible for delays caused by customs or carriers.'
      ]
    },
    {
      id: 'returns',
      icon: <RefreshCw />,
      title: 'Returns & Refunds',
      content: [
        '30-day return policy for eligible items.',
        'Items must be in original condition with tags attached.',
        'Return shipping costs are covered for UK orders.',
        'Refunds are processed within 5-7 business days.',
        'Customized or final sale items are not returnable.'
      ]
    },
    {
      id: 'intellectual',
      icon: <Shield />,
      title: 'Intellectual Property',
      content: [
        'All content on this website is the property of QASR-E-LIBAS LTD.',
        'This includes text, images, logos, designs, and trademarks.',
        'You may not reproduce, distribute, or modify any content without permission.',
        'Unauthorized use of our intellectual property is prohibited.'
      ]
    },
    {
      id: 'user-accounts',
      icon: <User />,
      title: 'User Accounts',
      content: [
        'You are responsible for maintaining account confidentiality.',
        'You agree to provide accurate account information.',
        'We reserve the right to suspend or terminate accounts for misuse.',
        'You must be 18 years or older to create an account.'
      ]
    },
    {
      id: 'privacy',
      icon: <Lock />,
      title: 'Privacy Policy',
      content: [
        'We collect and process personal data in accordance with GDPR.',
        'Your data is used for order processing and communication.',
        'We do not share your data with third parties without consent.',
        'You have the right to access, modify, or delete your data.',
        'For more details, please read our full Privacy Policy.'
      ]
    },
    {
      id: 'liability',
      icon: <AlertCircle />,
      title: 'Limitation of Liability',
      content: [
        'Our products are provided "as is" without warranties.',
        'We are not liable for indirect or consequential damages.',
        'Our liability is limited to the purchase price of products.',
        'We are not responsible for third-party content or links.'
      ]
    },
    {
      id: 'governing-law',
      icon: <Scale />,
      title: 'Governing Law',
      content: [
        'These terms are governed by the laws of England and Wales.',
        'Any disputes shall be resolved in UK courts.',
        'You agree to comply with all applicable UK laws.',
        'We reserve the right to amend these terms at any time.'
      ]
    },
    {
      id: 'contact',
      icon: <Mail />,
      title: 'Contact Us',
      content: [
        `For questions about these Terms & Conditions, please contact us:`,
        `Email: ${BRAND_EMAIL}`,
        `Phone: ${BRAND_PHONE_DISPLAY}`,
        `Address: 123 Fashion Street, London, EC1A 1BB, United Kingdom`
      ]
    }
  ];

  const quickLinks = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'definitions', label: 'Definitions' },
    { id: 'orders', label: 'Orders & Purchases' },
    { id: 'pricing', label: 'Pricing & Payments' },
    { id: 'shipping', label: 'Shipping & Delivery' },
    { id: 'returns', label: 'Returns & Refunds' },
    { id: 'intellectual', label: 'Intellectual Property' },
    { id: 'user-accounts', label: 'User Accounts' },
    { id: 'privacy', label: 'Privacy Policy' },
    { id: 'liability', label: 'Liability' },
    { id: 'governing-law', label: 'Governing Law' },
    { id: 'contact', label: 'Contact Us' }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const lastUpdated = 'January 2026';

  return (
    <div className="terms-page">
      {/* Hero Section */}
      <section className="terms-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={16} />
              <span>Legal</span>
            </div>
            <h1>Terms & <span>Conditions</span></h1>
            <p>
              Please read these terms and conditions carefully before using our website
              and services. By using our services, you agree to be bound by these terms.
            </p>
            <div className="hero-meta">
              <div className="meta-item">
                <Clock size={16} />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="meta-divider">|</div>
              <div className="meta-item">
                <FileText size={16} />
                <span>Version 2.0</span>
              </div>
            </div>
            <div className="hero-breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={14} />
              <span>Terms & Conditions</span>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
        </div>
      </section>

      <div className="terms-container">
        {/* Quick Navigation */}
        <aside className="terms-sidebar">
          <div className="sidebar-sticky">
            <div className="sidebar-header">
              <h3>Quick Navigation</h3>
              <p>Jump to any section</p>
            </div>
            <nav className="sidebar-nav">
              {quickLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="sidebar-link"
                >
                  <ChevronRight size={16} />
                  <span>{link.label}</span>
                </button>
              ))}
            </nav>
            <div className="sidebar-cta">
              <p>Need help?</p>
              <Link to="/contact" className="sidebar-contact-btn">
                <Mail size={16} />
                Contact Us
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="terms-content">
          <div className="terms-intro">
            <div className="intro-notice">
              <AlertCircle size={24} />
              <div>
                <h3>Important Notice</h3>
                <p>
                  These Terms & Conditions form a legally binding agreement between you
                  and {BRAND_NAME}. Please read them carefully before using our services.
                </p>
              </div>
            </div>
          </div>

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="terms-section">
              <div className="section-header">
                <div className="section-icon-wrapper">
                  {section.icon}
                </div>
                <div>
                  <h2>{section.title}</h2>
                  <span className="section-number">0{index + 1}</span>
                </div>
              </div>
              <div className="section-content">
                {section.content.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
                {section.id === 'contact' && (
                  <div className="contact-details">
                    <div className="contact-detail-item">
                      <Mail size={18} />
                      <span>{BRAND_EMAIL}</span>
                    </div>
                    <div className="contact-detail-item">
                      <Phone size={18} />
                      <span>{BRAND_PHONE_DISPLAY}</span>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ))}

          {/* Agreement Section */}
          <div className="agreement-section">
            <div className="agreement-box">
              <CheckCircle size={32} />
              <div>
                <h3>By using our services, you agree to these Terms & Conditions</h3>
                <p>
                  If you have any questions or concerns, please don't hesitate to contact us.
                  We're here to help and ensure your experience with us is exceptional.
                </p>
                <div className="agreement-actions">
                  <Link to="/" className="btn-primary">
                    <ArrowLeft size={18} />
                    Return to Home
                  </Link>
                  <Link to="/contact" className="btn-secondary">
                    <Mail size={18} />
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Back to Top */}
      <button
        className="back-to-top-btn"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        <ArrowLeft size={20} />
      </button>
    </div>
  );
};

export default Terms;