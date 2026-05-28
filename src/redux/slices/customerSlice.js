import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Async thunk for customer login
export const loginCustomer = createAsyncThunk(
  'customer/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/customer/login', credentials);
      if (response.data.token) {
        localStorage.setItem('customerToken', response.data.token);
        localStorage.setItem('customerUser', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed.');
    }
  }
);

// Async thunk for switching tenant (salon)
export const switchTenant = createAsyncThunk(
  'customer/switchTenant',
  async (payload, { rejectWithValue }) => {
    try {
      // Payload: { token: string, tenantId: string (salonCode), salonName: string }
      const response = await axiosInstance.post('/customer/switch-tenant', payload);
      
      if (response.data.token) {
        localStorage.setItem('customerToken', response.data.token);
        localStorage.setItem('customerUser', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to switch salon.');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('customerUser')) || null,
  token: localStorage.getItem('customerToken') || null,
  isAuthenticated: !!localStorage.getItem('customerToken'),
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    logoutCustomer: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');
    },
    clearCustomerError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Switch Tenant
      .addCase(switchTenant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(switchTenant.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(switchTenant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logoutCustomer, clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
