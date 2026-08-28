import axiosInstance from '../api/axiosInstance';

export const beautyProfileService = {
  // 1. Fetch Customer Beauty Profile (Hair & Skin details)
  // GET /customers/{customerId}/beauty-profile
  getCustomerBeautyProfile: async (customerId) => {
    if (!customerId) return null;
    const response = await axiosInstance.get(`/customers/${customerId}/beauty-profile`);
    return response.data;
  },

  // 2. Update Customer Beauty Profile
  // PUT /customers/{customerId}/beauty-profile
  updateBeautyProfile: async (customerId, payload) => {
    const response = await axiosInstance.put(`/customers/${customerId}/beauty-profile`, payload);
    return response.data;
  },

  // 3. Complete Appointment & Record Beauty Profile Payload
  // PUT /appointments/{appointmentId}/complete
  completeAppointmentWithProfile: async (appointmentId, beautyProfilePayload) => {
    const response = await axiosInstance.put(`/appointments/${appointmentId}/complete`, {
      beautyProfile: beautyProfilePayload
    });
    return response.data;
  }
};

export default beautyProfileService;
