import { configureStore } from '@reduxjs/toolkit';
import customerReducer from './slices/customerSlice';
import ownerStaffReducer from './slices/ownerStaffSlice';
import cartReducer from './slices/cartSlice';

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    ownerStaff: ownerStaffReducer,
    cart: cartReducer,
  },
});

export default store;
