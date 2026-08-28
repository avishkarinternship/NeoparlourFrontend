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

// Request Interceptor to attach tokens dynamically
axiosInstance.interceptors.request.use(
  (config) => {
    // If request has explicitly opted out of attaching stale tokens
    if (config.skipTokenAttach) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
      return config;
    }

    const customerToken = localStorage.getItem('customerToken');
    let ownerToken = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');
    const genericToken = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Robust fallback: if owner token isn't in localStorage yet, extract it from URL params
    if (!ownerToken && typeof window !== 'undefined' && window.location?.search) {
      const queryParams = new URLSearchParams(window.location.search);
      const urlToken = queryParams.get('token');
      if (urlToken) {
        ownerToken = urlToken;
      }
    }

    // Prioritization: For staff/owner/subscription endpoints, use ownerToken first.
    const isOwnerOrStaffRequest = config.url && (
      config.url.includes('/subscriptions') ||
      config.url.includes('/staff') ||
      config.url.includes('/appointments/salon') ||
      config.url.includes('/staff-attendance') ||
      config.url.includes('/staff-inventory') ||
      config.url.includes('/kyc')
    );
    const token = isOwnerOrStaffRequest
      ? (ownerToken || customerToken || genericToken) 
      : (customerToken || ownerToken || genericToken);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Explicitly delete headers if token no longer exists in storage
      delete config.headers.Authorization;
      delete config.headers.authorization;
    }

    // Attach salonId / tenant headers if available in localStorage
    const activeSalonId = localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
    if (activeSalonId) {
      config.headers['X-Salon-Id'] = activeSalonId;
      config.headers['salonId'] = activeSalonId;
      config.headers['X-Tenant-ID'] = activeSalonId;
    } else {
      delete config.headers['X-Salon-Id'];
      delete config.headers['salonId'];
      delete config.headers['X-Tenant-ID'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Global Error Handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Intercept explicit maintenance status checks
    if (response.config?.url?.includes('/maintenance')) {
      if (response.data?.enabled === true || response.data?.maintenance === true) {
        window.dispatchEvent(
          new CustomEvent('SYSTEM_MAINTENANCE_ACTIVE', { detail: { ...response.data, enabled: true } })
        );
      } else if (response.data?.enabled === false || response.data?.maintenance === false) {
        window.dispatchEvent(
          new CustomEvent('SYSTEM_MAINTENANCE_CLEARED')
        );
      }
    }
    return response;
  },
  async (error) => {
    // Intercept 503 Service Unavailable or maintenance flag in error response
    if (error.response?.status === 503 || error.response?.data?.maintenance === true || error.response?.data?.enabled === true) {
      const maintenanceData = {
        enabled: true,
        is503: true,
        message: error.response?.data?.message && !error.response.data.message.toLowerCase().includes('operational')
          ? error.response.data.message
          : "We're currently performing scheduled backend updates. We will be back shortly!",
        ...(error.response?.data || {})
      };
      window.dispatchEvent(
        new CustomEvent('SYSTEM_MAINTENANCE_ACTIVE', { detail: maintenanceData })
      );
    }

    // Handle 401 Unauthorized globally for stale or expired tokens
    if (error.response?.status === 401) {
      const isLoginOrPublic = error.config?.url?.includes('/login') || 
                              error.config?.url?.includes('/send-otp') || 
                              error.config?.url?.includes('/register');

      if (!isLoginOrPublic) {
        console.warn("[axiosInstance] 401 Unauthorized detected. Clearing stale session state.");
        localStorage.clear();
        sessionStorage.clear();
        delete axios.defaults.headers.common['Authorization'];
        delete axios.defaults.headers.common['authorization'];

        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const targetLogin = (currentPath.includes('/owner') || currentPath.includes('/staff') || currentPath.includes('/admin'))
          ? '/owner/login'
          : '/customer/login';

        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = targetLogin;
          return Promise.reject(error);
        }
      }
    }

    // Handle 403 Forbidden CUD subscription blocking
    if (error.response?.status === 403) {
      const isCUD = ['post', 'put', 'delete', 'patch'].includes(error.config?.method?.toLowerCase());
      
      let errorData = error.response?.data;
      if (errorData instanceof Blob) {
        try {
          const text = await errorData.text();
          errorData = JSON.parse(text);
        } catch (e) {
          // ignore parsing error
        }
      }
      
      const errorMessage = errorData?.message || error.message || '';
      const lowerMessage = errorMessage.toLowerCase();
      const isSubscriptionMessage = 
        lowerMessage.includes("buy the subscription") || 
        lowerMessage.includes("subscription has expired") || 
        lowerMessage.includes("explore the services");

      if (isCUD && isSubscriptionMessage) {
        showGlobalSubscriptionModal();
        return Promise.reject(error);
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

// Global Vanilla JS/Tailwind Modal for Subscription Redirect
function showGlobalSubscriptionModal() {
  if (document.getElementById('global-subscription-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'global-subscription-modal';
  modal.className = 'fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-opacity duration-300';
  modal.style.opacity = '0';

  const content = document.createElement('div');
  content.className = 'bg-white rounded-[28px] max-w-md w-full p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center transform scale-95 transition-all duration-300';
  
  content.innerHTML = `
    <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-3xl mb-5 animate-bounce">
      💳
    </div>
    <h3 class="text-xl font-black text-gray-900 tracking-tight mb-2 uppercase">Subscription Required</h3>
    <p class="text-sm text-gray-500 font-medium leading-relaxed mb-8">
      Please buy a subscription to explore and use these premium features.
    </p>
    <div class="flex flex-col sm:flex-row gap-3 w-full">
      <button id="sub-modal-close" class="flex-1 py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-2xl font-bold text-xs uppercase tracking-wider transition cursor-pointer">
        Cancel
      </button>
      <button id="sub-modal-subscribe" class="flex-1 py-3.5 bg-gradient-to-b from-[#FF0B01] to-[#D00600] hover:from-red-600 hover:to-red-700 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition shadow-md shadow-red-500/10 cursor-pointer">
        Subscribe Now
      </button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Trigger animations
  setTimeout(() => {
    modal.style.opacity = '1';
    content.style.transform = 'scale(1)';
  }, 10);

  const closeModal = () => {
    modal.style.opacity = '0';
    content.style.transform = 'scale(0.95)';
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 300);
  };

  document.getElementById('sub-modal-close').onclick = closeModal;
  document.getElementById('sub-modal-subscribe').onclick = () => {
    closeModal();
    window.location.href = '/buy-subscription';
  };
}

export default axiosInstance;
