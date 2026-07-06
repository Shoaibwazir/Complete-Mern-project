import React from 'react'
import ProductCard from './ProductCard'
import './ProductGrid.css'

const ProductGrid = ({ products, loading, viewMode = 'grid' }) => {
  if (loading) {
    return (
      <div className="product-grid-loading">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-info">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-grid-empty">
        <span>🔍</span>
        <h3>No products found</h3>
        <p>Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className={`product-grid ${viewMode}`}>
      {products.map(product => (
        <ProductCard key={product._id} product={product} viewMode={viewMode} />
      ))}
    </div>
  )
}

export default ProductGrid