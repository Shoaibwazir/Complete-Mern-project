// routes/discountRoutes.js

import express from 'express';
import Discount from '../models/Discount.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Get all discounts
router.get('/', protect, admin, async (req, res) => {
  try {
    const discounts = await Discount.find().sort({ createdAt: -1 });
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Create discount
router.post('/', protect, admin, async (req, res) => {
  try {
    const discount = await Discount.create(req.body);
    res.status(201).json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Update discount
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Toggle discount status
router.put('/:id/toggle', protect, admin, async (req, res) => {
  try {
    const discount = await Discount.findById(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    discount.active = req.body.active !== undefined ? req.body.active : !discount.active;
    await discount.save();
    res.json(discount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ✅ Delete discount
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const discount = await Discount.findByIdAndDelete(req.params.id);
    if (!discount) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    res.json({ message: 'Discount deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;