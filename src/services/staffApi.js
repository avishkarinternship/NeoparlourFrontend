import axiosInstance from '../api/axiosInstance';

export const staffApi = {
  // 1. Attendance & Leave Application
  checkIn: (staffId) => axiosInstance.post(`/staff-attendance/check-in?staffId=${staffId}`),
  checkOut: (staffId) => axiosInstance.post(`/staff-attendance/check-out?staffId=${staffId}`),
  getTodayAttendance: (staffId) => axiosInstance.get(`/staff-attendance/today?staffId=${staffId}`),
  getAttendanceHistory: (staffId) => axiosInstance.get(`/staff-attendance/staff?staffId=${staffId}`),
  
  // Apply for Leave Request
  applyLeave: (staffId, startDate, endDate, reason) =>
    axiosInstance.post(`/staff-attendance/leave/apply?staffId=${staffId}&startDate=${startDate}&endDate=${endDate}&reason=${encodeURIComponent(reason)}`),
  getLeaveRequests: (staffId) => axiosInstance.get(`/staff-attendance/leave/search?staffId=${staffId}`),

  // 2. Staff Profile & Edit
  getStaffProfile: (staffId) => axiosInstance.get(`/staff/${staffId}`),
  updateStaffProfile: (staffUserId, profileData) => axiosInstance.put(`/staff/${staffUserId}`, profileData),

  // 3. User Auth Forgot Password (Staff/Owner Role)
  sendForgotPasswordOtp: (mobile) =>
    axiosInstance.post(`/auth/forgot-password/send-otp?mobile=${mobile}`),
  resetPasswordWithOtp: (mobile, otp, newPassword, fullName = '') =>
    axiosInstance.post(`/auth/forgot-password/reset?mobile=${mobile}&otp=${otp}&newPassword=${encodeURIComponent(newPassword)}&fullName=${encodeURIComponent(fullName)}`),

  // 4. Appointments & Date Filtering
  getAppointmentsByDate: (isoDateString) =>
    axiosInstance.get(`/appointments/salon/date?date=${encodeURIComponent(isoDateString)}`),
  startAppointment: (id) => axiosInstance.put(`/appointments/${id}/confirm`),
  cancelAppointment: (id, cancelReason) =>
    axiosInstance.put(`/appointments/${id}/cancel?cancelReason=${encodeURIComponent(cancelReason)}`),
  rescheduleAppointment: (id, rescheduleData) =>
    axiosInstance.put(`/appointments/${id}/reschedule`, rescheduleData),
  changeAppointmentStaff: (appointmentId, staffId, staffName) =>
    axiosInstance.put(`/appointments/${appointmentId}/change-staff`, { staffId, staffName }),

  // Extend Appointment (Can return 409 CONFLICT if overlapping)
  extendAppointment: (id, extraMinutes) =>
    axiosInstance.put(`/appointments/${id}/extend`, { serviceDuration: extraMinutes }),

  // Complete Appointment with Opened Products
  completeAppointment: (id, openedProductUsages) =>
    axiosInstance.put(`/appointments/${id}/complete`, { openedProductUsages }),

  // 5. Inventory & Opened Products
  getAssignedInventory: (staffId) => axiosInstance.get(`/staff-inventory/staff/${staffId}`),
  getActiveOpenedProducts: (staffId) => axiosInstance.get(`/staff-inventory/opened/${staffId}`),
  openProductQuantity: (staffInventoryId, openQuantity, notes) =>
    axiosInstance.post(`/staff-inventory/${staffInventoryId}/open?openQuantity=${openQuantity}&notes=${encodeURIComponent(notes || '')}`),

  // 6. Walk-In Booking & WhatsApp Referral Invite
  bookWalkIn: (bookingData) => axiosInstance.post('/appointments/walk-in', bookingData),
  sendWhatsAppInvite: (inviteData) => axiosInstance.post('/staff/invite', inviteData),
  checkPhoneExists: (mobile) => axiosInstance.get(`/customer/exists?mobile=${mobile}`),
  getStaffReferralStats: (staffId) => axiosInstance.get(`/staff/${staffId}/referral-stats`),
};

export default staffApi;
