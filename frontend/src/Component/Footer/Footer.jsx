// src/Component/Footer/Footer.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Truck,
  Undo2,
  Shield,
  Headphones,
  ArrowRight,
  Gem,
  Crown,
  Sparkles,
  Wallet,
  Smartphone,
  Award,
  Clock,
  Send,
  ChevronUp,
  Heart,
} from 'lucide-react';
import './../Layouts/Footer.css';
import { BRAND_NAME, BRAND_EMAIL, BRAND_PHONE_DISPLAY, BRAND_TAGLINE } from '../../config/brand';
import logo from './../../assets/Images/logo.jpeg';

// lucide-react v0.383 removed Facebook/Instagram/Twitter/Youtube.
// Use react-icons/fa6 as drop-in replacements for social icons only.
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaYoutube,
  FaWhatsapp,
  FaTiktok,
  FaPinterestP,
} from 'react-icons/fa6';

const Footer = () => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const currentYear = new Date().getFullYear();

  // Updated phone numbers
  const phoneNumbers = [
    { number: '+44 7460 816860', label: 'Sales & Support' },
    { number: '+44 7460 816860', label: '24/7 Helpline' },
  ];

  const footerLinks = {
    shop: [
      { name: "Women's Collection", link: '/womens' },
      { name: "Men's Collection", link: '/mens' },
      { name: 'Shop Rental', link: '/rental-shop' },
      { name: 'Jewelry', link: '/accessories/jewellery' },
      { name: 'Shoes', link: '/accessories/shoes-sandals' },
      { name: 'Accessories', link: '/accessories' },
    ],
    support: [
      { name: 'Contact Us', link: '/contact' },
      // { name: 'FAQs', link: '/faq' },
      { name: 'Shipping & Delivery', link: '/shipping-delivery' },
      { name: 'Returns & Exchange', link: '/returns' },
      // { name: 'Size Guide', link: '/size-guide' },
      // { name: 'Track Order', link: '/track-order' },
    ],
    company: [
      { name: 'About Us', link: '/about' },
      // { name: 'Our Story', link: '/story' },
      // { name: 'Careers', link: '/careers' },
      // { name: 'Blog', link: '/blog' },
      { name: 'Privacy Policy', link: '/privacy' },
      { name: 'Terms & Conditions', link: '/terms' },
    ],
  };



  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      {/* Back to Top Button */}
      <button 
        className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ChevronUp size={24} />
      </button>

      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column - Updated with Navbar style logo */}
            <div className="footer-column brand-column">
              <Link to="/" className="footer-logo-link">
                <div className="footer-logo-wrapper">
                  <img
                    src={logo}
                    alt="QASR-E-LIBAS LTD"
                    className="footer-brand-logo"
                    loading="lazy"
                  />
                </div>
                <div className="footer-logo-text">
                  <span className="footer-brand-name">QASR-E-LIBAS</span>
                  <span className="footer-brand-sub">LTD</span>
                </div>
              </Link>
              
              <p className="brand-description">
                {BRAND_TAGLINE}. Premium luxury clothing and jewelry crafted with
                traditional elegance for weddings, celebrations, and special occasions.
              </p>
              
              <div className="brand-tagline">
                <Crown className="tagline-icon" size={16} />
                <span> • Unit 107 Jubilee trade Centre 130 Pershore St, Birmingham B5 6ND, UK</span>
              </div>
            </div>

            {/* Shop Links */}
            <div className="footer-column">
              <h4>Shop</h4>
              <ul>
                {footerLinks.shop.map((link, index) => (
                  <li key={index}>
                    <Link to={link.link}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Links */}
            <div className="footer-column">
              <h4>Support</h4>
              <ul>
                {footerLinks.support.map((link, index) => (
                  <li key={index}>
                    <Link to={link.link}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <Link to={link.link}>{link.name}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Column */}
            <div className="footer-column contact-column">
              <h4>Get in Touch</h4>
              <div className="contact-info">
                {/* Phone Numbers */}
                {phoneNumbers.map((phone, index) => (
                  <div key={index} className="contact-item phone-item">
                    <Phone size={18} />
                    <div>
                      <a href={`tel:${phone.number.replace(/\s/g, '')}`} className="phone-link">
                        {phone.number}
                      </a>
                      <small>{phone.label}</small>
                    </div>
                  </div>
                ))}
                
                {/* Email */}
                <div className="contact-item">
                  <Mail size={18} />
                  <div>
                    <a href={`mailto:${BRAND_EMAIL}`} className="email-link">
                      {BRAND_EMAIL}
                    </a>
                    <small>24/7 Support</small>
                  </div>
                </div>
                
                {/* Address */}
                {/* <div className="contact-item">
                  <MapPin size={18} />
                  <div>
                    <span>Unit 107 Jubilee trade Centre </span>
                    <small>130 Pershore St, Birmingham B5 6ND, UK</small>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </div>

     

      {/* Payment & Copyright */}
      <div className="footer-payment">
        <div className="container">
          <div className="payment-wrapper">
            <div className="payment-icons">
              <CreditCard size={32} />
              <Wallet size={32} />
              <Smartphone size={32} />
              <Award size={32} />
            </div>
            <p className="copyright">
              &copy; {currentYear} <span className="copyright-brand">{BRAND_NAME}</span>. 
              All rights reserved. Made with <Heart size={14} className="heart-icon" /> in Birmingham, UK.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;