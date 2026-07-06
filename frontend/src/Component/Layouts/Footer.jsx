import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcPaypal,
  FaApplePay,
  FaGooglePay,
  FaTruck,
  FaUndo,
  FaShieldAlt,
  FaHeadset,
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
      { name: 'FAQs', link: '/faq' },
      { name: 'Shipping & Delivery', link: '/shipping-delivery' },
      { name: 'Returns & Exchange', link: '/returns' },
      { name: 'Size Guide', link: '/size-guide' },
      { name: 'Track Order', link: '/track-order' },
    ],
    company: [
      { name: 'About Us', link: '/about' },
      { name: 'Our Story', link: '/story' },
      { name: 'Careers', link: '/careers' },
      { name: 'Blog', link: '/blog' },
      { name: 'Privacy Policy', link: '/privacy' },
      { name: 'Terms & Conditions', link: '/terms' },
    ],
  };

  return (
    <footer className="footer">
      {/* Main Footer */}
      <div className="footer-main">
        <div className="container">
          <div className="footer-grid">
            {/* Brand Column */}
            <div className="footer-column brand-column">
              <div className="footer-logo">
                <span className="logo-icon">FI</span>
                <span className="logo-text">QASR-E-LIBAS LTD</span>
              </div>
              <p className="brand-description">
                Premium clothing and luxury jewelry for the modern individual.
                Quality craftsmanship meets traditional elegance.
              </p>
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaFacebookF />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaInstagram />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaTwitter />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaYoutube />
                </a>
                <a href="https://wa.me/447979389080" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaWhatsapp />
                </a>
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
              <h4>Contact Us</h4>
              <div className="contact-info">
                <div className="contact-item">
                  <FaPhoneAlt />
                  <div>
                    <span>+44 7979 389080</span>
                    <small>Mon-Fri: 9AM - 6PM</small>
                  </div>
                </div>
                <div className="contact-item">
                  <FaEnvelope />
                  <div>
                    <span>info@qasrelibas.co.uk</span>
                    <small>24/7 Support</small>
                  </div>
                </div>
                <div className="contact-item">
                  <FaMapMarkerAlt />
                  <div>
                    <span>123 Fashion Street</span>
                    <small>London, UK - EC1A 1BB</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="footer-features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-item">
              <FaTruck />
              <div>
                <h4>Free Shipping</h4>
                <p>On orders over £50</p>
              </div>
            </div>
            <div className="feature-item">
              <FaUndo />
              <div>
                <h4>Easy Returns</h4>
                <p>30-day return policy</p>
              </div>
            </div>
            <div className="feature-item">
              <FaShieldAlt />
              <div>
                <h4>Secure Payment</h4>
                <p>100% secure transactions</p>
              </div>
            </div>
            <div className="feature-item">
              <FaHeadset />
              <div>
                <h4>24/7 Support</h4>
                <p>Dedicated customer service</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="footer-payment">
        <div className="container">
          <div className="payment-wrapper">
            <div className="payment-icons">
              <FaCcVisa />
              <FaCcMastercard />
              <FaCcAmex />
              <FaCcPaypal />
              <FaApplePay />
              <FaGooglePay />
            </div>
            <p className="copyright">
              &copy; {currentYear} QASR-E-LIBAS LTD. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
