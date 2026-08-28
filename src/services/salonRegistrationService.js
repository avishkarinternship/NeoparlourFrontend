import axiosInstance from '../api/axiosInstance';

export const salonRegistrationService = {
  // 1. Send Registration OTP to Mobile Number
  // POST /auth/send-register-otp?mobileNumber=...
  sendOtp: async (mobileNumber) => {
    const response = await axiosInstance.post(`/auth/send-register-otp?mobileNumber=${encodeURIComponent(mobileNumber)}`);
    return response.data;
  },

  // 2. Complete Salon Registration with OTP and Optimized Image Payloads
  // POST /auth/register-with-otp?otp=...
  // payload: { name, email, phone, password, salonName, cityName, areaName, specificAddress, imageBase64, salonImagesBase64, ... }
  registerWithOtp: async (otp, payload) => {
    const response = await axiosInstance.post(`/auth/register-with-otp?otp=${encodeURIComponent(otp)}`, payload);
    return response.data;
  }
};

export default salonRegistrationService;
