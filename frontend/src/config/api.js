/**
 * Central API configuration.
 * Set VITE_API_URL in .env for production (e.g. https://your-backend.vercel.app/api).
 * In local dev, Vite proxies /api and /uploads to localhost:5000.
 */
const envApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

export const API_URL = envApiUrl || '/api';

export const API_BASE = envApiUrl
  ? envApiUrl.replace(/\/api\/?$/, '')
  : '';

export function apiUrl(path = '') {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalized}`;
}

export function assetUrl(path = '') {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${normalized}` : normalized;
}
