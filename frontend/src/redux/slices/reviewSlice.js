// src/redux/slices/reviewSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ✅ API Base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 🔧 FIX: Token 'userInfo' object ke andar store hota hai, alag 'token' key mein nahi
const getToken = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    if (!userInfo) return null;
    const parsed = JSON.parse(userInfo);
    return parsed?.token || null;
  } catch (err) {
    console.error('❌ Error parsing userInfo from localStorage:', err);
    return null;
  }
};

// ✅ Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Request interceptor — Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ✅ Response interceptor — Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Unauthorized! Token may be expired.');
      localStorage.removeItem('userInfo');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========================================
// ✅ Async Thunks — Admin
// ========================================

export const fetchAllReviews = createAsyncThunk(
  'reviews/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found. Please login.');
      }
      const response = await api.get('/reviews/admin/all');
      if (!response.data) {
        return rejectWithValue('No data received from server');
      }
      return response.data;
    } catch (error) {
      console.error('❌ fetchAllReviews error:', error);
      if (error.response) {
        return rejectWithValue(
          error.response.data?.message ||
          error.response.statusText ||
          'Failed to fetch reviews'
        );
      } else if (error.request) {
        return rejectWithValue('No response from server. Please check your connection.');
      } else {
        return rejectWithValue(error.message || 'An unexpected error occurred');
      }
    }
  }
);

export const fetchReviewDetails = createAsyncThunk(
  'reviews/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found. Please login.');
      }
      const response = await api.get(`/reviews/admin/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ fetchReviewDetails error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch review details'
      );
    }
  }
);

export const updateReviewStatus = createAsyncThunk(
  'reviews/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found. Please login.');
      }
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return rejectWithValue('Invalid status. Must be: pending, approved, or rejected');
      }
      const response = await api.put(`/reviews/admin/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('❌ updateReviewStatus error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update review status'
      );
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found. Please login.');
      }
      await api.delete(`/reviews/admin/${id}`);
      return id;
    } catch (error) {
      console.error('❌ deleteReview error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete review'
      );
    }
  }
);

export const replyToReview = createAsyncThunk(
  'reviews/reply',
  async ({ id, reply }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found. Please login.');
      }
      if (!reply || reply.trim().length === 0) {
        return rejectWithValue('Reply message is required');
      }
      const response = await api.put(`/reviews/admin/${id}/reply`, { reply: reply.trim() });
      return response.data;
    } catch (error) {
      console.error('❌ replyToReview error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to reply to review'
      );
    }
  }
);

export const bulkUpdateReviews = createAsyncThunk(
  'reviews/bulkUpdate',
  async ({ reviewIds, status }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('No authentication token found. Please login.');
      }
      if (!reviewIds || reviewIds.length === 0) {
        return rejectWithValue('No reviews selected');
      }
      const response = await api.post('/reviews/admin/bulk', { reviewIds, status });
      return response.data;
    } catch (error) {
      console.error('❌ bulkUpdateReviews error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to bulk update reviews'
      );
    }
  }
);

// ========================================
// 🔧 NEW: Async Thunks — Public / Customer
// ========================================

// ✅ Create a review (Customer)
export const createReview = createAsyncThunk(
  'reviews/create',
  async ({ productId, rating, comment }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('Please login to submit a review');
      }
      const response = await api.post('/reviews', {
        product: productId,
        rating,
        comment,
      });
      return response.data;
    } catch (error) {
      console.error('❌ createReview error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to submit review'
      );
    }
  }
);

// ✅ Get reviews for a specific product (Public)
export const getProductReviews = createAsyncThunk(
  'reviews/getProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/product/${productId}`);
      return response.data;
    } catch (error) {
      console.error('❌ getProductReviews error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch product reviews'
      );
    }
  }
);

// ✅ Get logged-in user's own reviews
export const getUserReviews = createAsyncThunk(
  'reviews/getUserReviews',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('Please login to view your reviews');
      }
      const response = await api.get('/reviews/my-reviews');
      return response.data;
    } catch (error) {
      console.error('❌ getUserReviews error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch your reviews'
      );
    }
  }
);

// ✅ Update own review
export const updateOwnReview = createAsyncThunk(
  'reviews/updateOwn',
  async ({ id, rating, comment }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('Please login to update your review');
      }
      const response = await api.put(`/reviews/${id}`, { rating, comment });
      return response.data;
    } catch (error) {
      console.error('❌ updateOwnReview error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update review'
      );
    }
  }
);

// ✅ Delete own review
export const deleteOwnReview = createAsyncThunk(
  'reviews/deleteOwn',
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('Please login to delete your review');
      }
      await api.delete(`/reviews/${id}`);
      return id;
    } catch (error) {
      console.error('❌ deleteOwnReview error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete review'
      );
    }
  }
);

// ✅ Mark review as helpful
export const markHelpful = createAsyncThunk(
  'reviews/markHelpful',
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('Please login to mark this review as helpful');
      }
      const response = await api.put(`/reviews/${id}/helpful`);
      return response.data;
    } catch (error) {
      console.error('❌ markHelpful error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to mark review as helpful'
      );
    }
  }
);

// ✅ Report a review
export const reportReview = createAsyncThunk(
  'reviews/report',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) {
        return rejectWithValue('Please login to report a review');
      }
      const response = await api.post(`/reviews/${id}/report`, { reason });
      return response.data;
    } catch (error) {
      console.error('❌ reportReview error:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to report review'
      );
    }
  }
);

// ========================================
// ✅ Initial State
// ========================================

const initialState = {
  reviews: [],
  productReviews: [],          // 🔧 NEW: current product ki approved reviews
  productReviewsLoading: false, // 🔧 NEW
  myReviews: [],                // 🔧 NEW: logged-in user ki apni reviews
  myReviewsLoading: false,      // 🔧 NEW
  currentReview: null,
  loading: false,
  error: null,
  success: false,
  stats: {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    avgRating: 0,
  },
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  },
  filters: {
    status: 'all',
    rating: 'all',
    search: '',
    sort: '-createdAt',
  },
};

// ========================================
// ✅ Review Slice
// ========================================

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
      state.success = false;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.currentReview = null;
      state.stats = initialState.stats;
      state.pagination = initialState.pagination;
      state.error = null;
      state.success = false;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    },
    setReviewFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetReviewFilters: (state) => {
      state.filters = initialState.filters;
    },
    setReviewPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    // 🔧 NEW: clear product reviews (e.g. when navigating away from a product page)
    clearProductReviews: (state) => {
      state.productReviews = [];
    },
  },

  extraReducers: (builder) => {
    builder
      // ======== Fetch All Reviews (Admin) ========
      .addCase(fetchAllReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.reviews = action.payload.reviews || [];
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        } else {
          const reviews = state.reviews;
          state.stats.total = reviews.length;
          state.stats.approved = reviews.filter(r => r.status === 'approved').length;
          state.stats.pending = reviews.filter(r => r.status === 'pending').length;
          state.stats.rejected = reviews.filter(r => r.status === 'rejected').length;
          state.stats.avgRating = reviews.length > 0
            ? parseFloat((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1))
            : 0;
        }
        if (action.payload.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchAllReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch reviews';
        state.success = false;
      })

      // ======== Fetch Review Details (Admin) ========
      .addCase(fetchReviewDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload.review;
        state.success = true;
      })
      .addCase(fetchReviewDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch review details';
        state.success = false;
      })

      // ======== Update Review Status (Admin) ========
      .addCase(updateReviewStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateReviewStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updatedReview = action.payload.review;
        if (updatedReview) {
          const index = state.reviews.findIndex(r =>
            (r._id || r.id) === (updatedReview._id || updatedReview.id)
          );
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
          if (state.currentReview &&
              (state.currentReview._id || state.currentReview.id) === (updatedReview._id || updatedReview.id)) {
            state.currentReview = updatedReview;
          }
          const reviews = state.reviews;
          state.stats.total = reviews.length;
          state.stats.approved = reviews.filter(r => r.status === 'approved').length;
          state.stats.pending = reviews.filter(r => r.status === 'pending').length;
          state.stats.rejected = reviews.filter(r => r.status === 'rejected').length;
          state.stats.avgRating = reviews.length > 0
            ? parseFloat((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1))
            : 0;
        }
      })
      .addCase(updateReviewStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update review status';
        state.success = false;
      })

      // ======== Delete Review (Admin) ========
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const deletedId = action.payload;
        state.reviews = state.reviews.filter(r => (r._id || r.id) !== deletedId);
        if (state.currentReview &&
            (state.currentReview._id || state.currentReview.id) === deletedId) {
          state.currentReview = null;
        }
        const reviews = state.reviews;
        state.stats.total = reviews.length;
        state.stats.approved = reviews.filter(r => r.status === 'approved').length;
        state.stats.pending = reviews.filter(r => r.status === 'pending').length;
        state.stats.rejected = reviews.filter(r => r.status === 'rejected').length;
        state.stats.avgRating = reviews.length > 0
          ? parseFloat((reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1))
          : 0;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete review';
        state.success = false;
      })

      // ======== Reply to Review (Admin) ========
      .addCase(replyToReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(replyToReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const updatedReview = action.payload.review;
        if (updatedReview) {
          const index = state.reviews.findIndex(r =>
            (r._id || r.id) === (updatedReview._id || updatedReview.id)
          );
          if (index !== -1) {
            state.reviews[index] = updatedReview;
          }
          if (state.currentReview &&
              (state.currentReview._id || state.currentReview.id) === (updatedReview._id || updatedReview.id)) {
            state.currentReview = updatedReview;
          }
        }
      })
      .addCase(replyToReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to reply to review';
        state.success = false;
      })

      // ======== Bulk Update Reviews (Admin) ========
      .addCase(bulkUpdateReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(bulkUpdateReviews.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(bulkUpdateReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to bulk update reviews';
        state.success = false;
      })

      // ======== 🔧 NEW: Create Review (Customer) ========
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        if (action.payload?.review) {
          state.productReviews = [action.payload.review, ...state.productReviews];
        }
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to submit review';
        state.success = false;
      })

      // ======== 🔧 NEW: Get Product Reviews (Public) ========
      .addCase(getProductReviews.pending, (state) => {
        state.productReviewsLoading = true;
      })
      .addCase(getProductReviews.fulfilled, (state, action) => {
        state.productReviewsLoading = false;
        state.productReviews = action.payload.reviews || action.payload || [];
      })
      .addCase(getProductReviews.rejected, (state) => {
        state.productReviewsLoading = false;
      })

      // ======== 🔧 NEW: Get User's Own Reviews ========
      .addCase(getUserReviews.pending, (state) => {
        state.myReviewsLoading = true;
      })
      .addCase(getUserReviews.fulfilled, (state, action) => {
        state.myReviewsLoading = false;
        state.myReviews = action.payload.reviews || action.payload || [];
      })
      .addCase(getUserReviews.rejected, (state, action) => {
        state.myReviewsLoading = false;
        state.error = action.payload || 'Failed to fetch your reviews';
      })

      // ======== 🔧 NEW: Update Own Review ========
      .addCase(updateOwnReview.fulfilled, (state, action) => {
        const updated = action.payload.review;
        if (updated) {
          const idx = state.myReviews.findIndex(r => (r._id || r.id) === (updated._id || updated.id));
          if (idx !== -1) state.myReviews[idx] = updated;
        }
      })

      // ======== 🔧 NEW: Delete Own Review ========
      .addCase(deleteOwnReview.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.myReviews = state.myReviews.filter(r => (r._id || r.id) !== deletedId);
        state.productReviews = state.productReviews.filter(r => (r._id || r.id) !== deletedId);
      })

      // ======== 🔧 NEW: Mark Helpful ========
      .addCase(markHelpful.fulfilled, (state, action) => {
        const updated = action.payload.review;
        if (updated) {
          const idx = state.productReviews.findIndex(r => (r._id || r.id) === (updated._id || updated.id));
          if (idx !== -1) state.productReviews[idx] = updated;
        }
      });
  },
});

// ========================================
// ✅ Export Actions
// ========================================

export const {
  clearReviewError,
  clearReviews,
  clearCurrentReview,
  setReviewFilters,
  resetReviewFilters,
  setReviewPagination,
  clearProductReviews, // 🔧 NEW
} = reviewSlice.actions;

// ========================================
// ✅ Selectors
// ========================================

export const selectAllReviews = (state) => state.reviews.reviews;
export const selectCurrentReview = (state) => state.reviews.currentReview;
export const selectReviewsLoading = (state) => state.reviews.loading;
export const selectReviewsError = (state) => state.reviews.error;
export const selectReviewsStats = (state) => state.reviews.stats;
export const selectReviewsPagination = (state) => state.reviews.pagination;
export const selectReviewsFilters = (state) => state.reviews.filters;
export const selectReviewById = (state, id) => {
  return state.reviews.reviews.find(r => (r._id || r.id) === id);
};

// 🔧 NEW selectors
export const selectProductReviews = (state) => state.reviews.productReviews;
export const selectProductReviewsLoading = (state) => state.reviews.productReviewsLoading;
export const selectMyReviews = (state) => state.reviews.myReviews;
export const selectMyReviewsLoading = (state) => state.reviews.myReviewsLoading;

export const selectFilteredReviewsCount = (state) => {
  const { reviews, filters } = state.reviews;
  let filtered = [...reviews];

  if (filters.status !== 'all') {
    filtered = filtered.filter(r => r.status === filters.status);
  }
  if (filters.rating !== 'all') {
    const rating = parseInt(filters.rating);
    filtered = filtered.filter(r => Math.floor(r.rating) === rating);
  }
  if (filters.search) {
    const term = filters.search.toLowerCase();
    filtered = filtered.filter(r =>
      r.product?.name?.toLowerCase().includes(term) ||
      r.user?.name?.toLowerCase().includes(term) ||
      r.comment?.toLowerCase().includes(term)
    );
  }
  return filtered.length;
};

export default reviewSlice.reducer;