// src/Component/HomePage/HomePage.jsx - TikTok Section

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

  const slides = [
    {
    id: 1,
  badge: 'Exclusive Collection',
  title: 'PARTY, BRIDAL & AFGHANI DRESSES',
  subtitle: 'Elegance for every occasion',
  description: 'From dazzling party gowns to timeless bridal wear and authentic handcrafted Afghani dresses — curated for weddings, celebrations, and every special moment',
  image: traditional,
  btnText: 'Explore Our Collection',
  link: '/womens',
},
    {
      id: 2,
      badge: 'Ganda Collection',
      title: 'MENS COLLECTIONS',
      subtitle: 'Heritage meets contemporary luxury',
      description: 'Exquisite menswear rooted in Afghan tradition with premium tailoring',
      image: mendress,
      btnText: 'Explore Men\'s Collection',
      link: '/mens',
    },
    {
      id: 3,
      badge: 'Fine Jewellery',
      title: 'TIMELESS ELEGANCE',
      subtitle: 'Traditional Jewellery Collection',
      description: 'Handcrafted pieces that tell a story of culture and refinement',
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

  // Function to clean TikTok URL and add parameters
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

  // Fetch TikTok videos from API
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
        // Fallback videos
        setTiktokVideos([
          {
            _id: 1,
            videoUrl: 'https://www.tiktok.com/embed/v2/1234567890123456789?lang=en-US&autoplay=0&muted=1&rel=0&disable_related=1',
            title: 'Our Latest Collection',
            description: ''
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTikTokVideos();
  }, []);

  const closeNotification = () => {
    setNotification({ show: false, product: null });
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setNotification({ show: true, product: product });
  };

  const handleBuyNow = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    const singleItem = {
      _id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.oldPrice,
      image: product.image,
      quantity: 1,
      material: product.material
    };
    
    localStorage.setItem('buyNowItem', JSON.stringify(singleItem));
    navigate('/checkout', { state: { buyNow: true, product: singleItem } });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${i}`} className="star-filled" />);
    if (hasHalfStar) stars.push(<FaStar key="half" className="star-half-filled" />);
    for (let i = stars.length; i < 5; i++) stars.push(<FaStar key={`empty-${i}`} className="star-empty" />);
    return stars;
  };

  return (
    <div className="homepage">
      {/* Cart Notification */}
      {notification.show && (
        <CartNotification 
          product={notification.product} 
          onClose={closeNotification} 
        />
      )}

      {/* Hero Slider */}
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
            <div className="hero-slide" style={{ backgroundImage: `url(${slide.image})` }}>
              <div className="hero-overlay" />
              <div className="hero-content">
                <div className="hero-content-box">
                  <span className="hero-badge">{slide.badge}</span>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-subtitle">{slide.subtitle}</p>
                  <p className="hero-desc">{slide.description}</p>
                  <Link to={slide.link} className="hero-btn">
                    {slide.btnText} <FaArrowRight />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Features Section */}
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

      {/* Categories Section - Full Width */}
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

      {/* TikTok Videos Section - FIXED */}
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

      {/* Banner Section */}
      <section className="banner-section">
        <div className="banner-content">
          <div className="banner-text">
            <span className="banner-tag">Luxury Hire</span>
            <h2>Shop Rental Collection</h2>
            <p>Premium Afghani dresses &amp; accessories available to hire</p>
            <Link to="/rental-shop" className="banner-btn">
              Browse Rentals <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
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