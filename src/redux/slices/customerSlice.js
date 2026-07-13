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

// Async thunk for customer OTP login
export const loginCustomerWithOtp = createAsyncThunk(
  'customer/loginWithOtp',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/customer/login-with-otp', payload);
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
  async ({ cityName, areaName, category }, { rejectWithValue }) => {
    try {
      const params = {};
      if (cityName) params.cityName = cityName;
      if (areaName) params.areaName = areaName;
      if (category) params.category = category;

      const response = await axiosInstance.get('/salons/location-search', { params });
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

// Async thunk to fetch customer's default favourite salon
export const fetchDefaultSalon = createAsyncThunk(
  'customer/fetchDefaultSalon',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/customer/favourites/default');
      return response.data;
    } catch (error) {
      // 404 means no default salon set — not an error
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch default salon.');
    }
  }
);

// Async thunk to set a salon as the customer's default favourite
export const setDefaultSalon = createAsyncThunk(
  'customer/setDefaultSalon',
  async (salonId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/customer/favourites/${salonId}/default`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set default salon.');
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
  defaultSalon: null,
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
      state.defaultSalon = null;
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
      // Login with OTP
      .addCase(loginCustomerWithOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginCustomerWithOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginCustomerWithOtp.rejected, (state, action) => {
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
      // Fetch Default Salon
      .addCase(fetchDefaultSalon.fulfilled, (state, action) => {
        state.defaultSalon = action.payload;
      })
      .addCase(fetchDefaultSalon.rejected, (state) => {
        state.defaultSalon = null;
      })
      // Set Default Salon
      .addCase(setDefaultSalon.fulfilled, (state, action) => {
        state.defaultSalon = action.payload;
      })
      .addCase(setDefaultSalon.rejected, (state, action) => {
        state.error = action.payload;
      })
  },
});

export const { logoutCustomer, clearCustomerError } = customerSlice.actions;
export default customerSlice.reducer;
