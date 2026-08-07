import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axiosInstance';

// Async thunk for owner/staff login
export const loginOwner = createAsyncThunk(
  'ownerStaff/loginOwner',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const data = response.data;
      if (data.token) {
        localStorage.setItem('ownerStaffToken', data.token);
        localStorage.setItem('user_token', data.token);
        localStorage.setItem('ownerStaffUser', JSON.stringify(data));

        if (data.staffId || data.id || data.userId) {
          const sId = String(data.staffId || data.id || data.userId);
          const uId = String(data.userId || data.id || data.staffId);
          localStorage.setItem('staff_id', sId);
          localStorage.setItem('staff_user_id', uId);
          localStorage.setItem('user_id', uId);
        }
        if (data.salonId || data.tenantName || data.tenantId) {
          const salonIdVal = String(data.salonId || data.tenantName || data.tenantId);
          localStorage.setItem('salon_id', salonIdVal);
          localStorage.setItem('activeSalonId', String(data.tenantName || data.salonId || data.tenantId));
        }
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Login failed.');
    }
  }
);

// Async thunk for owner/staff logout (Server-side)
export const logoutOwnerStaffServer = createAsyncThunk(
  'ownerStaff/logoutServer',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().ownerStaff;
      if (token) {
        await axiosInstance.post('/auth/logout', {});
      }
      localStorage.removeItem('ownerStaffToken');
      localStorage.removeItem('ownerStaffUser');
      return true;
    } catch (error) {
      localStorage.removeItem('ownerStaffToken');
      localStorage.removeItem('ownerStaffUser');
      return rejectWithValue(error.response?.data?.message || 'Server-side logout failed.');
    }
  }
);

// Async thunk to send registration OTP
export const sendRegisterOtp = createAsyncThunk(
  'ownerStaff/sendOtp',
  async ({ mobile, type }, { rejectWithValue }) => {
    try {
      let response;
      if (type === 'CUSTOMER') {
        response = await axiosInstance.post(`/customer/send-otp?mobile=${mobile}`);
      } else {
        response = await axiosInstance.post(`/auth/register/send-otp?mobile=${mobile}`);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || error.response?.data?.message || 'Failed to send OTP.');
    }
  }
);

// Async thunk to register with OTP
export const registerWithOtp = createAsyncThunk(
  'ownerStaff/registerWithOtp',
  async ({ userDTO, otp, type }, { rejectWithValue }) => {
    try {
      let response;
      if (type === 'CUSTOMER') {
        const customerDTO = {
          fullName: userDTO.name,
          mobile: userDTO.phone,
          email: userDTO.email,
          password: userDTO.password,
          cityName: userDTO.cityName || '',
          areaName: userDTO.areaName || '',
          address: `${userDTO.specificAddress || ''}, ${userDTO.areaName || ''}, ${userDTO.cityName || ''}`.trim().replace(/^,\s*/, '').replace(/,\s*$/, ''),
          tncAccepted: userDTO.tncAccepted || false,
          tncAcceptedAt: userDTO.tncAcceptedAt || null,
          tncVersion: userDTO.tncVersion || null,
        };
        response = await axiosInstance.post(`/customer/register-with-otp?otp=${otp}`, customerDTO);
      } else {
        const ownerDTO = {
          ...userDTO,
          tncAccepted: userDTO.tncAccepted || false,
          tncAcceptedAt: userDTO.tncAcceptedAt || null,
          tncVersion: userDTO.tncVersion || null,
        };
        response = await axiosInstance.post(`/auth/register-with-otp?otp=${otp}`, ownerDTO);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed.');
    }
  }
);

// Async thunk to send delete owner/staff user OTP
export const sendDeleteUserOtp = createAsyncThunk(
  'ownerStaff/sendDeleteUserOtp',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/auth/users/delete/send-otp?phone=${phone}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP.');
    }
  }
);

// Async thunk to verify and delete owner/staff user
export const verifyDeleteUserOtp = createAsyncThunk(
  'ownerStaff/verifyDeleteUserOtp',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/auth/users/delete/verify-otp?phone=${phone}&otp=${otp}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify OTP and delete account.');
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('ownerStaffUser')) || null,
  token: localStorage.getItem('ownerStaffToken') || null,
  isAuthenticated: !!localStorage.getItem('ownerStaffToken'),
  loading: false,
  otpSent: false,
  error: null,
  activeTab: 'CUSTOMER',
};

const ownerStaffSlice = createSlice({
  name: 'ownerStaff',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    resetRegistration: (state) => {
      state.otpSent = false;
      state.error = null;
    },
    logoutOwnerStaff: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('ownerStaffToken');
      localStorage.removeItem('ownerStaffUser');
      localStorage.removeItem('activeSalonId');
    },
    clearOwnerStaffError: (state) => {
      state.error = null;
    },
    updateOwnerSession: (state, action) => {
      const { token, salonId, salonName } = action.payload;
      state.token = token;
      state.isAuthenticated = true;
      if (state.user) {
        state.user.token = token;
        state.user.salonId = salonId;
        if (salonName) {
          state.user.salonName = salonName;
        }
      }
      localStorage.setItem('ownerStaffToken', token);
      localStorage.setItem('ownerStaffUser', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    builder
      // Owner Login
      .addCase(loginOwner.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginOwner.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.token = action.payload.token;
      })
      .addCase(loginOwner.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send OTP
      .addCase(sendRegisterOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendRegisterOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendRegisterOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register with OTP
      .addCase(registerWithOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerWithOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = false;
      })
      .addCase(registerWithOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Server Logout handling
      .addCase(logoutOwnerStaffServer.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(logoutOwnerStaffServer.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { setActiveTab, logoutOwnerStaff, clearOwnerStaffError, resetRegistration, updateOwnerSession } = ownerStaffSlice.actions;
export default ownerStaffSlice.reducer;
