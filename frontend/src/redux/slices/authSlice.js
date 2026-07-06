// src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// ✅ FIXED: Clean API URL construction - NO duplicate /auth
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_URL = `${BASE_URL}/auth`;

const normalizeAuthPayload = (data) => {
  if (!data) return null;
  return {
    _id: data._id || data.user?._id,
    name: data.name || data.user?.name,
    email: data.email || data.user?.email,
    isAdmin: Boolean(data.isAdmin ?? data.user?.isAdmin),
    token: data.token,
  };
};

const persistUserInfo = (data) => {
  const normalized = normalizeAuthPayload(data);
  if (normalized?.token) {
    localStorage.setItem('userInfo', JSON.stringify(normalized));
  }
  return normalized;
};

// ========================================
// ✅ REGISTER USER
// ========================================
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('📝 Registering user:', userData.email);
      console.log('📡 Endpoint:', `${API_URL}/register`);
      
      const response = await axios.post(`${API_URL}/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Registration response:', response.data);
      
      const normalized = persistUserInfo(response.data);
      return normalized || response.data;
    } catch (error) {
      console.error('❌ Registration API error:', error);
      
      let message = 'Registration failed. Please try again.';
      
      if (error.response) {
        message = error.response.data?.message 
          || error.response.data?.error 
          || `Server error: ${error.response.status}`;
      } else if (error.request) {
        message = 'Server not responding. Please check your connection.';
      }
      
      return rejectWithValue(message);
    }
  }
);

// ========================================
// ✅ LOGIN USER - FIXED
// ========================================
export const login = createAsyncThunk(
  'auth/login',
  async (userData, { rejectWithValue }) => {
    try {
      console.log('🔐 Logging in user:', userData.email);
      console.log('📡 Endpoint:', `${API_URL}/login`);
      
      const response = await axios.post(`${API_URL}/login`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Login response:', response.data);

      if (!response.data?.token) {
        return rejectWithValue('Login succeeded but no token received from server');
      }
      
      const normalized = persistUserInfo(response.data);
      return normalized;
    } catch (error) {
      console.error('❌ Login API error:', error);
      
      let message = 'Login failed. Please check your credentials.';
      
      if (error.response) {
        // Server responded with error
        message = error.response.data?.message 
          || error.response.data?.error 
          || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // No response from server
        message = 'Server not responding. Please check your connection.';
      }
      
      return rejectWithValue(message);
    }
  }
);

// ========================================
// ✅ LOGOUT USER
// ========================================
export const logout = createAsyncThunk('auth/logout', async (_, { getState }) => {
  const { userInfo } = getState().auth;

  try {
    if (userInfo?.token) {
      await axios.post(
        `${API_URL}/logout`,
        {},
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
    }
  } catch (error) {
    console.warn('Logout API call failed (client session still cleared):', error.message);
  }

  localStorage.removeItem('userInfo');
  localStorage.removeItem('lastOrderId');
  localStorage.removeItem('lastPaymentMethod');
  return null;
});

// ========================================
// ✅ GET USER PROFILE
// ========================================
export const getUserProfile = createAsyncThunk(
  'auth/getUserProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;
      
      if (!userInfo || !userInfo.token) {
        return rejectWithValue('No token found');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log('📡 Fetching profile:', `${API_URL}/profile`);
      const response = await axios.get(`${API_URL}/profile`, config);
      return response.data;
    } catch (error) {
      console.error('❌ Profile error:', error);
      
      let message = 'Failed to get profile';
      
      if (error.response) {
        message = error.response.data?.message 
          || error.response.data?.error 
          || `Server error: ${error.response.status}`;
      }
      
      return rejectWithValue(message);
    }
  }
);

// ========================================
// ✅ UPDATE USER PROFILE
// ========================================
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;
      
      if (!userInfo || !userInfo.token) {
        return rejectWithValue('No token found');
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log('📡 Updating profile:', `${API_URL}/profile`);
      const response = await axios.put(`${API_URL}/profile`, userData, config);
      
      if (response.data) {
        const updatedUser = { ...userInfo, ...response.data };
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Update profile error:', error);
      
      let message = 'Failed to update profile';
      
      if (error.response) {
        message = error.response.data?.message 
          || error.response.data?.error 
          || `Server error: ${error.response.status}`;
      }
      
      return rejectWithValue(message);
    }
  }
);

// ========================================
// ✅ INITIAL STATE
// ========================================
const initialState = {
  userInfo: localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo')) 
    : null,
  loading: false,
  error: null,
  success: false,
  isAuthenticated: !!localStorage.getItem('userInfo'),
  isAdmin: localStorage.getItem('userInfo') 
    ? JSON.parse(localStorage.getItem('userInfo'))?.isAdmin || false
    : false,
};

// ========================================
// ✅ AUTH SLICE
// ========================================
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetAuth: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isAdmin = action.payload?.isAdmin || false;
      if (action.payload) {
        localStorage.setItem('userInfo', JSON.stringify(action.payload));
      }
    },
    clearUserInfo: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      localStorage.removeItem('userInfo');
    },
  },
  extraReducers: (builder) => {
    builder
      // ======== REGISTER ========
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = action.payload?.isAdmin || false;
        state.success = true;
        state.error = null;
        console.log('✅ Registration fulfilled');
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        state.isAuthenticated = false;
        console.error('❌ Registration rejected:', action.payload);
      })
      
      // ======== LOGIN ========
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = action.payload?.isAdmin || false;
        state.success = true;
        state.error = null;
        console.log('✅ Login fulfilled');
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
        state.isAuthenticated = false;
        console.error('❌ Login rejected:', action.payload);
      })
      
      // ======== LOGOUT ========
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.userInfo = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.loading = false;
        state.error = null;
        state.success = false;
        console.log('✅ Logout successful');
      })
      
      // ======== GET PROFILE ========
      .addCase(getUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = { ...state.userInfo, ...action.payload };
        state.isAuthenticated = true;
        state.isAdmin = action.payload?.isAdmin || false;
        if (action.payload) {
          localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        }
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ======== UPDATE PROFILE ========
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = { ...state.userInfo, ...action.payload };
        state.isAuthenticated = true;
        state.isAdmin = action.payload?.isAdmin || false;
        state.success = true;
        if (action.payload) {
          localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  resetAuth,
  setUserInfo,
  clearUserInfo
} = authSlice.actions;

export default authSlice.reducer;