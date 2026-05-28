import { configureStore } from '@reduxjs/toolkit';
import customerReducer from './slices/customerSlice';
import ownerStaffReducer from './slices/ownerStaffSlice';

export const store = configureStore({
  reducer: {
    customer: customerReducer,
    ownerStaff: ownerStaffReducer,
  },
});

export default store;
