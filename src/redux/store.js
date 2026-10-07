import { configureStore } from '@reduxjs/toolkit';
import customerReducer from './slices/customerSlice';
import ownerStaffReducer from './slices/ownerStaffSlice';
import cartReducer from './slices/cartSlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    ownerStaff: ownerStaffReducer,
    cart: cartReducer,
    location: locationReducer,
  },
});

export default store;
