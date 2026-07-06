// import { configureStore } from '@reduxjs/toolkit';
// import cartReducer from './../redux/slices/cartSlice';
// import wishlistReducer from './../redux/slices/wishlistSlice';

// export const store = configureStore({
//   reducer: {
//     cart: cartReducer,
//     wishlist: wishlistReducer
//   }
// });

// export default store;


// src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import wishlistReducer from './slices/wishlistSlice';
import orderReducer from './slices/orderSlice'; // ✅ Add this
import reviewReducer from './slices/reviewSlice';


export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    products: productReducer,
    wishlist: wishlistReducer,
    orders: orderReducer, // ✅ Add order slice
     reviews: reviewReducer,  // ✅ Add this

  },
});




