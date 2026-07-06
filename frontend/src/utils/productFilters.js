import { CATEGORY_ALIASES } from '../config/categories';

export const normalizeCategory = (value = '') =>
  String(value).trim().toLowerCase();

export const matchesCategory = (product, categoryKey) => {
  if (!product || !categoryKey) return false;

  const aliases = CATEGORY_ALIASES[categoryKey] || [categoryKey];
  const productCategory = normalizeCategory(product.category);

  if (aliases.some((alias) => productCategory === alias)) {
    return true;
  }

  // Jewelry can also match accessories with jewelry subCategory
  if (categoryKey === 'jewelry') {
    const sub = normalizeCategory(product.subCategory || product.type);
    return sub === 'jewelry' || sub === 'jewellery';
  }

  return false;
};

export const filterProductsByCategory = (products, categoryKey) => {
  if (!Array.isArray(products) || !categoryKey) return [];
  return products.filter((product) => matchesCategory(product, categoryKey));
};

export const sortProducts = (products, sortBy) => {
  const sorted = [...products];

  switch (sortBy) {
    case 'price-low':
      return sorted.sort((a, b) => (a?.price || 0) - (b?.price || 0));
    case 'price-high':
      return sorted.sort((a, b) => (b?.price || 0) - (a?.price || 0));
    case 'rating':
      return sorted.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
    case 'newest':
      return sorted.sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );
    default:
      return sorted.sort(
        (a, b) => (b?.isFeatured ? 1 : 0) - (a?.isFeatured ? 1 : 0)
      );
  }
};

export const applyProductFilters = (products, filters) => {
  let result = [...products];

  if (filters.priceRange) {
    result = result.filter(
      (p) =>
        (p?.price || 0) >= filters.priceRange[0] &&
        (p?.price || 0) <= filters.priceRange[1]
    );
  }

  if (filters.sizes?.length) {
    result = result.filter((p) =>
      p?.sizes?.some((size) => filters.sizes.includes(size))
    );
  }

  if (filters.colors?.length) {
    result = result.filter((p) =>
      p?.colors?.some((color) => filters.colors.includes(color))
    );
  }

  if (filters.minRating > 0) {
    result = result.filter((p) => (p?.rating || 0) >= filters.minRating);
  }

  if (filters.inStock) {
    result = result.filter((p) => (p?.stock || 0) > 0);
  }

  return result;
};
