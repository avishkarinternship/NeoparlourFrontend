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
    const customerToken = localStorage.getItem('customerToken');
    let ownerToken = localStorage.getItem('ownerStaffToken');

    // Robust fallback: if owner token isn't in localStorage yet (e.g. on first page load/mount race condition),
    // extract it directly from the URL search parameters.
    if (!ownerToken && typeof window !== 'undefined' && window.location?.search) {
      const queryParams = new URLSearchParams(window.location.search);
      const urlToken = queryParams.get('token');
      if (urlToken) {
        ownerToken = urlToken;
      }
    }

    // 2. Prioritization: For subscription endpoints, always use the owner token first.
    // Otherwise, check customer token first.
    const isSubscriptionRequest = config.url && config.url.includes('/subscriptions');
    const token = isSubscriptionRequest 
      ? (ownerToken || customerToken) 
      : (customerToken || ownerToken);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach salonId headers if available in localStorage
    const activeSalonId = localStorage.getItem('activeSalonId');
    if (activeSalonId) {
      config.headers['X-Salon-Id'] = activeSalonId;
      config.headers['salonId'] = activeSalonId;
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
    // Handle 401 Unauthorized globally for stale tokens
    if (error.response?.status === 401) {
      const hasAuthHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization;
      const isLoginRequest = error.config?.url?.includes('/customer/login');

      if (hasAuthHeader && !isLoginRequest) {
        console.warn("[axiosInstance] Received 401 with Authorization header. Clearing stale token and retrying request...");
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
        localStorage.removeItem('customerProfile');
        localStorage.removeItem('ownerStaffToken');
        localStorage.removeItem('ownerStaffUser');

        // Remove authorization header
        if (error.config.headers) {
          delete error.config.headers.Authorization;
          delete error.config.headers.authorization;
        }

        // Retry the request
        return axiosInstance(error.config);
      } else {
        console.error("[axiosInstance] Received 401 for request without stale token (or login request). URL:", error.config?.url);
      }
    }

    // Bypass global toast notifications if custom config skipGlobalToast is set
    if (error.config?.skipGlobalToast) {
      return Promise.reject(error);
    }

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
