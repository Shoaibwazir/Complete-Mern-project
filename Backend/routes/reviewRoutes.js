// routes/reviewRoutes.js
import express from 'express';
import {
  // Admin controllers
  getAllReviews,
  updateReviewStatus,
  deleteReview,
  replyToReview,
  getReviewDetails,
  bulkUpdateReviews,  // ✅ Added this
  
  // Public controllers
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteOwnReview,
  markHelpful,
  reportReview,
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ========================================
// ✅ Admin Routes
// ========================================
router.get('/admin/all', protect, admin, getAllReviews);
router.get('/admin/:id', protect, admin, getReviewDetails);
router.put('/admin/:id/status', protect, admin, updateReviewStatus);
router.put('/admin/:id/reply', protect, admin, replyToReview);
router.delete('/admin/:id', protect, admin, deleteReview);
router.post('/admin/bulk', protect, admin, bulkUpdateReviews);

// ========================================
// ✅ Public Routes (Customer)
// ========================================
router.post('/', protect, createReview);
router.get('/product/:productId', getProductReviews);
router.get('/my-reviews', protect, getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteOwnReview);
router.put('/:id/helpful', protect, markHelpful);
router.post('/:id/report', protect, reportReview);

export default router;