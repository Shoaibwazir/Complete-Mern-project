// models/Discount.js

import mongoose from 'mongoose';

const DiscountSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  value: {
    type: Number,
    required: true,
    min: 0
  },
  usageLimit: {
    type: Number,
    required: true,
    min: 1
  },
  used: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  },
  minOrderAmount: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model('Discount', DiscountSchema);