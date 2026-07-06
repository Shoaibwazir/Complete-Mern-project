// backend/models/Coupon.js
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Code must be at least 3 characters'],
    maxlength: [20, 'Code cannot exceed 20 characters'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [100, 'Description cannot exceed 100 characters'],
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: [true, 'Coupon type is required'],
  },
  value: {
    type: Number,
    required: function() {
      return this.type !== 'free_shipping';
    },
    min: [0, 'Value must be positive'],
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount must be positive'],
  },
  maxDiscountAmount: {
    type: Number,
    default: null,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: [true, 'Expiry date is required'],
  },
  usageLimit: {
    type: Number,
    default: null,
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  perUserLimit: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  bannerMessage: {
    type: String,
    default: '',
    maxlength: [50, 'Banner message cannot exceed 50 characters'],
  },
  bannerIcon: {
    type: String,
    default: '🏷️',
  },
  bannerColor: {
    type: String,
    default: '#d4af37',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color'],
  },
  bannerBgColor: {
    type: String,
    default: '#14142a',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color'],
  },
  applicableProducts: {
    type: [String],
    default: [],
  },
  excludedProducts: {
    type: [String],
    default: [],
  },
  stackable: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes for faster queries
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ isFeatured: 1, isActive: 1 });

// Pre-save hook to ensure endDate is after startDate
couponSchema.pre('save', function(next) {
  if (this.endDate < this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    (this.usageLimit === null || this.usedCount < this.usageLimit)
  );
};

// Static method to apply coupon
couponSchema.statics.applyCoupon = async function(code, cartTotal) {
  const coupon = await this.findOne({ code: code.toUpperCase() });
  
  if (!coupon || !coupon.isValid()) {
    return { valid: false, message: 'Invalid or expired coupon' };
  }

  let discount = 0;
  let discountType = coupon.type;

  if (coupon.type === 'percentage') {
    discount = (cartTotal * coupon.value) / 100;
    if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
      discount = coupon.maxDiscountAmount;
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  } else if (coupon.type === 'free_shipping') {
    discount = 0;
  }

  // Check min order
  if (coupon.minOrderAmount > 0 && cartTotal < coupon.minOrderAmount) {
    return {
      valid: false,
      message: `Minimum order of £${coupon.minOrderAmount} required`
    };
  }

  return {
    valid: true,
    coupon,
    discount,
    discountType,
    formattedDiscount: discount.toFixed(2),
  };
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;