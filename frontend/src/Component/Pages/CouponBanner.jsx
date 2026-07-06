// src/components/CouponBanner.jsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import couponService from './../../../../Backend/services/couponService';
import './CouponBanner.css';

const CouponBanner = () => {
  const [coupons, setCoupons] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchFeaturedCoupons();
  }, []);

  const fetchFeaturedCoupons = async () => {
    setLoading(true);
    try {
      const response = await couponService.getFeaturedCoupons();
      if (response.success && response.data.length > 0) {
        setCoupons(response.data);
      } else {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Error fetching featured coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % coupons.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + coupons.length) % coupons.length);
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('couponBannerClosed', 'true');
  };

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (coupons.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [coupons.length]);

  // Check if banner was closed before
  useEffect(() => {
    const closed = localStorage.getItem('couponBannerClosed');
    if (closed === 'true') {
      setIsVisible(false);
    }
  }, []);

  if (!isVisible || loading || coupons.length === 0) {
    return null;
  }

  const coupon = coupons[currentIndex];

  return (
    <div 
      className="coupon-banner"
      style={{
        backgroundColor: coupon.bannerBgColor || '#14142a',
        color: coupon.bannerColor || '#d4af37',
      }}
    >
      <div className="coupon-banner-content">
        <button className="coupon-banner-close" onClick={handleClose}>
          <X size={16} />
        </button>

        <div className="coupon-banner-slide">
          <div className="coupon-banner-icon">
            {coupon.bannerIcon || '🏷️'}
          </div>
          <div className="coupon-banner-text">
            <span className="coupon-banner-label">
              {coupon.bannerMessage || `${coupon.code} - ${coupon.description}`}
            </span>
            {coupon.type === 'percentage' && (
              <span className="coupon-banner-discount">
                {coupon.value}% OFF
              </span>
            )}
            {coupon.type === 'fixed' && (
              <span className="coupon-banner-discount">
                £{coupon.value} OFF
              </span>
            )}
            {coupon.type === 'free_shipping' && (
              <span className="coupon-banner-discount">
                🚚 FREE SHIPPING
              </span>
            )}
            <span className="coupon-banner-code">
              Use code: <strong>{coupon.code}</strong>
            </span>
            {coupon.minOrderAmount > 0 && (
              <span className="coupon-banner-min-order">
                Min. order: £{coupon.minOrderAmount}
              </span>
            )}
          </div>
        </div>

        {coupons.length > 1 && (
          <div className="coupon-banner-nav">
            <button onClick={prevSlide} className="nav-btn">
              <ChevronLeft size={16} />
            </button>
            <div className="dots">
              {coupons.map((_, idx) => (
                <span
                  key={idx}
                  className={`dot ${idx === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
            <button onClick={nextSlide} className="nav-btn">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponBanner;