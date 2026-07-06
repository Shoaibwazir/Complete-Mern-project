import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: localStorage.getItem('wishlistItems')
    ? JSON.parse(localStorage.getItem('wishlistItems'))
    : [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const item = action.payload;
      const exists = state.items.find((i) => i._id === item._id);
      
      if (!exists) {
        state.items.push(item);
        localStorage.setItem('wishlistItems', JSON.stringify(state.items));
      }
    },
    
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      localStorage.setItem('wishlistItems', JSON.stringify(state.items));
    },
    
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlistItems');
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;