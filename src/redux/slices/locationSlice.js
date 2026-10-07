import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Load saved state from localStorage
const getInitialActiveLocation = () => {
  const currentCity = localStorage.getItem('customerCurrentCity') || '';
  const currentArea = localStorage.getItem('customerCurrentArea') || '';
  const legacyCity = localStorage.getItem('customerCity') || '';
  const legacyArea = localStorage.getItem('customerArea') || '';
  const legacyLat = localStorage.getItem('customerCurrentLatitude') || localStorage.getItem('customerLatitude');
  const legacyLng = localStorage.getItem('customerCurrentLongitude') || localStorage.getItem('customerLongitude');
  const numLat = legacyLat ? Number(legacyLat) : null;
  const numLng = legacyLng ? Number(legacyLng) : null;

  try {
    const saved = localStorage.getItem('customerLocation');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object') {
        const city = parsed.cityName || parsed.city || currentCity || legacyCity;
        const area = parsed.areaName ?? parsed.area ?? currentArea ?? legacyArea;
        return {
          id: parsed.id || null,
          addressType: parsed.addressType || 'CURRENT',
          label: parsed.label || area || city || 'Select Location',
          areaName: area,
          cityName: city,
          city: city,
          area: area,
          stateName: parsed.stateName || '',
          pincode: parsed.postalCode || parsed.pincode || '',
          landmark: parsed.landmark || '',
          houseFlatNo: parsed.houseFlatNo || '',
          buildingName: parsed.buildingName || '',
          latitude: parsed.latitude ?? numLat,
          longitude: parsed.longitude ?? numLng,
          formattedAddress: parsed.formattedAddress || (area ? `${area}, ${city}` : city)
        };
      }
    }
  } catch {
    // ignore
  }

  const city = currentCity || legacyCity;
  const area = currentArea || legacyArea;

  return {
    id: null,
    addressType: 'CURRENT',
    label: area || city || 'Select Location',
    areaName: area,
    cityName: city,
    city: city,
    area: area,
    stateName: '',
    pincode: '',
    landmark: '',
    houseFlatNo: '',
    buildingName: '',
    latitude: numLat,
    longitude: numLng,
    formattedAddress: area ? `${area}, ${city}` : city
  };
};

const getInitialSavedAddresses = () => {
  try {
    const saved = localStorage.getItem('savedCustomerAddresses');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
};

// Async thunk to fetch customer saved addresses from backend (if endpoint available)
export const fetchCustomerAddresses = createAsyncThunk(
  'location/fetchCustomerAddresses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/customer/addresses');
      return response.data;
    } catch (err) {
      // 404 or backend not having endpoint yet is expected during transitional phase
      return rejectWithValue(err.response?.data?.message || 'Addresses not available');
    }
  }
);

// Async thunk to save a new address to backend
export const saveCustomerAddress = createAsyncThunk(
  'location/saveCustomerAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/customer/addresses', addressData);
      return response.data;
    } catch (err) {
      // Fallback: return addressData directly with a client-generated ID
      return { ...addressData, id: addressData.id || Date.now() };
    }
  }
);

// Async thunk to delete an address from backend
export const deleteCustomerAddress = createAsyncThunk(
  'location/deleteCustomerAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/customer/addresses/${addressId}`);
      return addressId;
    } catch (err) {
      return addressId; // fallback for local deletion
    }
  }
);

// Async thunk to set an address as default on backend
export const setDefaultCustomerAddress = createAsyncThunk(
  'location/setDefaultCustomerAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/customer/addresses/${addressId}/default`);
      return response.data;
    } catch (err) {
      return { id: addressId };
    }
  }
);

const initialState = {
  activeLocation: getInitialActiveLocation(),
  savedAddresses: getInitialSavedAddresses(),
  isPickerOpen: false,
  isDrawerOpen: false,
  loading: false,
  error: null
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setActiveLocation: (state, action) => {
      const loc = action.payload;
      state.activeLocation = loc;

      // Keep localStorage in sync (both new and legacy keys for 100% backward compatibility)
      try {
        localStorage.setItem('customerLocation', JSON.stringify(loc));
        const cCity = loc.cityName || loc.city || '';
        const cArea = loc.areaName ?? loc.area ?? '';
        if (cCity) {
          localStorage.setItem('customerCity', cCity);
          localStorage.setItem('customerCurrentCity', cCity);
        }
        localStorage.setItem('customerArea', cArea);
        localStorage.setItem('customerCurrentArea', cArea);
        if (loc.latitude != null) {
          localStorage.setItem('customerLatitude', String(loc.latitude));
          localStorage.setItem('customerCurrentLatitude', String(loc.latitude));
        }
        if (loc.longitude != null) {
          localStorage.setItem('customerLongitude', String(loc.longitude));
          localStorage.setItem('customerCurrentLongitude', String(loc.longitude));
        }
      } catch (err) {
        console.error("Storage error:", err);
      }
    },
    openLocationPicker: (state) => {
      state.isPickerOpen = true;
    },
    closeLocationPicker: (state) => {
      state.isPickerOpen = false;
    },
    openAddressDrawer: (state) => {
      state.isDrawerOpen = true;
    },
    closeAddressDrawer: (state) => {
      state.isDrawerOpen = false;
    },
    addSavedAddressLocal: (state, action) => {
      const newAddr = { ...action.payload, id: action.payload.id || Date.now() };
      state.savedAddresses.unshift(newAddr);
      try {
        localStorage.setItem('savedCustomerAddresses', JSON.stringify(state.savedAddresses));
      } catch (err) {
        console.error("Storage error:", err);
      }
    },
    deleteSavedAddressLocal: (state, action) => {
      const idToDelete = action.payload;
      state.savedAddresses = state.savedAddresses.filter(a => a.id !== idToDelete);
      try {
        localStorage.setItem('savedCustomerAddresses', JSON.stringify(state.savedAddresses));
      } catch (err) {
        console.error("Storage error:", err);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerAddresses.fulfilled, (state, action) => {
        if (Array.isArray(action.payload) && action.payload.length > 0) {
          state.savedAddresses = action.payload;
          localStorage.setItem('savedCustomerAddresses', JSON.stringify(action.payload));
        }
      })
      .addCase(saveCustomerAddress.fulfilled, (state, action) => {
        if (action.payload) {
          // Check if already in list to update, else unshift
          const idx = state.savedAddresses.findIndex(a => a.id === action.payload.id);
          if (idx >= 0) {
            state.savedAddresses[idx] = action.payload;
          } else {
            state.savedAddresses.unshift(action.payload);
          }
          localStorage.setItem('savedCustomerAddresses', JSON.stringify(state.savedAddresses));
        }
      })
      .addCase(deleteCustomerAddress.fulfilled, (state, action) => {
        const idToDelete = action.payload;
        state.savedAddresses = state.savedAddresses.filter(a => a.id !== idToDelete);
        localStorage.setItem('savedCustomerAddresses', JSON.stringify(state.savedAddresses));
      })
      .addCase(setDefaultCustomerAddress.fulfilled, (state, action) => {
        const defaultId = action.payload?.id;
        if (defaultId) {
          state.savedAddresses = state.savedAddresses.map(a => ({
            ...a,
            isDefault: a.id === defaultId
          }));
          localStorage.setItem('savedCustomerAddresses', JSON.stringify(state.savedAddresses));
        }
      });
  }
});

export const {
  setActiveLocation,
  openLocationPicker,
  closeLocationPicker,
  openAddressDrawer,
  closeAddressDrawer,
  addSavedAddressLocal,
  deleteSavedAddressLocal
} = locationSlice.actions;

export default locationSlice.reducer;
