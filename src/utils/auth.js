import axios from 'axios';
import axiosInstance from '../api/axiosInstance';

/**
 * Cleanly logs out the user by clearing storage, Authorization headers,
 * background interval loops, and redirecting cleanly.
 * 
 * @param {string} redirectTarget - Optional login path to redirect to (default: '/customer/login')
 * @param {Object} queryClient - Optional React Query client instance to clear cache
 */
export const performCleanLogout = async (redirectTarget = '/customer/login', queryClient = null) => {
  // ================= STEP 1: STOP BACKGROUND POLLING & TIMERS =================
  // Clear all global interval and timeout timers to stop background API calls
  for (let i = 1; i < 99999; i++) {
    window.clearInterval(i);
    window.clearTimeout(i);
  }

  // ================= STEP 2: CALL BACKEND LOGOUT API (OPTIONAL) =================
  try {
    const customerToken = localStorage.getItem('customerToken');
    const ownerToken = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');
    const activeToken = customerToken || ownerToken || localStorage.getItem('token') || sessionStorage.getItem('token');

    if (activeToken) {
      await axiosInstance.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${activeToken}` },
        skipGlobalToast: true
      }).catch(() => {
        // Fallback attempt if customer-specific endpoint is used
        return axiosInstance.post('/customer/logout', {}, {
          headers: { Authorization: `Bearer ${activeToken}` },
          skipGlobalToast: true
        });
      });
    }
  } catch (error) {
    console.warn('[performCleanLogout] Logout API call failed or token expired:', error?.message);
  } finally {
    // ================= STEP 3: CLEAR STORAGE =================
    const keysToRemove = [
      'token', 'user', 'salonId', 'tenantId', 'activeSalonId', 'activeSalonName',
      'customerToken', 'customerUser', 'customerProfile',
      'ownerStaffToken', 'ownerStaffUser', 'user_token', 'userRole',
      'staff_id', 'staff_user_id', 'user_id', 'salon_id',
      'bookingSelectedSlot', 'bookingSelectedTime', 'bookingSelectedExpert', 'bookingSelectedDateObj'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    localStorage.clear();
    sessionStorage.clear();

    // ================= STEP 4: CLEAR AXIOS HEADERS =================
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['authorization'];
    if (axiosInstance.defaults.headers?.common) {
      delete axiosInstance.defaults.headers.common['Authorization'];
      delete axiosInstance.defaults.headers.common['authorization'];
    }

    // ================= STEP 5: CLEAR CACHES (React Query / SWR) =================
    if (queryClient && typeof queryClient.clear === 'function') {
      queryClient.clear();
    }

    // ================= STEP 6: REDIRECT TO LOGIN =================
    if (typeof window !== 'undefined') {
      window.location.href = redirectTarget;
    }
  }
};
