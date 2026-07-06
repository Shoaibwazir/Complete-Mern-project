import React from 'react'
import { FaStar, FaRegStar } from 'react-icons/fa'
import './FilterSidebar.css'

const FilterSidebar = ({ filters, setFilters }) => {
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL']
  const colors = [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Navy', code: '#000080' },
    { name: 'Maroon', code: '#800000' },
    { name: 'Grey', code: '#808080' },
    { name: 'Brown', code: '#8B4513' }
  ]

  const handlePriceChange = (e) => {
    const value = parseInt(e.target.value)
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], value]
    }))
  }

  const handleSizeToggle = (size) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }))
  }

  const handleColorToggle = (color) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }))
  }

  const handleRatingChange = (rating) => {
    setFilters(prev => ({
      ...prev,
      minRating: prev.minRating === rating ? 0 : rating
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [0, 500],
      sizes: [],
      colors: [],
      minRating: 0,
      inStock: false
    })
  }

  return (
    <div className="filter-sidebar-content">
      {/* Clear Filters */}
      <div className="filter-clear">
        <button onClick={clearAllFilters}>Clear All Filters</button>
      </div>

      {/* Price Range Filter */}
      <div className="filter-group">
        <h4>Price Range</h4>
        <div className="price-range">
          <input
            type="range"
            min="0"
            max="500"
            value={filters.priceRange[1]}
            onChange={handlePriceChange}
          />
          <div className="price-values">
            <span>£0</span>
            <span>£{filters.priceRange[1]}+</span>
          </div>
        </div>
      </div>

      {/* Size Filter */}
      <div className="filter-group">
        <h4>Size</h4>
        <div className="size-buttons">
          {sizes.map(size => (
            <button
              key={size}
              className={`size-btn ${filters.sizes.includes(size) ? 'active' : ''}`}
              onClick={() => handleSizeToggle(size)}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="filter-group">
        <h4>Color</h4>
        <div className="color-options">
          {colors.map(color => (
            <button
              key={color.name}
              className={`color-btn ${filters.colors.includes(color.name) ? 'active' : ''}`}
              onClick={() => handleColorToggle(color.name)}
            >
              <span 
                className="color-swatch" 
                style={{ background: color.code }}
              ></span>
              {color.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="filter-group">
        <h4>Customer Rating</h4>
        <div className="rating-options">
          {[4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              className={`rating-btn ${filters.minRating === rating ? 'active' : ''}`}
              onClick={() => handleRatingChange(rating)}
            >
              {[...Array(5)].map((_, i) => (
                i < rating ? 
                  <FaStar key={i} /> : 
                  <FaRegStar key={i} />
              ))}
              <span>& up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stock Filter */}
      <div className="filter-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  )
}

export default FilterSidebar