import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Package, Sparkles } from 'lucide-react';
import ProductGrid from '../Product/ProductGrid';
import './SearchPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = (searchParams.get('q') || '').trim();
  const [localQuery, setLocalQuery] = useState(query);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    if (!query) {
      setProducts([]);
      setTotal(0);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_URL}/products`, {
          params: { search: query, limit: 48 },
        });
        const list = response.data?.products || [];
        setProducts(list);
        setTotal(response.data?.total ?? list.length);
      } catch (err) {
        setError(err.response?.data?.message || 'Search failed. Please try again.');
        setProducts([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = localQuery.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    }
  };

  const isSkuSearch = /^[A-Z]{2,4}-[\dA-Z-]+$/i.test(query);

  return (
    <div className="search-page">
      <section className="search-hero">
        <div className="search-hero-inner">
          <span className="search-badge">
            <Sparkles size={14} /> Product Search
          </span>
          <h1>Find Your Perfect Piece</h1>
          <p>Search by dress name, style, or product SKU</p>

          <form className="search-page-form" onSubmit={handleSearch}>
            <Search size={20} className="search-page-icon" />
            <input
              type="search"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search dresses, menswear, jewellery, or SKU (e.g. QEL-12345)…"
              aria-label="Search products"
            />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <div className="search-results-container">
        {!query && (
          <div className="search-empty-state">
            <Package size={48} />
            <h2>Start Searching</h2>
            <p>Type a product name or SKU in the search bar above, or use the navbar search.</p>
            <div className="search-quick-links">
              <Link to="/womens">Shop Women</Link>
              <Link to="/mens">Shop Men</Link>
              <Link to="/rental-shop">Shop Rental</Link>
            </div>
          </div>
        )}

        {query && (
          <div className="search-results-header">
            <h2>
              {loading ? 'Searching…' : `${total} result${total !== 1 ? 's' : ''} for "${query}"`}
            </h2>
            {isSkuSearch && !loading && products.length > 0 && (
              <span className="search-sku-badge">SKU match</span>
            )}
          </div>
        )}

        {error && (
          <div className="search-error">
            <p>{error}</p>
            <button type="button" onClick={() => setSearchParams({ q: query })}>
              Try Again
            </button>
          </div>
        )}

        {query && !error && (
          <>
            {!loading && products.length === 0 && (
              <div className="search-no-results">
                <Search size={40} />
                <h3>No products found</h3>
                <p>Try a different name or check the SKU spelling.</p>
              </div>
            )}
            <ProductGrid products={products} loading={loading} viewMode="grid" />
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
