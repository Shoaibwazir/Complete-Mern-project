import React from 'react'
import { Link } from 'react-router-dom'
import './HeroSection.css'

const HeroSection = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>ELEVATE YOUR STYLE</h1>
        <p>Discover the latest collection of premium clothing</p>
        <Link to="womens" className="hero-btn">Shop Now</Link>
      </div>
    </div>
  )
}

export default HeroSection