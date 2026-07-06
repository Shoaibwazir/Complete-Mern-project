import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { filterProductsByCategory } from '../../utils/productFilters';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const parseProductsResponse = (data) => {
  if (data?.success && Array.isArray(data.products)) return data.products;
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.product && Array.isArray(data.product)) return data.product;
  return [];
};

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      return parseProductsResponse(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (category, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        params: { category, listingType: 'sale' },
      });

      let products = parseProductsResponse(response.data);
      products = filterProductsByCategory(products, category).filter(
        (p) => (p.listingType || 'sale') !== 'rental'
      );

      return { category, products };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchRentalProducts = createAsyncThunk(
  'products/fetchRentalProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products`, {
        params: { listingType: 'rental' },
      });

      let products = parseProductsResponse(response.data);
      products = products.filter(
        (p) =>
          p.listingType === 'rental' ||
          p.listingType === 'both' ||
          p.isRental ||
          p.rental?.available === true
      );

      return products;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/products/product/${id}`);
      return response.data.product || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    activeCategory: null,
    selectedProduct: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearProducts: (state) => {
      state.items = [];
      state.activeCategory = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.activeCategory = action.payload.category;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })
      .addCase(fetchRentalProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.items = [];
        state.activeCategory = 'rental';
      })
      .addCase(fetchRentalProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.activeCategory = 'rental';
      })
      .addCase(fetchRentalProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedProduct, clearProducts } = productSlice.actions;
export default productSlice.reducer;
