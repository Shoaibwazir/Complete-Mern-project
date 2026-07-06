import { createSlice } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      return JSON.parse(savedCart);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
  }
  return [];
};

// Save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

// Load rental agreement from localStorage
const loadRentalAgreement = () => {
  try {
    const saved = localStorage.getItem('rentalAgreementData');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading rental agreement:', error);
  }
  return null;
};

const initialState = {
  items: loadCartFromStorage(),
  loading: false,
  error: null,
  totalQuantity: 0,
  totalAmount: 0,
  rentalAgreement: loadRentalAgreement(),
};

// ✅ Calculate totals with rental support
const calculateTotals = (items) => {
  let totalQuantity = 0;
  let totalAmount = 0;

  items.forEach((item) => {
    const qty = item.quantity || 1;
    totalQuantity += qty;

    if (item.isRental) {
      // Rental item: rent total + deposit
      const rentTotal = (item.rentalPricePerDay || 0) * (item.rentalDays || 1) * qty;
      const deposit = item.deposit || 0;
      totalAmount += rentTotal + deposit;
    } else {
      // Sale item: price × quantity
      totalAmount += (item.price || 0) * qty;
    }
  });

  return { totalQuantity, totalAmount };
};

// ✅ Helper: Find item by ID and rental status
const findItem = (items, id, isRental = false) => {
  return items.find(item => item._id === id && item.isRental === isRental);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // ✅ Add item to cart (supports both sale and rental)
    addToCart: (state, action) => {
      const item = action.payload;
      const isRental = item.isRental || false;
      
      // Find existing item (same ID and same rental status)
      const existingItem = findItem(state.items, item._id, isRental);

      if (existingItem) {
        // Update quantity
        existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
        
        // If rental, update rental days and totals
        if (isRental) {
          existingItem.rentalDays = item.rentalDays || existingItem.rentalDays || 1;
          existingItem.rentalPricePerDay = item.rentalPricePerDay || existingItem.rentalPricePerDay || 0;
          existingItem.rentalTotal = (existingItem.rentalPricePerDay || 0) * (existingItem.rentalDays || 1) * (existingItem.quantity || 1);
          existingItem.deposit = item.deposit || existingItem.deposit || 0;
          existingItem.totalWithDeposit = existingItem.rentalTotal + existingItem.deposit;
          existingItem.agreement = item.agreement || existingItem.agreement;
        }
      } else {
        // New item
        const newItem = { 
          ...item, 
          quantity: item.quantity || 1,
          isRental: isRental,
        };
        
        // Set default rental values if rental
        if (isRental) {
          newItem.rentalDays = item.rentalDays || 1;
          newItem.rentalPricePerDay = item.rentalPricePerDay || 0;
          newItem.rentalTotal = (newItem.rentalPricePerDay || 0) * (newItem.rentalDays || 1) * (newItem.quantity || 1);
          newItem.deposit = item.deposit || 0;
          newItem.totalWithDeposit = newItem.rentalTotal + newItem.deposit;
          newItem.agreement = item.agreement || null;
        }
        
        state.items.push(newItem);
      }

      // ✅ Store rental agreement if present
      if (isRental && item.agreement) {
        state.rentalAgreement = item.agreement;
        try {
          localStorage.setItem('rentalAgreementData', JSON.stringify(item.agreement));
        } catch (error) {
          console.error('Error saving rental agreement:', error);
        }
      }

      // Recalculate totals
      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      saveCartToStorage(state.items);
    },

    // ✅ Update quantity (supports both sale and rental)
    updateCartQuantity: (state, action) => {
      const { id, quantity, isRental = false } = action.payload;
      const item = findItem(state.items, id, isRental);

      if (item) {
        const maxQty = item.isRental ? 5 : (item.stock || 99);
        item.quantity = Math.max(1, Math.min(quantity, maxQty));
        
        // If rental, update rental totals
        if (item.isRental) {
          item.rentalTotal = (item.rentalPricePerDay || 0) * (item.rentalDays || 1) * (item.quantity || 1);
          item.totalWithDeposit = item.rentalTotal + (item.deposit || 0);
        }
      }

      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      saveCartToStorage(state.items);
    },

    // ✅ Alias for updateCartQuantity (for backward compatibility)
    updateQuantity: (state, action) => {
      const { id, quantity, isRental = false } = action.payload;
      const item = findItem(state.items, id, isRental);

      if (item) {
        const maxQty = item.isRental ? 5 : (item.stock || 99);
        item.quantity = Math.max(1, Math.min(quantity, maxQty));
        
        if (item.isRental) {
          item.rentalTotal = (item.rentalPricePerDay || 0) * (item.rentalDays || 1) * (item.quantity || 1);
          item.totalWithDeposit = item.rentalTotal + (item.deposit || 0);
        }
      }

      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      saveCartToStorage(state.items);
    },

    // ✅ Update rental days
    updateRentalDays: (state, action) => {
      const { id, rentalDays } = action.payload;
      const item = findItem(state.items, id, true);

      if (item && item.isRental) {
        item.rentalDays = Math.max(1, Math.min(rentalDays, 30));
        item.rentalTotal = (item.rentalPricePerDay || 0) * (item.rentalDays || 1) * (item.quantity || 1);
        item.totalWithDeposit = item.rentalTotal + (item.deposit || 0);
        
        // Update agreement
        if (item.agreement) {
          item.agreement.rentalDays = item.rentalDays;
          item.agreement.rentFee = item.rentalTotal;
          item.agreement.totalPaid = item.totalWithDeposit;
          state.rentalAgreement = item.agreement;
          try {
            localStorage.setItem('rentalAgreementData', JSON.stringify(item.agreement));
          } catch (error) {
            console.error('Error saving rental agreement:', error);
          }
        }
      }

      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      saveCartToStorage(state.items);
    },

    // ✅ Remove from cart (supports both sale and rental)
    removeFromCart: (state, action) => {
      // Support both { id, isRental } and just id (for backward compatibility)
      const payload = action.payload;
      let id, isRental = false;
      
      if (typeof payload === 'object') {
        id = payload.id;
        isRental = payload.isRental || false;
      } else {
        id = payload;
      }

      state.items = state.items.filter(item => !(item._id === id && item.isRental === isRental));

      // If rental agreement was for removed item, clear it
      if (isRental) {
        const hasRentalItems = state.items.some(item => item.isRental === true);
        if (!hasRentalItems) {
          state.rentalAgreement = null;
          try {
            localStorage.removeItem('rentalAgreementData');
          } catch (error) {
            console.error('Error removing rental agreement:', error);
          }
        }
      }

      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      saveCartToStorage(state.items);
    },

    // ✅ Alias for removeFromCart
    removeCartItem: (state, action) => {
      const payload = action.payload;
      let id, isRental = false;
      
      if (typeof payload === 'object') {
        id = payload.id;
        isRental = payload.isRental || false;
      } else {
        id = payload;
      }

      state.items = state.items.filter(item => !(item._id === id && item.isRental === isRental));

      if (isRental) {
        const hasRentalItems = state.items.some(item => item.isRental === true);
        if (!hasRentalItems) {
          state.rentalAgreement = null;
          try {
            localStorage.removeItem('rentalAgreementData');
          } catch (error) {
            console.error('Error removing rental agreement:', error);
          }
        }
      }

      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      saveCartToStorage(state.items);
    },

    // ✅ Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
      state.rentalAgreement = null;
      
      saveCartToStorage(state.items);
      try {
        localStorage.removeItem('rentalAgreementData');
      } catch (error) {
        console.error('Error removing rental agreement:', error);
      }
    },

    // ✅ Increase quantity
    increaseQuantity: (state, action) => {
      const { id, isRental = false } = action.payload;
      const item = findItem(state.items, id, isRental);
      
      if (item) {
        const maxQty = item.isRental ? 5 : (item.stock || 99);
        if (item.quantity < maxQty) {
          item.quantity = (item.quantity || 1) + 1;
          
          if (item.isRental) {
            item.rentalTotal = (item.rentalPricePerDay || 0) * (item.rentalDays || 1) * (item.quantity || 1);
            item.totalWithDeposit = item.rentalTotal + (item.deposit || 0);
          }
        }
      }

      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      saveCartToStorage(state.items);
    },

    // ✅ Decrease quantity
    decreaseQuantity: (state, action) => {
      const { id, isRental = false } = action.payload;
      const item = findItem(state.items, id, isRental);
      
      if (item && (item.quantity || 1) > 1) {
        item.quantity = (item.quantity || 1) - 1;
        
        if (item.isRental) {
          item.rentalTotal = (item.rentalPricePerDay || 0) * (item.rentalDays || 1) * (item.quantity || 1);
          item.totalWithDeposit = item.rentalTotal + (item.deposit || 0);
        }
      }

      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;

      saveCartToStorage(state.items);
    },

    // ✅ Set rental agreement
    setRentalAgreement: (state, action) => {
      state.rentalAgreement = action.payload;
      if (action.payload) {
        try {
          localStorage.setItem('rentalAgreementData', JSON.stringify(action.payload));
        } catch (error) {
          console.error('Error saving rental agreement:', error);
        }
      } else {
        try {
          localStorage.removeItem('rentalAgreementData');
        } catch (error) {
          console.error('Error removing rental agreement:', error);
        }
      }
    },

    // ✅ Load cart from storage (for app initialization)
    loadCart: (state) => {
      state.items = loadCartFromStorage();
      state.rentalAgreement = loadRentalAgreement();
      const { totalQuantity, totalAmount } = calculateTotals(state.items);
      state.totalQuantity = totalQuantity;
      state.totalAmount = totalAmount;
    },
  }
});

// Export all actions
export const { 
  addToCart, 
  updateCartQuantity,
  updateQuantity,
  updateRentalDays,
  removeFromCart, 
  removeCartItem,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
  setRentalAgreement,
  loadCart,
} = cartSlice.actions;

// Export selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.totalAmount;
export const selectCartQuantity = (state) => state.cart.totalQuantity;
export const selectRentalAgreement = (state) => state.cart.rentalAgreement;
export const selectIsRentalItem = (state, id) => {
  return state.cart.items.some(item => item._id === id && item.isRental === true);
};

// Export reducer
export default cartSlice.reducer;