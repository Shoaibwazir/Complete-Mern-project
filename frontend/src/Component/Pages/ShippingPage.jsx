import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Truck, Globe, Undo, Clock, Shield, Package, MapPin, Calendar,
  CheckCircle, Headphones, CreditCard, ArrowRight, ChevronDown,
  ChevronUp, Phone, Mail, Award, Zap, Box, Map, Star, Heart,
  ShoppingBag, Users, ThumbsUp, Gem, Sparkles, Leaf, Lock
} from 'lucide-react'
import './ShippingPage.css'

const ShippingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState('uk')
  const [estimatedDays, setEstimatedDays] = useState('3-5')
  const [currentSlide, setCurrentSlide] = useState(0)

  // Hero Slider Data
  const heroSlides = [
    {
      title: "Premium Delivery Worldwide",
      subtitle: "Fast, tracked, and insured shipping to over 50 countries",
      icon: <Truck size={24} />,
      bgGradient: "linear-gradient(135deg, #0a0a0e 0%, #1a1a2e 100%)"
    },
    {
      title: "Free Shipping Available",
      subtitle: "On orders over £50 (UK) and £150 (International)",
      icon: <Zap size={24} />,
      bgGradient: "linear-gradient(135deg, #1a1a2e 0%, #2d2d44 100%)"
    },
    {
      title: "Real-Time Tracking",
      subtitle: "Follow your order from warehouse to doorstep",
      icon: <Map size={24} />,
      bgGradient: "linear-gradient(135deg, #2d2d44 0%, #3d3d5c 100%)"
    }
  ]

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  // Calculate delivery based on country
  const calculateDelivery = () => {
    const deliveryTimes = {
      uk: '2-4',
      usa: '7-10',
      canada: '7-10',
      australia: '8-12',
      germany: '5-7',
      france: '5-7',
      italy: '5-7',
      spain: '5-7'
    }
    const days = deliveryTimes[selectedCountry] || '7-14'
    setEstimatedDays(days)
  }

  useEffect(() => {
    calculateDelivery()
  }, [selectedCountry])

  const shippingZones = [
    {
      zone: "United Kingdom",
      flag: "🇬🇧",
      flagIcon: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      methods: [
        { name: "Standard Delivery", price: "£3.99", time: "3-5 business days", free: "Free on orders £50+" },
        { name: "Express Delivery", price: "£6.99", time: "1-2 business days", free: false },
        { name: "Next Day Delivery", price: "£9.99", time: "Next day (order by 2pm)", free: false }
      ]
    },
    {
      zone: "Europe",
      flag: "🇪🇺",
      flagIcon: "🌍",
      methods: [
        { name: "Standard International", price: "£12.99", time: "5-7 business days", free: "Free on orders £150+" },
        { name: "Express International", price: "£19.99", time: "2-3 business days", free: false }
      ]
    },
    {
      zone: "USA & Canada",
      flag: "🇺🇸🇨🇦",
      flagIcon: "🌎",
      methods: [
        { name: "Standard International", price: "£15.99", time: "7-10 business days", free: "Free on orders £200+" },
        { name: "Express International", price: "£24.99", time: "3-5 business days", free: false }
      ]
    },
    {
      zone: "Rest of World",
      flag: "🌍",
      flagIcon: "🌏",
      methods: [
        { name: "Standard International", price: "£19.99", time: "10-14 business days", free: "Free on orders £250+" },
        { name: "Express International", price: "£29.99", time: "5-7 business days", free: false }
      ]
    }
  ]

  const features = [
    {
      icon: <Truck size={34} />,
      title: "Fast Delivery",
      description: "Quick and reliable shipping worldwide with real-time tracking updates",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      stat: "98% On-Time"
    },
    {
      icon: <Shield size={34} />,
      title: "Secure Packaging",
      description: "Eco-friendly, damage-proof packaging to protect your precious items",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      stat: "100% Insured"
    },
    {
      icon: <Clock size={34} />,
      title: "Real-time Tracking",
      description: "Track your order from warehouse to doorstep with live updates",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      stat: "24/7 Available"
    },
    {
      icon: <Undo size={34} />,
      title: "Easy Returns",
      description: "14-day hassle-free return policy with pre-paid return labels",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      stat: "Hassle-Free"
    }
  ]

  const returnBenefits = [
    { icon: "🚚", title: "Free Returns", description: "On all UK orders", color: "#10b981" },
    { icon: "🏷️", title: "Pre-paid Labels", description: "Available for easy returns", color: "#f59e0b" },
    { icon: "💳", title: "Quick Refund", description: "5-7 business days", color: "#3b82f6" },
    { icon: "🔄", title: "Easy Exchange", description: "Size/color changes available", color: "#8b5cf6" }
  ]

  const stats = [
    { value: "50+", label: "Countries", icon: <Globe size={24} />, trend: "+12 this year" },
    { value: "10K+", label: "Orders Delivered", icon: <Package size={24} />, trend: "99.9% success" },
    { value: "24/7", label: "Tracking", icon: <Clock size={24} />, trend: "Live updates" },
    { value: "98%", label: "On-Time", icon: <CheckCircle size={24} />, trend: "Industry leading" }
  ]

  const faqs = [
    {
      question: "How long will it take to receive my order?",
      answer: "Delivery times vary by location. UK orders typically arrive within 3-5 business days for standard shipping, 1-2 days for express. International orders take 5-14 business days depending on your location and shipping method selected.",
      category: "Delivery"
    },
    {
      question: "Do you offer free shipping?",
      answer: "Yes! We offer free standard shipping on UK orders over £50, EU orders over £150, and international orders over £200. Free shipping is automatically applied at checkout.",
      category: "Pricing"
    },
    {
      question: "Can I track my order?",
      answer: "Absolutely! Once your order is dispatched, you'll receive a confirmation email with a tracking number. You can also track your order in your account dashboard under 'My Orders'.",
      category: "Tracking"
    },
    {
      question: "What happens if my package is delayed?",
      answer: "While we strive for on-time delivery, occasional delays may occur due to customs or carrier issues. If your package is delayed beyond the estimated timeframe, please contact our support team and we'll investigate immediately.",
      category: "Support"
    },
    {
      question: "Do you ship to PO boxes?",
      answer: "Yes, we ship to PO boxes for standard delivery only. Express and Next Day delivery require a physical address for signature upon delivery.",
      category: "Delivery"
    },
    {
      question: "Will I have to pay customs fees?",
      answer: "International orders may be subject to import duties and taxes. These charges are the responsibility of the customer and vary by country. Please check with your local customs office for more information.",
      category: "International"
    }
  ]

  return (
    <div className="shipping-page">
      {/* ==================== HERO SLIDER SECTION ==================== */}
      <section className="hero-slider-section">
        <div className="slider-container">
          {heroSlides.map((slide, index) => (
            <div 
              key={index}
              className={`slider-slide ${currentSlide === index ? 'active' : ''}`}
              style={{ background: slide.bgGradient }}
            >
              <div className="slider-bg-pattern"></div>
              <div className="slider-content">
                <div className="slider-icon">
                  {slide.icon}
                </div>
                <h1>{slide.title}</h1>
                <p>{slide.subtitle}</p>
                <div className="slider-buttons">
                  <button className="slider-btn primary">
                    Track Order <ArrowRight size={16} />
                  </button>
                  <button className="slider-btn secondary">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Slider Dots */}
          <div className="slider-dots">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
          
          {/* Slider Arrows */}
          <button className="slider-arrow prev" onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}>
            ‹
          </button>
          <button className="slider-arrow next" onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}>
            ›
          </button>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid-enhanced">
            {stats.map((stat, idx) => (
              <div key={idx} className="stat-card-enhanced">
                <div className="stat-icon-enhanced">{stat.icon}</div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                  <span className="stat-trend">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION - UNIQUE 3D CARDS ==================== */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Sparkles size={14} />
              WHY CHOOSE US
            </div>
            <h2 className="section-title">
              Premium <span className="highlight">Delivery Experience</span>
            </h2>
            <p className="section-subtitle">
              We ensure your orders reach you safely, securely, and on time
            </p>
            <div className="section-divider"></div>
          </div>

          <div className="features-grid-unique">
            {features.map((feature, index) => (
              <div key={index} className="feature-card-unique">
                <div className="feature-card-inner">
                  <div className="feature-card-front">
                    <div className="feature-number">0{index + 1}</div>
                    <div className="feature-icon-unique" style={{ background: feature.gradient }}>
                      {feature.icon}
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                    <div className="feature-stat">
                      <CheckCircle size={14} />
                      <span>{feature.stat}</span>
                    </div>
                    <div className="feature-link-unique">
                      <span><a href="returns">Learn More</a></span>
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SHIPPING CALCULATOR - FULLY FUNCTIONAL ==================== */}
      <section className="calculator-section">
        <div className="container">
          <div className="calculator-card-premium">
            <div className="calculator-left-premium">
              <div className="calculator-badge-premium">
                <Zap size={14} />
                DELIVERY ESTIMATOR
              </div>
              <h3>Calculate Your Delivery Time</h3>
              <p>Enter your location to see estimated delivery times</p>
              
              <div className="calculator-form-premium">
                <label className="delivery-select-field" htmlFor="delivery-country">
                  <Globe size={18} aria-hidden="true" />
                  <select
                    id="delivery-country"
                    className="country-select-premium"
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                  >
                    <option value="uk">United Kingdom</option>
                    <option value="usa">United States</option>
                    <option value="canada">Canada</option>
                    <option value="australia">Australia</option>
                    <option value="germany">Germany</option>
                    <option value="france">France</option>
                    <option value="italy">Italy</option>
                    <option value="spain">Spain</option>
                  </select>
                </label>
                <button type="button" className="calculate-btn-premium" onClick={calculateDelivery}>
                  Calculate Delivery <ArrowRight size={16} />
                </button>
              </div>
              
              <div className="delivery-guarantee">
                <div className="guarantee-item">
                  <Lock size={14} />
                  <span>100% Insured</span>
                </div>
                <div className="guarantee-item">
                  <Leaf size={14} />
                  <span>Eco-friendly</span>
                </div>
                <div className="guarantee-item">
                  <Headphones size={14} />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>
            
            <div className="calculator-right-premium">
              <div className="result-card">
                <div className="result-icon">
                  <Truck size={32} />
                </div>
                <div className="result-text">
                  <span>Estimated Delivery</span>
                  <strong>{estimatedDays} Business Days</strong>
                  <p>Express options available at checkout</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SHIPPING ZONES ==================== */}
      {/* <section className="zones-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Worldwide Shipping</span>
            <h2 className="section-title">Shipping Rates & Times</h2>
            <p className="section-subtitle">Competitive rates for international delivery</p>
          </div>
          <div className="zones-grid-premium">
            {shippingZones.map((zone, idx) => (
              <div key={idx} className="zone-card-premium">
                <div className="zone-header-premium">
                  <div className="zone-flag-premium">{zone.flagIcon}</div>
                  <div className="zone-info">
                    <h3>{zone.zone}</h3>
                    <p>{zone.flag}</p>
                  </div>
                </div>
                <div className="zone-body-premium">
                  {zone.methods.map((method, midx) => (
                    <div key={midx} className="method-item-premium">
                      <div className="method-info-premium">
                        <strong>{method.name}</strong>
                        <div className="method-time-premium">
                          <Clock size={12} /> {method.time}
                        </div>
                      </div>
                      <div className="method-price-premium">
                        <span className="price-premium">{method.price}</span>
                        {method.free && <span className="free-badge-premium">{method.free}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ==================== PROCESS SECTION ==================== */}
      <section className="process-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Simple Process</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">From order to delivery in 4 easy steps</p>
          </div>
          <div className="process-steps-premium">
            <div className="step-premium">
              <div className="step-circle">
                <span>1</span>
                <ShoppingBag size={24} />
              </div>
              <h4>Place Order</h4>
              <p>Choose your items and checkout securely</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-premium">
              <div className="step-circle">
                <span>2</span>
                <Package size={24} />
              </div>
              <h4>Order Processing</h4>
              <p>We prepare and pack your order (1-2 days)</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-premium">
              <div className="step-circle">
                <span>3</span>
                <Truck size={24} />
              </div>
              <h4>Shipped</h4>
              <p>Your order is on its way with tracking</p>
            </div>
            <div className="step-connector"></div>
            <div className="step-premium">
              <div className="step-circle">
                <span>4</span>
                <ThumbsUp size={24} />
              </div>
              <h4>Delivered</h4>
              <p>Enjoy your QASR-E-LIBAS products!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== RETURNS SECTION ==================== */}
      <section className="returns-section-premium">
        <div className="container">
          <div className="returns-card-premium">
            <div className="returns-left">
              <div className="returns-icon-premium">
                <Undo size={48} />
              </div>
              <h3>Easy Returns & Exchanges</h3>
              <p>Not satisfied with your purchase? We offer a 14-day return policy on all unused items in original packaging.</p>
              <Link to="/returns" className="returns-btn-premium">
                Learn More About Returns <ArrowRight size={16} />
              </Link>
            </div>
            <div className="returns-right">
              {returnBenefits.map((benefit, idx) => (
                <div key={idx} className="return-item-premium">
                  <div className="return-icon-premium" style={{ background: `${benefit.color}15`, color: benefit.color }}>
                    {benefit.icon}
                  </div>
                  <div>
                    <strong>{benefit.title}</strong>
                    <p>{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== FAQ SECTION ==================== */}
      <section className="faq-section-premium">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Got Questions?</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">Find quick answers to common questions</p>
          </div>
          <div className="faq-grid-premium">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-card-premium">
                <button 
                  className={`faq-question-premium ${activeFaq === index ? 'active' : ''}`}
                  onClick={() => toggleFaq(index)}
                >
                  <div className="faq-question-left">
                    <span className="faq-category">{faq.category}</span>
                    <span>{faq.question}</span>
                  </div>
                  {activeFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <div className={`faq-answer-premium ${activeFaq === index ? 'show' : ''}`}>
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== SUPPORT SECTION ==================== */}
      <section className="support-section-premium">
        <div className="container">
          <div className="support-card-premium">
            <div className="support-content-premium">
              <div className="support-icon-circle">
                <Headphones size={32} />
              </div>
              <h3>Still Have Questions?</h3>
              <p>Our customer support team is here to help you 24/7</p>
              <div className="support-buttons-premium">
                <Link to="/contact" className="support-btn-premium primary">
                  <Phone size={16} /> Contact Support
                </Link>
                <Link to="/track" className="support-btn-premium secondary">
                  <Package size={16} /> Track Your Order
                </Link>
              </div>
              <div className="support-hours-premium">
                <Clock size={14} />
                <span>Mon-Fri: 9AM - 6PM GMT | Sat: 10AM - 4PM GMT</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ShippingPage