import React from 'react'
import ProductCard from '../Product/ProductCard'
import './FeaturedProducts.css'

const FeaturedProducts = () => {
  const products = [
    { _id: 1, name: 'Classic Denim Jacket', price: 89.99, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=400' },
    { _id: 2, name: 'Premium Cotton Shirt', price: 49.99, image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400' },
    { _id: 3, name: 'Slim Fit Trousers', price: 79.99, image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400' },
    { _id: 4, name: 'Leather Sneakers', price: 129.99, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400' },
  ]

  return (
    <div className="featured">
      <h2>Featured Collection</h2>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default FeaturedProducts