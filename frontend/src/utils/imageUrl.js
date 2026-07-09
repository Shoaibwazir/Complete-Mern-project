import { assetUrl, API_BASE } from '../config/api';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop';

/**
 * Resolve product/upload URLs for dev (Vite proxy) and production (Vercel backend).
 */
export function getImageUrl(url) {
  if (!url || url === 'undefined' || url === 'null') return PLACEHOLDER;
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url;
  }
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    const path = url.startsWith('/') ? url : `/${url}`;
    return assetUrl(path);
  }
  return url.startsWith('/') ? assetUrl(url) : assetUrl(`/${url}`);
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
