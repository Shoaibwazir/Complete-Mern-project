// backend/controllers/couponController.js
import Coupon from '../models/Coupon.js';

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get active coupons for frontend
// @route   GET /api/coupons/active
// @access  Public
export const getActiveCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

    const featured = coupons.filter(c => c.isFeatured);
    const regular = coupons.filter(c => !c.isFeatured);

    res.status(200).json({
      success: true,
      data: {
        featured,
        regular,
        all: coupons,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get featured coupons for banner
// @route   GET /api/coupons/featured
// @access  Public
export const getFeaturedCoupons = async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      isFeatured: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: coupons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public
export const validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal, userId } = req.body;
    
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required',
      });
    }

    const result = await Coupon.applyCoupon(code, cartTotal);
    
    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        coupon: result.coupon,
        discountAmount: result.discount,
        discountType: result.discountType,
        formattedDiscount: result.formattedDiscount,
        message: `Coupon ${result.coupon.code} applied successfully!`,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);
    res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists. Please use a different code.',
      });
    }
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Coupon deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/coupons/:id/toggle-featured
// @access  Private/Admin
export const toggleFeatured = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found',
      });
    }
    
    coupon.isFeatured = !coupon.isFeatured;
    await coupon.save();
    
    res.status(200).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};