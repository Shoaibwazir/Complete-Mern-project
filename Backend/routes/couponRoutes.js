// backend/routes/couponRoutes.js
import express from 'express';
const router = express.Router();

// Import controller functions
import {
  getAllCoupons,
  getActiveCoupons,
  getFeaturedCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleFeatured,
} from '../controllers/couponController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

// ── Public Routes ──
router.get('/active', getActiveCoupons);
router.get('/featured', getFeaturedCoupons);
router.post('/validate', validateCoupon);

// ── Admin Routes ──
router.get('/', protect, admin, getAllCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);
router.patch('/:id/toggle-featured', protect, admin, toggleFeatured);

export default router;