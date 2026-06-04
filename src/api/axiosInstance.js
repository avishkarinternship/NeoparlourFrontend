import axios from 'axios';
import toast from 'react-hot-toast';

// Toggle this boolean to switch between environments:
// true  => Production API (https://sb.neoparlour.com/api)
// false => Localhost API (http://localhost:9090/api)
const USE_PRODUCTION = true;

const baseURL = USE_PRODUCTION
  ? 'https://sb.neoparlour.com/api'
  : 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL,
});

// Request Interceptor to attach tokens automatically
axiosInstance.interceptors.request.use(
  (config) => {
    // Check for customer token first, then owner token
    const customerToken = localStorage.getItem('customerToken');
    const ownerToken = localStorage.getItem('ownerStaffToken');

    const token = customerToken || ownerToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Global Error Handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Bypass global toast notifications for canceled/aborted requests
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    let errorData = error.response?.data;

    // Handle Blob error responses (e.g. when responseType is 'blob' but an error occurred)
    if (errorData instanceof Blob) {
      try {
        const text = await errorData.text();
        errorData = JSON.parse(text);
      } catch (e) {
        // Fallback if parsing fails
      }
    }

    // Force default rate limit message for status 429
    if (error.response?.status === 429) {
      const message = errorData?.message || "Rate limit exceeded. Please try again later.";
      errorData = { ...errorData, message };
    }

    // Handle the specific error format: { "message": "...", "status": 404, "timeStamp": ... }
    const errorMessage = errorData?.message || error.message || 'Something went wrong';

    // Bypass global toast for switch-tenant errors (so they can show popup instead)
    const isSwitchTenant = error.config?.url?.includes('/customer/switch-tenant');
    const isTokenNotPresent = errorMessage?.toLowerCase().includes('token not present') || errorMessage?.toLowerCase().includes('customer token not present');
    const is400Error = error.response?.status === 400;

    if (isSwitchTenant && (is400Error || isTokenNotPresent)) {
      return Promise.reject(error);
    }

    const toastOptions = {
      duration: 5000, // Increased duration
      style: {
        background: '#1a1a1a',
        color: '#fff',
        borderRadius: '16px', // Slightly more rounded
        padding: '20px 24px', // Increased padding for larger size
        fontSize: '15px', // Slightly larger font
        fontWeight: '600',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        minWidth: '350px', // Ensure it has a good width
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
      iconTheme: {
        primary: '#ff0b01',
        secondary: '#fff',
      },
    };

    // Deduplicate rate limit toasts to prevent stacking multiple alerts
    if (error.response?.status === 429) {
      toastOptions.id = 'rate-limit-exceeded';
    }

    // Show toast notification
    toast.error(errorMessage, toastOptions);

    return Promise.reject(error);
  }
);

export default axiosInstance;
