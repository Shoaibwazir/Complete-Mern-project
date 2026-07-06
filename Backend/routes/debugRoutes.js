import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test endpoint to see what category is being sent
router.post('/test-category', protect, admin, (req, res) => {
  console.log('=== TEST CATEGORY ENDPOINT ===');
  console.log('Received body:', req.body);
  console.log('Category:', req.body.category);
  
  res.json({
    success: true,
    receivedCategory: req.body.category,
    message: `Category "${req.body.category}" received successfully`
  });
});

// Test endpoint for form-data
router.post('/test-formdata', protect, admin, (req, res) => {
  console.log('=== TEST FORMDATA ENDPOINT ===');
  console.log('Body:', req.body);
  console.log('Category:', req.body.category);
  
  res.json({
    success: true,
    receivedData: req.body,
    categoryValue: req.body.category
  });
});

export default router;