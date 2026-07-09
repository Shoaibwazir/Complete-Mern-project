// src/Component/HomePage/HomePage.jsx - Hero Section Only

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import axios from 'axios';
import { FaTruck, FaShieldAlt, FaUndo, FaHeadset, FaStar, FaArrowRight } from 'react-icons/fa';
import CartNotification from './../CartNotification/CartNotification';
import traditional from './../../assets/Images/traditional.jpg';
import mendress from './../../assets/Images/mendress.jpg';
import afghanjewellery from './../../assets/Images/afghanjewellery.png';
import shoes from './../../assets/Images/shoes.jpg';
import jewellery1 from './../../assets/Images/jewellery1.jpg';
import dress3 from './../../assets/Images/dress3.jpg';
import men from './../../assets/Images/men.jpg';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ show: false, product: null });
  const [tiktokVideos, setTiktokVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // ===== HERO SLIDES =====
  const slides = [
    {
      id: 1,
      image: traditional,
      btnText: 'Explore Our Collection',
      link: '/womens',
    },
    {
      id: 2,
      image: mendress,
      btnText: "Explore Men's Collection →",
      link: '/mens',
    },
    {
      id: 3,
      image: afghanjewellery,
      btnText: 'Explore Jewellery',
      link: '/accessories/jewellery',
    },
  ];

  const features = [
    { icon: <FaTruck />, title: "Free Shipping", desc: "On orders over £50" },
    { icon: <FaShieldAlt />, title: "Secure Payment", desc: "100% secure transactions" },
    { icon: <FaUndo />, title: "Easy Returns", desc: "14 days return policy" },
    { icon: <FaHeadset />, title: "24/7 Support", desc: "Dedicated customer service" }
  ];

  const categories = [
    { name: "Women's Collection", image: dress3, link: "/womens" },
    { name: "Men's Collection", image: men, link: "/mens" },
    { name: "Jewelry", image: jewellery1, link: "/accessories/jewellery" },
    { name: "Shoes", image: shoes, link: "/accessories/shoes-sandals" },
  ];

  // TikTok Functions
  const getCleanTikTokUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    const patterns = [
      /tiktok\.com\/embed\/v2\/(\d+)/,
      /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
      /tiktok\.com\/v\/(\d+)/,
      /vm\.tiktok\.com\/[^\/]+\/(\d+)/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        videoId = match[1];
        break;
      }
    }
    if (!videoId) return url;
    return `https://www.tiktok.com/embed/v2/${videoId}?lang=en-US&autoplay=0&muted=1&loop=0&controls=1&rel=0&show_closed_caption=0&show_chat=0&show_follow=0&show_like=0&show_share=0&show_comments=0&disable_related=1`;
  };

  useEffect(() => {
    const fetchTikTokVideos = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const response = await axios.get(`${API_URL}/tiktok/active`);
        const videoData = response.data.filter(item => item.videoUrl && item.videoUrl.includes('tiktok'));
        const cleanedVideos = videoData.slice(0, 4).map(video => ({
          ...video,
          videoUrl: getCleanTikTokUrl(video.videoUrl)
        }));
        setTiktokVideos(cleanedVideos);
      } catch (error) {
        console.error('Error fetching TikTok videos:', error);
        setTiktokVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTikTokVideos();
  }, []);

  const closeNotification = () => {
    setNotification({ show: false, product: null });
  };

  return (
    <div className="homepage">
      {notification.show && (
        <CartNotification 
          product={notification.product} 
          onClose={closeNotification} 
        />
      )}

      {/* ===== HERO SLIDER ===== */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        className="hero-slider"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="hero-slide">
              <img
                src={slide.image}
                alt=""
                className="hero-slide-img"
              />
              <div className="hero-overlay-clean" />
              <div className="hero-content-clean">
                <Link to={slide.link} className="hero-btn-clean">
                  {slide.btnText} <FaArrowRight />
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ===== FEATURES SECTION ===== */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section className="categories-section">
        <div className="categories-container">
          <div className="section-header">
            <span className="section-subtitle">Shop by Category</span>
            <h2 className="section-title">Explore Our Collections</h2>
            <div className="section-divider"></div>
          </div>
          <div className="categories-grid">
            {categories.map((category, index) => (
              <Link to={category.link} key={index} className="category-card">
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
                  <div className="category-overlay">
                    <h3>{category.name}</h3>
                    <span className="shop-now">Shop Now →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TIKTOK SECTION ===== */}
      <section className="tiktok-section">
        <div className="tiktok-container">
          <div className="section-header">
            <span className="section-subtitle">Watch Our Story</span>
            <h2 className="section-title">TikTok Collection</h2>
            <div className="section-divider"></div>
          </div>
          {loading ? (
            <div className="tiktok-loading">
              <div className="spinner-small"></div>
              <p>Loading videos...</p>
            </div>
          ) : tiktokVideos.length > 0 ? (
            <div className="tiktok-grid">
              {tiktokVideos.map((video) => (
                <div key={video._id} className="tiktok-card">
                  <div className="tiktok-video-wrapper">
                    <iframe
                      src={video.videoUrl}
                      className="tiktok-iframe"
                      frameBorder="0"
                      allowFullScreen
                      scrolling="no"
                      title={video.title || 'TikTok Video'}
                      allow="encrypted-media; picture-in-picture"
                      loading="lazy"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    ></iframe>
                  </div>
                  {video.title && (
                    <div className="tiktok-card-footer">
                      <h4>{video.title}</h4>
                      {video.description && <p>{video.description}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="tiktok-empty">
              <p>No TikTok videos available. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== BANNER SECTION ===== */}
      <section className="banner-section">
        <div className="banner-content">
          <span className="banner-tag">Luxury Hire</span>
          <h2>Shop Rental Collection</h2>
          <p>Premium Afghani dresses & accessories available to hire</p>
          <Link to="/rental-shop" className="banner-btn">
            Browse Rentals <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* ===== NEWSLETTER SECTION ===== */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-card">
            <h3>Subscribe to Our Newsletter</h3>
            <p>Get 10% off your first order and exclusive offers</p>
            <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
