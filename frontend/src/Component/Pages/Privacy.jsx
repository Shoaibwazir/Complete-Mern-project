// src/pages/Privacy/Privacy.jsx

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Lock,
  Eye,
  User,
  Mail,
  Phone,
  MapPin,
  Database,
  Cookie,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  ChevronRight,
  ArrowLeft,
  Globe,
  Server,
  Smartphone,
  Share2,
  Trash2,
  Edit,
  Bell,
  ShieldCheck
} from 'lucide-react';
import './Privacy.css';
import { BRAND_NAME, BRAND_EMAIL, BRAND_PHONE_DISPLAY } from '../../config/brand';

const Privacy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    {
      id: 'introduction',
      icon: <FileText />,
      title: 'Introduction',
      content: [
        `At ${BRAND_NAME}, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.`,
        `We are committed to protecting your personal data and complying with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.`,
        `Please read this Privacy Policy carefully. By using our website, you agree to the collection and use of information in accordance with this policy.`
      ]
    },
    {
      id: 'information-collect',
      icon: <Database />,
      title: 'Information We Collect',
      content: [
        'We collect several types of information for various purposes to provide and improve our service to you.',
        'Personal Data: Name, email address, phone number, shipping address, billing address.',
        'Usage Data: Browser type, IP address, pages visited, time spent on pages, device information.',
        'Cookies: We use cookies and similar tracking technologies to track activity on our website.',
        'Order Information: Purchase history, product preferences, payment information.',
        'Account Information: Username, password, account preferences.'
      ]
    },
    {
      id: 'how-we-use',
      icon: <Eye />,
      title: 'How We Use Your Information',
      content: [
        'We use the collected data for various purposes:',
        'To provide and maintain our services and products.',
        'To process and fulfill your orders and payments.',
        'To communicate with you about orders, updates, and promotional offers.',
        'To improve our website, products, and customer experience.',
        'To detect, prevent, and address technical issues and fraud.',
        'To comply with legal obligations and regulatory requirements.'
      ]
    },
    {
      id: 'legal-basis',
      icon: <ShieldCheck />,
      title: 'Legal Basis for Processing',
      content: [
        'We process your personal data under the following legal bases:',
        'Contract Performance: Processing necessary for the performance of a contract with you.',
        'Legitimate Interests: Processing necessary for our legitimate business interests.',
        'Legal Obligation: Processing necessary for compliance with legal obligations.',
        'Consent: Processing based on your explicit consent for specific purposes.'
      ]
    },
    {
      id: 'data-sharing',
      icon: <Share2 />,
      title: 'Data Sharing & Disclosure',
      content: [
        'We may share your information in the following situations:',
        'With service providers who assist us in operating our website and processing orders.',
        'With payment processors to facilitate transactions and prevent fraud.',
        'With shipping partners to deliver your orders.',
        'When required by law or to protect our rights and safety.',
        'With your consent for specific purposes.',
        'We do not sell or rent your personal data to third parties for marketing purposes.'
      ]
    },
    {
      id: 'data-security',
      icon: <Lock />,
      title: 'Data Security',
      content: [
        'We implement appropriate technical and organizational measures to protect your personal data:',
        'Encryption of data during transmission using SSL/TLS protocols.',
        'Secure storage of personal data with access controls.',
        'Regular security audits and vulnerability assessments.',
        'Staff training on data protection and privacy practices.',
        'Limited access to personal data on a need-to-know basis.',
        'While we strive to protect your data, no method of transmission is 100% secure.'
      ]
    },
    {
      id: 'data-retention',
      icon: <Clock />,
      title: 'Data Retention',
      content: [
        'We retain your personal data only for as long as necessary:',
        'Order data: Retained for 6 years for tax and accounting purposes.',
        'Account data: Retained until you delete your account or request removal.',
        'Marketing data: Retained until you unsubscribe or opt-out.',
        'Usage data: Retained for up to 24 months for analytics purposes.',
        'We periodically review and securely delete unnecessary data.'
      ]
    },
    {
      id: 'your-rights',
      icon: <User />,
      title: 'Your Rights',
      content: [
        'Under UK GDPR, you have the following rights regarding your personal data:',
        'Right to Access: Request a copy of your personal data.',
        'Right to Rectification: Request correction of inaccurate data.',
        'Right to Erasure: Request deletion of your data (right to be forgotten).',
        'Right to Restriction: Request restriction of data processing.',
        'Right to Data Portability: Request transfer of your data.',
        'Right to Object: Object to processing of your data.',
        'Right to Withdraw Consent: Withdraw consent at any time.'
      ]
    },
    {
      id: 'cookies',
      icon: <Cookie />,
      title: 'Cookies Policy',
      content: [
        'We use cookies and similar technologies to enhance your experience:',
        'Essential Cookies: Necessary for website functionality and security.',
        'Functional Cookies: Remember your preferences and settings.',
        'Analytics Cookies: Help us understand how visitors interact with our website.',
        'Marketing Cookies: Used to deliver relevant advertisements.',
        'You can control cookie preferences through your browser settings.',
        'Third-party cookies may be used for analytics and marketing purposes.'
      ]
    },
    {
      id: 'third-party',
      icon: <Globe />,
      title: 'Third-Party Services',
      content: [
        'We use various third-party services that may process your data:',
        'Payment Processors: Secure handling of payment information.',
        'Delivery Services: Shipping and tracking of orders.',
        'Analytics Providers: Analysis of website usage patterns.',
        'Email Service Providers: Sending order confirmations and updates.',
        'We ensure all third-party services comply with data protection regulations.',
        'Please review their privacy policies for additional information.'
      ]
    },
    {
      id: 'international',
      icon: <Server />,
      title: 'International Data Transfers',
      content: [
        'Your information may be transferred to and processed in countries outside the UK.',
        'We ensure appropriate safeguards are in place for international data transfers.',
        'Transfers are made in compliance with UK GDPR requirements.',
        'We use standard contractual clauses for international data transfers.',
        'For data transfers to the US, we rely on the EU-US Privacy Shield framework.'
      ]
    },
    {
      id: 'children',
      icon: <Shield />,
      title: 'Children\'s Privacy',
      content: [
        'Our services are not directed at individuals under the age of 18.',
        'We do not knowingly collect personal data from minors.',
        'If we discover we have collected data from a minor, we will delete it.',
        'Parents or guardians should supervise their children\'s online activities.',
        'Please contact us if you believe we have collected data from a minor.'
      ]
    },
    {
      id: 'updates',
      icon: <Bell />,
      title: 'Policy Updates',
      content: [
        'We may update this Privacy Policy from time to time.',
        'We will notify you of any changes by posting the new policy on this page.',
        'The updated policy will be effective immediately upon posting.',
        'We will indicate the date of the latest revision at the top of this page.',
        'We encourage you to review this policy periodically for any changes.',
        'Significant changes will be notified via email or website notification.'
      ]
    },
    {
      id: 'contact',
      icon: <Mail />,
      title: 'Contact Us',
      content: [
        `If you have any questions about this Privacy Policy or our data practices, please contact us:`,
        `Data Protection Officer: ${BRAND_NAME} Privacy Team`,
        `Email: ${BRAND_EMAIL}`,
        `Phone: ${BRAND_PHONE_DISPLAY}`,
        `Address: Unit 107, Jubilee trade Centre, 130 Pershore St, Birmingham B5 6ND, United Kingdom`,
        `We will respond to your inquiry within 30 days.`
      ]
    }
  ];

  const quickLinks = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'information-collect', label: 'Information We Collect' },
    { id: 'how-we-use', label: 'How We Use Your Information' },
    { id: 'legal-basis', label: 'Legal Basis' },
    { id: 'data-sharing', label: 'Data Sharing' },
    { id: 'data-security', label: 'Data Security' },
    { id: 'data-retention', label: 'Data Retention' },
    { id: 'your-rights', label: 'Your Rights' },
    { id: 'cookies', label: 'Cookies Policy' },
    { id: 'third-party', label: 'Third-Party Services' },
    { id: 'international', label: 'International Transfers' },
    { id: 'children', label: 'Children\'s Privacy' },
    { id: 'updates', label: 'Policy Updates' },
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
    <div className="privacy-page">
      {/* Hero Section */}
      <section className="privacy-hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Shield size={16} />
              <span>Privacy</span>
            </div>
            <h1>Privacy <span>Policy</span></h1>
            <p>
              Your privacy matters to us. Learn how we collect, use, and protect 
              your personal information when you interact with our services.
            </p>
            <div className="hero-meta">
              <div className="meta-item">
                <Clock size={16} />
                <span>Last Updated: {lastUpdated}</span>
              </div>
              <div className="meta-divider">|</div>
              <div className="meta-item">
                <Shield size={16} />
                <span>GDPR Compliant</span>
              </div>
            </div>
            <div className="hero-breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={14} />
              <span>Privacy Policy</span>
            </div>
          </div>
        </div>
        <div className="hero-decoration">
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
          <div className="decoration-circle"></div>
        </div>
      </section>

      <div className="privacy-container">
        {/* Quick Navigation */}
        <aside className="privacy-sidebar">
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
              <ShieldCheck size={24} />
              <p>Your data is safe with us</p>
              <Link to="/contact" className="sidebar-contact-btn">
                <Mail size={16} />
                Contact Privacy Team
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="privacy-content">
          <div className="privacy-intro">
            <div className="intro-notice">
              <Lock size={24} />
              <div>
                <h3>Your Privacy Matters</h3>
                <p>
                  We are committed to protecting your privacy and ensuring the security of
                  your personal data. This policy explains how we handle your information
                  in accordance with UK GDPR regulations.
                </p>
              </div>
            </div>
          </div>

          {sections.map((section, index) => (
            <section key={section.id} id={section.id} className="privacy-section">
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
                {section.content.map((paragraph, idx) => {
                  // Check if it's a list item (starts with bullet points or specific keywords)
                  const isListItem = paragraph.startsWith('-') || 
                    paragraph.startsWith('•') ||
                    paragraph.startsWith('To ') ||
                    paragraph.startsWith('For ') ||
                    paragraph.startsWith('Right to ') ||
                    paragraph.startsWith('Essential ') ||
                    paragraph.startsWith('Functional ') ||
                    paragraph.startsWith('Analytics ') ||
                    paragraph.startsWith('Marketing ');
                  
                  if (isListItem) {
                    // Remove bullet points and clean up
                    const cleanText = paragraph.replace(/^[•\-]\s*/, '');
                    return <li key={idx}>{cleanText}</li>;
                  }
                  
                  return <p key={idx}>{paragraph}</p>;
                })}
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
                    <div className="contact-detail-item">
                      <MapPin size={18} />
                      <span>Unit 107, Jubilee trade Centre, 130 Pershore St, Birmingham B5 6ND, United Kingdom</span>
                    </div>
                  </div>
                )}
                {/* Add list wrapper for items that start with these patterns */}
                {section.content.some(p => 
                  p.startsWith('-') || 
                  p.startsWith('•') ||
                  p.startsWith('To ') ||
                  p.startsWith('For ') ||
                  p.startsWith('Right to ')
                ) && section.id !== 'contact' && (
                  <ul className="section-list">
                    {section.content.map((paragraph, idx) => {
                      const isListItem = paragraph.startsWith('-') || 
                        paragraph.startsWith('•') ||
                        paragraph.startsWith('To ') ||
                        paragraph.startsWith('For ') ||
                        paragraph.startsWith('Right to ') ||
                        paragraph.startsWith('Essential ') ||
                        paragraph.startsWith('Functional ') ||
                        paragraph.startsWith('Analytics ') ||
                        paragraph.startsWith('Marketing ');
                      
                      if (isListItem) {
                        const cleanText = paragraph.replace(/^[•\-]\s*/, '');
                        return <li key={idx}>{cleanText}</li>;
                      }
                      return null;
                    })}
                  </ul>
                )}
              </div>
            </section>
          ))}

          {/* GDPR Compliance Section */}
          <div className="gdpr-section">
            <div className="gdpr-box">
              <div className="gdpr-icon">
                <ShieldCheck size={32} />
              </div>
              <div className="gdpr-content">
                <h3>GDPR Compliance</h3>
                <p>
                  We are fully compliant with the UK General Data Protection Regulation 
                  (UK GDPR) and the Data Protection Act 2018. Your privacy rights are 
                  protected and respected.
                </p>
                <div className="gdpr-badges">
                  <span className="gdpr-badge">
                    <CheckCircle size={16} />
                    Data Protection
                  </span>
                  <span className="gdpr-badge">
                    <CheckCircle size={16} />
                    Privacy Rights
                  </span>
                  <span className="gdpr-badge">
                    <CheckCircle size={16} />
                    Secure Processing
                  </span>
                  <span className="gdpr-badge">
                    <CheckCircle size={16} />
                    Lawful Basis
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Agreement Section */}
          <div className="agreement-section">
            <div className="agreement-box">
              <CheckCircle size={32} />
              <div>
                <h3>We're Committed to Protecting Your Privacy</h3>
                <p>
                  If you have any questions about our Privacy Policy or how we handle 
                  your data, please don't hesitate to contact our Privacy Team.
                </p>
                <div className="agreement-actions">
                  <Link to="/" className="btn-primary">
                    <ArrowLeft size={18} />
                    Return to Home
                  </Link>
                  <Link to="/contact" className="btn-secondary">
                    <Mail size={18} />
                    Contact Privacy Team
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

export default Privacy;