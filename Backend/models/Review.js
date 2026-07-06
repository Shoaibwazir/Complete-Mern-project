// models/Review.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replies: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        reply: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        isAdmin: {
          type: Boolean,
          default: false,
        },
      },
    ],
    reported: {
      type: Boolean,
      default: false,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reportedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Index for better query performance
reviewSchema.index({ product: 1, status: 1 });
reviewSchema.index({ user: 1, product: 1 });
reviewSchema.index({ createdAt: -1 });

// ✅ Virtual: Check if user can edit/delete
reviewSchema.virtual('canModify').get(function () {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.createdAt >= sevenDaysAgo;
});

// ✅ Static: Calculate product rating stats
reviewSchema.statics.calculateProductStats = async function (productId) {
  try {
    const result = await this.aggregate([
      {
        $match: {
          product: productId,
          status: 'approved',
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingCounts: {
            $push: '$rating',
          },
        },
      },
    ]);

    if (result.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result[0].ratingCounts.forEach((rating) => {
      ratingCounts[rating] = (ratingCounts[rating] || 0) + 1;
    });

    return {
      averageRating: parseFloat(result[0].averageRating.toFixed(1)),
      totalReviews: result[0].totalReviews,
      ratingDistribution: ratingCounts,
    };
  } catch (error) {
    console.error('❌ Error calculating product stats:', error);
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
};

// ✅ Pre-save middleware to update product stats
reviewSchema.post('save', async function () {
  try {
    await this.constructor.calculateProductStats(this.product);
  } catch (error) {
    console.error('❌ Error in post-save hook:', error);
  }
});

// ✅ Pre-remove middleware to update product stats
reviewSchema.post('remove', async function () {
  try {
    await this.constructor.calculateProductStats(this.product);
  } catch (error) {
    console.error('❌ Error in post-remove hook:', error);
  }
});

// ✅ ✅ ✅ FIX: Default export
const Review = mongoose.model('Review', reviewSchema);
export default Review;