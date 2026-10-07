import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';
import searchService from '../../services/searchService';

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
  async ({ cityName, areaName, category, latitude, longitude, radiusKm, page = 0, size = 10 }, { rejectWithValue }) => {
    try {
      // 1. Resolve effective coordinates
      let effectiveLat = (latitude !== undefined && latitude !== null && !isNaN(Number(latitude))) ? Number(latitude) : null;
      let effectiveLng = (longitude !== undefined && longitude !== null && !isNaN(Number(longitude))) ? Number(longitude) : null;

      // Fallback 1: check customerLocation or customerLatitude/Longitude in localStorage
      if (!effectiveLat || !effectiveLng) {
        try {
          const locStr = localStorage.getItem('customerLocation');
          if (locStr) {
            const parsed = JSON.parse(locStr);
            if (parsed.latitude && parsed.longitude) {
              effectiveLat = Number(parsed.latitude);
              effectiveLng = Number(parsed.longitude);
            }
          }
          if (!effectiveLat || !effectiveLng) {
            const savedLat = localStorage.getItem('customerLatitude');
            const savedLng = localStorage.getItem('customerLongitude');
            if (savedLat && savedLng && !isNaN(Number(savedLat)) && !isNaN(Number(savedLng))) {
              effectiveLat = Number(savedLat);
              effectiveLng = Number(savedLng);
            }
          }
        } catch {}
      }

      // Fallback 2: if areaName or cityName is provided and we still don't have coords, resolve coordinates of the area
      if ((!effectiveLat || !effectiveLng) && (areaName || cityName)) {
        try {
          const areaResults = await searchService.searchExternalLocations(areaName || cityName, 'area', cityName);
          if (areaResults && areaResults.length > 0 && areaResults[0].latitude && areaResults[0].longitude) {
            effectiveLat = Number(areaResults[0].latitude);
            effectiveLng = Number(areaResults[0].longitude);
          }
        } catch {}
      }

      const hasCityOrArea = Boolean(cityName?.trim() || areaName?.trim());

      const queryParams = {
        page: page ?? 0,
        size: size ?? 10
      };
      if (cityName) queryParams.cityName = cityName.trim();
      if (areaName) queryParams.areaName = areaName.trim();
      if (category) queryParams.category = category.trim();
      if (effectiveLat) queryParams.latitude = effectiveLat;
      if (effectiveLng) queryParams.longitude = effectiveLng;
      if (radiusKm != null) {
        queryParams.radiusKm = radiusKm;
      }

      let results = [];
      let totalPages = 1;
      let totalElements = 0;
      let pageNumber = page ?? 0;
      let pageSize = size ?? 10;

      // 1. If city or area name is provided, search by location without radius restriction
      if (hasCityOrArea) {
        try {
          const response = await axiosInstance.get('/salons/location-search', { params: queryParams });
          const rawData = response.data;
          results = Array.isArray(rawData) ? rawData : (rawData?.content || []);
          totalPages = rawData?.page?.totalPages ?? rawData?.totalPages ?? (results.length > 0 ? 1 : 0);
          totalElements = rawData?.page?.totalElements ?? rawData?.totalElements ?? results.length;
          pageNumber = rawData?.page?.number ?? rawData?.number ?? (page ?? 0);
          pageSize = rawData?.page?.size ?? rawData?.size ?? (size ?? 10);
        } catch (err) {
          console.error('/salons/location-search failed, trying fallback:', err);
          try {
            if (cityName) {
              const cityRes = await axiosInstance.get('/salons/by-city', {
                params: {
                  cityName: cityName.trim(),
                  latitude: effectiveLat || undefined,
                  longitude: effectiveLng || undefined,
                  page: page ?? 0,
                  size: size ?? 10
                }
              });
              const rawData = cityRes.data;
              results = Array.isArray(rawData) ? rawData : (rawData?.content || []);
              totalPages = rawData?.page?.totalPages ?? rawData?.totalPages ?? (results.length > 0 ? 1 : 0);
              totalElements = rawData?.page?.totalElements ?? rawData?.totalElements ?? results.length;
              pageNumber = rawData?.page?.number ?? rawData?.number ?? (page ?? 0);
              pageSize = rawData?.page?.size ?? rawData?.size ?? (size ?? 10);
            }
          } catch (fallbackErr) {
            console.error('Fallback by-city search also failed:', fallbackErr);
            results = [];
          }
        }
      } else if (effectiveLat && effectiveLng) {
        // 2. Pure GPS nearby search with radius around customer's current coordinates
        try {
          const nearbyParams = {
            latitude: effectiveLat,
            longitude: effectiveLng,
            radiusKm: radiusKm || 50,
            page: page ?? 0,
            size: size ?? 10
          };
          if (category) nearbyParams.category = category;

          const nearbyRes = await axiosInstance.get('/salons/nearby', { params: nearbyParams });
          const rawData = nearbyRes.data;
          results = Array.isArray(rawData) ? rawData : (rawData?.content || []);
          totalPages = rawData?.page?.totalPages ?? rawData?.totalPages ?? (results.length > 0 ? 1 : 0);
          totalElements = rawData?.page?.totalElements ?? rawData?.totalElements ?? results.length;
          pageNumber = rawData?.page?.number ?? rawData?.number ?? (page ?? 0);
          pageSize = rawData?.page?.size ?? rawData?.size ?? (size ?? 10);
        } catch (err) {
          console.error('/salons/nearby request failed:', err);
          results = [];
        }
      } else {
        // 3. Neither coordinates nor city/area provided: query default salons
        try {
          const response = await axiosInstance.get('/salons/location-search', { params: queryParams });
          const rawData = response.data;
          results = Array.isArray(rawData) ? rawData : (rawData?.content || []);
          totalPages = rawData?.page?.totalPages ?? rawData?.totalPages ?? (results.length > 0 ? 1 : 0);
          totalElements = rawData?.page?.totalElements ?? rawData?.totalElements ?? results.length;
          pageNumber = rawData?.page?.number ?? rawData?.number ?? (page ?? 0);
          pageSize = rawData?.page?.size ?? rawData?.size ?? (size ?? 10);
        } catch (err) {
          results = [];
        }
      }

      // 3. Client-side distance enrichment & proximity ranking (Always calculate if coordinates exist)
      if (Array.isArray(results) && effectiveLat && effectiveLng) {
        results = results.map(salon => {
          let dist = (salon.distanceKm !== null && salon.distanceKm !== undefined) ? salon.distanceKm : null;
          if (dist === null && salon.latitude && salon.longitude && Number(salon.latitude) !== 0 && Number(salon.longitude) !== 0) {
            const R = 6371;
            const dLat = (Number(salon.latitude) - Number(effectiveLat)) * Math.PI / 180;
            const dLon = (Number(salon.longitude) - Number(effectiveLng)) * Math.PI / 180;
            const a =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(Number(effectiveLat) * Math.PI / 180) * Math.cos(Number(salon.latitude) * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
            dist = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
          }
          return {
            ...salon,
            distanceKm: dist != null ? Math.round(dist * 10) / 10 : null,
            distanceFormatted: salon.distanceFormatted || (dist !== null ? (dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)} km`) : null)
          };
        });

        // Sort: Salons with coordinates ordered by nearest; salons without coordinates preserved at the end
        results.sort((a, b) => {
          if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
          if (a.distanceKm !== null) return -1;
          if (b.distanceKm !== null) return 1;
          return 0;
        });
      }

      return {
        content: results,
        totalPages,
        totalElements,
        page: pageNumber,
        size: pageSize
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Search failed.'
      );
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

// Async thunk to send delete customer OTP
export const sendDeleteCustomerOtp = createAsyncThunk(
  'customer/sendDeleteOtp',
  async (mobile, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/customer/delete/send-otp?mobile=${mobile}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP.');
    }
  }
);

// Async thunk to verify and delete customer
export const verifyDeleteCustomerOtp = createAsyncThunk(
  'customer/verifyDeleteOtp',
  async ({ mobile, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/customer/delete/verify-otp?mobile=${mobile}&otp=${otp}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP and delete account.');
    }
  }
);

const safeParseJson = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
};

const initialState = {
  user: safeParseJson('customerUser'),
  profile: safeParseJson('customerProfile'),
  token: localStorage.getItem('customerToken') || null,
  isAuthenticated: !!localStorage.getItem('customerToken'),
  loading: false,
  error: null,
  salonResults: [],
  salonPagination: {
    totalPages: 1,
    totalElements: 0,
    page: 0,
    size: 10
  },
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
        state.salonResults = Array.isArray(action.payload)
          ? action.payload
          : (action.payload?.content || []);
        state.salonPagination = {
          totalPages: action.payload?.totalPages ?? 1,
          totalElements: action.payload?.totalElements ?? state.salonResults.length,
          page: action.payload?.page ?? 0,
          size: action.payload?.size ?? 10
        };
      })

      .addCase(searchSalonsByLocation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.salonResults = [];
        state.salonPagination = {
          totalPages: 0,
          totalElements: 0,
          page: 0,
          size: 10
        };
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
