import axiosInstance from '../api/axiosInstance';

export const customerService = {
  /**
   * Checks if a customer mobile number is already registered for Walk-In booking referral tracking.
   * Endpoint: GET /customer/check-phone?phone=9822073220
   * 
   * @param {string} phone - 10-digit customer mobile number
   * @returns {Promise<{ exists: boolean, fullName?: string, message?: string }>}
   */
  checkCustomerPhoneForWalkIn: async (phone) => {
    if (!phone) return { exists: false };
    const cleanedPhone = phone.trim();
    try {
      const response = await axiosInstance.get(`/customer/check-phone?phone=${encodeURIComponent(cleanedPhone)}`);
      return response.data;
    } catch (error) {
      // Fallback: If endpoint returns 404 or boolean directly
      if (error.response && error.response.status === 404) {
        return { exists: false, message: 'New customer (Eligible for 3 referral points)' };
      }
      console.warn('Customer phone verification API fallback:', error);
      return { exists: false, message: 'New customer (Eligible for 3 referral points)' };
    }
  }
};

export const checkCustomerPhoneForWalkIn = customerService.checkCustomerPhoneForWalkIn;

export default customerService;
