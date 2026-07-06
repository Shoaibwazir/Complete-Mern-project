import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaUser, FaShoppingBag, FaBars, FaTimes, FaUserCog } from 'react-icons/fa';
import { useSelector, shallowEqual } from 'react-redux';
import logo from './../../assets/Images/logo.jpeg';
import './Navbar.css';

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const cartItems = useSelector((state) => state.cart?.items || [], shallowEqual);
  const { userInfo } = useSelector((state) => state.auth || {});

  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price || 0) * (item.quantity || 1),
    0
  );

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileDropdownOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      closeMobileMenu();
    }
  };

  return (
    <header className="main-header">
      <div className="top-bar">
        <p>WELCOME TO QASR-E-LIBAS LTD — LUXURY CLOTHING</p>
        <div className="top-links">
          <a href="tel:+447460816860">+44 7460 816860</a>
          <a href="mailto:info@qasrelibas.co.uk">qasrelibasltd@gmail.com</a>
          <Link to="/shipping-delivery">Shipping</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>

      <div className="mid-navbar">
        <button
          type="button"
          className="mobile-toggle mobile-toggle-left"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        <div className="logo-section">
          <Link to="/" className="logo-link logo-link-emblem" onClick={closeMobileMenu} aria-label="QASR-E-LIBAS LTD — Home">
            <span className="brand-logo-emblem-wrap">
              <img
                src={logo}
                alt="QASR-E-LIBAS LTD"
                className="brand-logo-emblem"
                loading="eager"
                decoding="async"
              />
            </span>
            {/* <span className="brand-text-container">
              <span className="brand-name-main">QASR-E-LIBAS</span>
              <span className="brand-name-sub">LTD</span>
            </span> */}
          </Link>
        </div>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search by name or SKU…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">
            <FaSearch />
          </button>
        </form>

        <div className="user-controls">
          {userInfo ? (
            <Link to="/profile" className="icon-link" onClick={closeMobileMenu}>
              <FaUser />
              <span className="icon-label">{userInfo.name?.split(' ')[0] || 'Account'}</span>
            </Link>
          ) : (
            <Link to="/login" className="icon-link" onClick={closeMobileMenu}>
              <FaUser />
              <span className="icon-label">Sign In</span>
            </Link>
          )}

          <Link to="/cart" className="icon-link cart-icon" onClick={closeMobileMenu}>
            <FaShoppingBag />
            <span className="cart-count">{cartItems.length}</span>
            <span className="cart-price">£{cartTotal.toFixed(2)}</span>
          </Link>
        </div>
      </div>

      <nav className={`nav-bar ${mobileMenuOpen ? 'active' : ''}`}>
        <ul className="nav-links">
          <li>
            <Link to="/" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/womens" onClick={closeMobileMenu}>
              Shop Women
            </Link>
          </li>
          <li>
            <Link to="/mens" onClick={closeMobileMenu}>
              Shop Men
            </Link>
          </li>
          <li>
            <Link to="/rental-shop" onClick={closeMobileMenu}>
              Shop Rental
            </Link>
          </li>

          <li
            className={`has-dropdown ${mobileDropdownOpen ? 'active' : ''}`}
            onMouseEnter={() => window.innerWidth > 768 && setIsDropdownOpen(true)}
            onMouseLeave={() => window.innerWidth > 768 && setIsDropdownOpen(false)}
          >
            <button
              type="button"
              className="dropdown-trigger"
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setMobileDropdownOpen(!mobileDropdownOpen);
                }
              }}
            >
              Accessories <span className="arrow">▾</span>
            </button>
            {(window.innerWidth > 768 ? isDropdownOpen : mobileDropdownOpen) && (
              <ul className="dropdown-menu">
                <li>
                  <Link to="/accessories/jewellery" onClick={closeMobileMenu}>
                    Jewellery
                  </Link>
                </li>
                <li>
                  <Link to="/accessories/shoes-sandals" onClick={closeMobileMenu}>
                    Shoes &amp; Sandals
                  </Link>
                </li>
                <li>
                  <Link to="/accessories" onClick={closeMobileMenu}>
                    All Accessories
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link to="/shipping-delivery" onClick={closeMobileMenu}>
              Shipping &amp; Delivery
            </Link>
          </li>
          <li>
            <Link to="/contact" onClick={closeMobileMenu}>
              Contact Us
            </Link>
          </li>

          {userInfo?.isAdmin && (
            <li className="admin-link">
              <Link to="/admin/dashboard" onClick={closeMobileMenu} className="admin-nav-link">
                <FaUserCog /> Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-nav-overlay"
          aria-label="Close navigation"
          onClick={closeMobileMenu}
        />
      )}
    </header>
  );
};

export default Navbar;