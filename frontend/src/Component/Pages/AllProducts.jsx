import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AllProducts = () => {
  // Sample Data (Baad mein aap isay MongoDB/API se fetch karenge)
  const products = [
    { id: 1, name: "Gold Bridal Set", category: "Jewelry", price: "£250", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600" },
    { id: 2, name: "Velvet Sherwani", category: "Clothing", price: "£180", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600" },
    { id: 3, name: "Traditional Jhumkas", category: "Jewelry", price: "£45", image: "https://images.unsplash.com/photo-1630139676227-427e5d179730?w=600" },
    { id: 4, name: "Silk Embroidered Suit", category: "Clothing", price: "£120", image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600" },
    { id: 5, name: "Diamond Ring", category: "Jewelry", price: "£500", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600" },
    { id: 6, name: "Designer Kurta", category: "Clothing", price: "£85", image: "https://images.unsplash.com/photo-1624371414361-e6e8ea01c1e6?w=600" },
  ];

  const [filter, setFilter] = useState('All');

  const filteredProducts = filter === 'All' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div style={{ padding: '40px 5%', backgroundColor: '#fcfcfc', minHeight: '100vh' }}>
      
      {/* Header & Filter Section */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', letterSpacing: '2px', color: '#333', textTransform: 'uppercase' }}>Our Collection</h1>
        <div style={{ width: '50px', height: '3px', background: '#c6a43f', margin: '15px auto' }}></div>
        
        {/* Simple Filter Tabs */}
        <div style={{ marginTop: '20px' }}>
          {['All', 'Clothing', 'Jewelry'].map(cat => (
            <button 
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                margin: '0 10px',
                padding: '8px 20px',
                border: 'none',
                background: filter === cat ? '#c6a43f' : 'transparent',
                color: filter === cat ? 'white' : '#666',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: '0.3s',
                borderRadius: '2px'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '30px' 
      }}>
        {filteredProducts.map((product) => (
          <div key={product.id} style={productCardStyle}>
            <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ overflow: 'hidden', height: '350px', position: 'relative' }}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={imageStyle} 
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              </div>
              
              <div style={{ padding: '15px', textAlign: 'center' }}>
                <p style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '5px' }}>{product.category}</p>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', fontWeight: '500' }}>{product.name}</h3>
                <p style={{ color: '#c6a43f', fontWeight: 'bold', fontSize: '1.2rem' }}>{product.price}</p>
              </div>
            </Link>
            
            <button style={addToCartBtn}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inline Styles
const productCardStyle = {
  backgroundColor: '#fff',
  border: '1px solid #eee',
  transition: '0.3s shadow',
  position: 'relative',
};

const imageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: '0.5s transform ease-in-out',
};

const addToCartBtn = {
  width: '100%',
  padding: '12px',
  border: 'none',
  backgroundColor: '#333',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: '0.3s',
  textTransform: 'uppercase',
  fontSize: '0.8rem'
};

export default AllProducts;