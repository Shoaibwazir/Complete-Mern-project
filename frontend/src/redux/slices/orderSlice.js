import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get user orders
export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.get('http://localhost:5001/api/orders/myorders', config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Get all orders (admin)
export const getAllOrders = createAsyncThunk(
  'orders/getAllOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().state;
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.get('http://localhost:5001/api/orders', config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update order status (admin)
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { getState, rejectWithValue }) => {
    try {
      const { userInfo } = getState().auth;
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const response = await axios.put(`http://localhost:5001/api/orders/${orderId}/status`, { status }, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  userOrders: [],
  allOrders: [],
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.userOrders = [];
      state.allOrders = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get all orders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.allOrders = action.payload;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;