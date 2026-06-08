import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
// import { searchSalonsByLocation } from '../../redux/slices/customerSlice';

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
      // Payload: { token: string, salonId: number, salonName: string }
      const response = await axiosInstance.post('/customer/switch-salon', payload);
      
      if (response.data.token) {
        localStorage.setItem('customerToken', response.data.token);
        localStorage.setItem('customerUser', JSON.stringify(response.data));
        localStorage.setItem('activeSalonId', payload.salonId);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to switch salon.');
    }
  }
);

export const searchSalonsByLocation = createAsyncThunk(
  'customer/searchSalonsByLocation',
  async ({ cityName, areaName }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/salons/location-search?cityName=${cityName}&areaName=${areaName}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Search failed.'
      );
    }
  },
  {
    condition: (_, { getState }) => {
      const { customer } = getState();
      if (customer.loading) {
        return false;
      }
    }
  }
);

// Async thunk to fetch customer profile
export const fetchCustomerProfile = createAsyncThunk(
  'customer/fetchProfile',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/customer/${id}`);
      localStorage.setItem('customerProfile', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer profile.');
    }
  },
  {
    condition: (id, { getState }) => {
      const { customer } = getState();
      if (customer.loading || (customer.profile && (customer.profile.id === id || customer.profile.customerId === id))) {
        return false;
      }
    }
  }
);

// Async thunk to logout customer via API
export const logoutCustomerApi = createAsyncThunk(
  'customer/logoutApi',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await axiosInstance.post('/customer/logout');
      dispatch(logoutCustomer());
    } catch (error) {
      // Clear local storage and log out client even if API request fails
      dispatch(logoutCustomer());
      return rejectWithValue(error.response?.data?.message || 'Logout API failed.');
    }
  }
);


// Async thunk to update customer profile
export const updateCustomerProfile = createAsyncThunk(
  'customer/updateProfile',
  async ({ id, profileData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/customer/${id}`, profileData);
      localStorage.setItem('customerProfile', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update customer profile.');
    }
  }
);


const initialState = {
  user: JSON.parse(localStorage.getItem('customerUser')) || null,
  profile: JSON.parse(localStorage.getItem('customerProfile')) || null,
  token: localStorage.getItem('customerToken') || null,
  isAuthenticated: !!localStorage.getItem('customerToken'),
  loading: false,
  error: null,
  salonResults: [],
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    logoutCustomer: (state) => {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');
      localStorage.removeItem('customerProfile');
      localStorage.removeItem('activeSalonId');
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
      })
      // Search Salons
      .addCase(searchSalonsByLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(searchSalonsByLocation.fulfilled, (state, action) => {
        state.loading = false;
        state.salonResults = action.payload;
      })

      .addCase(searchSalonsByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.salonResults = [];
      })
      // Fetch Profile
      .addCase(fetchCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateCustomerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateCustomerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { logoutCustomer, clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
