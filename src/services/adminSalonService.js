import axiosInstance from '../api/axiosInstance';

export const adminSalonService = {
  // Get Complete Salon Profile by ID
  getSalonById: (salonId) => {
    if (!salonId) return Promise.reject(new Error("Salon ID is required"));
    return axiosInstance.get(`/salons/${salonId}`);
  },

  // Ban Salon with Mandatory Reason Query Parameter
  banSalon: (salonId, reason) => {
    if (!salonId) return Promise.reject(new Error("Salon ID is required"));
    return axiosInstance.put(`/v1/maintenance/salon/${salonId}/ban`, null, {
      params: { reason }
    });
  },

  // Unban Salon
  unbanSalon: (salonId) => {
    if (!salonId) return Promise.reject(new Error("Salon ID is required"));
    return axiosInstance.put(`/v1/maintenance/salon/${salonId}/unban`);
  }
};

export default adminSalonService;
