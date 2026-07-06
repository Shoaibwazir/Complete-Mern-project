const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop';

/**
 * Resolve product/upload URLs so they work from the Vite dev server and production.
 */
export function getImageUrl(url) {
  if (!url || url === 'undefined' || url === 'null') return PLACEHOLDER;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/')) return `${API_BASE}${url}`;
  if (url.startsWith('uploads/')) return `${API_BASE}/${url}`;
  return url.startsWith('/') ? url : `${API_BASE}/${url}`;
}

export function getProductImage(product) {
  const mainImage = product?.images?.find((img) => img.isMain) || product?.images?.[0];
  const url = mainImage?.url || product?.imageUrl || product?.image;
  return getImageUrl(url);
}

export function getProductImages(product) {
  if (product?.images?.length > 0) {
    return product.images.map((img) => ({
      ...img,
      url: getImageUrl(img.url),
    }));
  }
  if (product?.image) {
    return [{ url: getImageUrl(product.image), isMain: true }];
  }
  return [{ url: PLACEHOLDER, isMain: true }];
}

export { API_BASE, PLACEHOLDER };
