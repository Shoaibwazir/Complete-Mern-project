import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, LayoutGrid, List, X, Sparkles, Award, Truck } from 'lucide-react';
import {
  fetchProductsByCategory,
  clearProducts,
} from '../../redux/slices/productSlice';
import { getCategoryConfig } from '../../config/categories';
import { applyProductFilters, sortProducts } from '../../utils/productFilters';
import ProductGrid from '../Product/ProductGrid';
import FilterSidebar from '../Filters/FilterSidebar';
import './CategoryShopPage.css';

const CategoryShopPage = ({ categoryKey: categoryKeyProp }) => {
  const { categoryKey: routeCategoryKey } = useParams();
  const categoryKey = categoryKeyProp || routeCategoryKey;
  const config = getCategoryConfig(categoryKey);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, loading, error, activeCategory } = useSelector(
    (state) => state.products
  );

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    priceRange: [0, 500],
    sizes: [],
    colors: [],
    minRating: 0,
    inStock: false,
  });

  useEffect(() => {
    if (!config) {
      navigate('/');
      return;
    }

    dispatch(clearProducts());
    dispatch(fetchProductsByCategory(config.apiCategory));

    return () => {
      dispatch(clearProducts());
    };
  }, [categoryKey, config, dispatch, navigate]);

  const filteredProducts = useMemo(() => {
    const filtered = applyProductFilters(items, filters);
    return sortProducts(filtered, sortBy);
  }, [items, filters, sortBy]);

  if (!config) return null;

  if (error) {
    return (
      <div className="category-shop-error">
        <span>⚠️</span>
        <h3>Unable to load products</h3>
        <p>{error}</p>
        <button
          type="button"
          onClick={() => dispatch(fetchProductsByCategory(config.apiCategory))}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="category-shop">
      <section className="category-hero">
        <div className="category-hero-content">
          <p className="category-hero-eyebrow">QASR-E-LIBAS LTD</p>
          <h1>{config.heroTitle}</h1>
          <p className="category-hero-subtitle">{config.heroSubtitle}</p>
          <div className="category-hero-stats">
            <span>
              <Sparkles size={16} /> {loading ? '…' : `${filteredProducts.length}+`} Styles
            </span>
            <span>
              <Award size={16} /> Premium Quality
            </span>
            <span>
              <Truck size={16} /> UK Delivery
            </span>
          </div>
        </div>
      </section>

      <div className="category-main">
        <div className="category-toolbar">
          <div className="category-toolbar-inner">
            <div className="toolbar-left">
              <h2>{config.title}</h2>
              <p>
                {loading
                  ? 'Loading collection…'
                  : `Showing ${filteredProducts.length} piece${filteredProducts.length === 1 ? '' : 's'}`}
                {activeCategory && !loading && (
                  <span className="category-tag">{activeCategory}</span>
                )}
              </p>
            </div>

            <div className="toolbar-right">
              {/* <button
                type="button"
                className="filter-toggle-btn"
                onClick={() => setShowFilters(true)}
                aria-label="Open filters"
              >
                <Filter size={16} /> Filters
              </button> */}

              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <div className="view-toggle">
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="category-products-wrap">
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            viewMode={viewMode}
          />
        </div>
      </div>

      <div className={`filter-drawer ${showFilters ? 'active' : ''}`}>
        <div className="filter-drawer-header">
          <h3>Filter Products</h3>
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>
        <FilterSidebar filters={filters} setFilters={setFilters} />
        <div className="filter-drawer-footer">
          <button type="button" className="apply-filters-btn" onClick={() => setShowFilters(false)}>
            Apply Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <button
          type="button"
          className="filter-overlay"
          aria-label="Close filter overlay"
          onClick={() => setShowFilters(false)}
        />
      )}
    </div>
  );
};

export default CategoryShopPage;
