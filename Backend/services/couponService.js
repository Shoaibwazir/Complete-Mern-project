// src/services/couponService.js
import axios from 'axios';

// ✅ Direct axios instance
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const couponService = {
  // Get all active coupons
  getActiveCoupons: async () => {
    try {
      const response = await api.get('/coupons/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return { success: false, data: { featured: [], regular: [] } };
    }
  },

  // Get featured coupons for banner
  getFeaturedCoupons: async () => {
    try {
      const response = await api.get('/coupons/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured coupons:', error);
      return { success: false, data: [] };
    }
  },

  // Validate coupon
  validateCoupon: async (code, cartTotal, userId) => {
    try {
      const response = await api.post('/coupons/validate', {
        code,
        cartTotal,
        userId,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid coupon',
      };
    }
  },

  // Admin: Get all coupons
  getAllCoupons: async () => {
    try {
      const response = await api.get('/coupons');
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch coupons',
      };
    }
  },

  // Admin: Create coupon
  createCoupon: async (couponData) => {
    try {
      const response = await api.post('/coupons', couponData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create coupon',
      };
    }
  },

  // Admin: Update coupon
  updateCoupon: async (id, couponData) => {
    try {
      const response = await api.put(`/coupons/${id}`, couponData);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update coupon',
      };
    }
  },

  // Admin: Delete coupon
  deleteCoupon: async (id) => {
    try {
      const response = await api.delete(`/coupons/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete coupon',
      };
    }
  },

  // Admin: Toggle featured
  toggleFeatured: async (id) => {
    try {
      const response = await api.patch(`/coupons/${id}/toggle-featured`);
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to toggle featured',
      };
    }
  },
};

export default couponService;