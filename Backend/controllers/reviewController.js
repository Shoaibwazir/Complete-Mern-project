// controllers/reviewController.js
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// ========================================
// ✅ Admin Controllers
// ========================================

// ✅ Get all reviews (Admin only)
export const getAllReviews = async (req, res) => {
  try {
    const { 
      status, 
      rating, 
      productId, 
      userId,
      search,
      sort = '-createdAt',
      page = 1,
      limit = 50 
    } = req.query;

    // Build filter
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (rating && rating !== 'all') {
      const ratingNum = parseInt(rating);
      filter.rating = { $gte: ratingNum, $lt: ratingNum + 1 };
    }
    
    if (productId) {
      filter.product = productId;
    }
    
    if (userId) {
      filter.user = userId;
    }
    
    if (search) {
      filter.$or = [
        { comment: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get reviews with populated data
    const reviews = await Review.find(filter)
      .populate('user', 'name email profileImage')
      .populate('product', 'name images sku category price')
      .populate('replies.user', 'name email isAdmin')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(filter);

    // Calculate stats
    const stats = await Review.aggregate([
      { $match: {} },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: { 
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pending: { 
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          rejected: { 
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          },
          avgRating: { $avg: '$rating' },
        },
      },
    ]);

    const statsData = stats[0] || {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      avgRating: 0,
    };

    res.status(200).json({
      success: true,
      reviews,
      stats: {
        total: statsData.total,
        approved: statsData.approved,
        pending: statsData.pending,
        rejected: statsData.rejected,
        avgRating: parseFloat((statsData.avgRating || 0).toFixed(1)),
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// ✅ Update review status (Approve/Reject) - Admin only
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: pending, approved, or rejected',
      });
    }

    // Find and update review
    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('user', 'name email profileImage')
      .populate('product', 'name images sku category price');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Update product stats
    await Review.calculateProductStats(review.product);

    res.status(200).json({
      success: true,
      message: `Review ${status} successfully`,
      review,
    });
  } catch (error) {
    console.error('❌ Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review status',
      error: error.message,
    });
  }
};

// ✅ Delete review - Admin only
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Delete the review
    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

// ✅ Reply to review - Admin only
export const replyToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply || reply.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required',
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Add reply
    review.replies.push({
      user: req.user.id,
      reply: reply.trim(),
      isAdmin: true,
    });

    await review.save();

    // Populate reply user
    await review.populate('replies.user', 'name email isAdmin');

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      review,
    });
  } catch (error) {
    console.error('❌ Error replying to review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reply',
      error: error.message,
    });
  }
};

// ✅ Get review details - Admin only
export const getReviewDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate('user', 'name email profileImage phone')
      .populate('product', 'name images sku category price description')
      .populate('order', 'orderNumber totalAmount status')
      .populate('replies.user', 'name email isAdmin');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('❌ Error fetching review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review',
      error: error.message,
    });
  }
};

// ✅ Bulk update reviews - Admin only
export const bulkUpdateReviews = async (req, res) => {
  try {
    const { reviewIds, status } = req.body;

    if (!reviewIds || reviewIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Review IDs are required',
      });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const result = await Review.updateMany(
      { _id: { $in: reviewIds } },
      { status }
    );

    // Update product stats for all affected products
    const affectedReviews = await Review.find({ _id: { $in: reviewIds } });
    const productIds = [...new Set(affectedReviews.map(r => r.product.toString()))];
    
    for (const productId of productIds) {
      await Review.calculateProductStats(productId);
    }

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} reviews updated successfully`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('❌ Error bulk updating reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update reviews',
      error: error.message,
    });
  }
};

// ========================================
// ✅ Public Controllers (for customers)
// ========================================

// ✅ Create review (Customer only)
export const createReview = async (req, res) => {
  try {
    const { productId, rating, title, comment, orderId } = req.body;

    // Validate required fields
    if (!productId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, rating, and comment are required',
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product: productId,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product',
      });
    }

    // Check if user purchased this product (verified purchase)
    let isVerifiedPurchase = false;
    if (orderId) {
      const order = await Order.findOne({
        _id: orderId,
        user: req.user.id,
        status: 'delivered',
        'items.product': productId,
      });
      isVerifiedPurchase = !!order;
    }

    // Create review
    const review = await Review.create({
      product: productId,
      user: req.user.id,
      rating,
      title,
      comment,
      order: orderId || null,
      isVerifiedPurchase,
      status: 'pending', // Default status
    });

    // Populate user data
    await review.populate('user', 'name email profileImage');

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    console.error('❌ Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create review',
      error: error.message,
    });
  }
};

// ✅ Get product reviews (Public)
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const filter = {
      product: productId,
      status: 'approved',
    };

    const reviews = await Review.find(filter)
      .populate('user', 'name profileImage')
      .populate('replies.user', 'name isAdmin')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(filter);

    // Get stats
    const stats = await Review.calculateProductStats(productId);

    res.status(200).json({
      success: true,
      reviews,
      stats,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// ✅ Get user reviews (Customer)
export const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name images sku category')
      .populate('replies.user', 'name isAdmin')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments({ user: req.user.id });

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};

// ✅ Update review (Customer only)
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, title, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review',
      });
    }

    // Check if can edit (within 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    if (review.createdAt < sevenDaysAgo) {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be edited within 7 days of submission',
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title) review.title = title;
    if (comment) review.comment = comment;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      review,
    });
  } catch (error) {
    console.error('❌ Error updating review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update review',
      error: error.message,
    });
  }
};

// ✅ Delete own review (Customer only)
export const deleteOwnReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review',
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete review',
      error: error.message,
    });
  }
};

// ✅ Mark review as helpful
export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    const userId = req.user.id;

    // Check if user already marked as helpful
    if (review.helpfulUsers.includes(userId)) {
      // Remove helpful (toggle)
      review.helpfulUsers = review.helpfulUsers.filter(
        (id) => id.toString() !== userId
      );
      review.helpfulCount = review.helpfulUsers.length;
    } else {
      review.helpfulUsers.push(userId);
      review.helpfulCount = review.helpfulUsers.length;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Helpful status toggled',
      helpfulCount: review.helpfulCount,
      isHelpful: review.helpfulUsers.includes(userId),
    });
  } catch (error) {
    console.error('❌ Error marking helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark review as helpful',
      error: error.message,
    });
  }
};

// ✅ Report review
export const reportReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reason is required',
      });
    }

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    // Check if user already reported
    const alreadyReported = review.reportedBy.some(
      (r) => r.user.toString() === req.user.id
    );

    if (alreadyReported) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this review',
      });
    }

    review.reportedBy.push({
      user: req.user.id,
      reason: reason.trim(),
    });
    review.reportCount = review.reportedBy.length;
    review.reported = true;

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Review reported successfully',
    });
  } catch (error) {
    console.error('❌ Error reporting review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to report review',
      error: error.message,
    });
  }
};