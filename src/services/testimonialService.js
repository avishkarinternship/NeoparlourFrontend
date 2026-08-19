import axiosInstance from '../api/axiosInstance';

export const testimonialService = {
  // Public APIs
  getAllTestimonials: (params) => axiosInstance.get('/testimonials', { params }),
  getFeaturedTestimonials: () => axiosInstance.get('/testimonials/featured'),
  getTestimonialById: (id) => axiosInstance.get(`/testimonials/${id}`),

  // Admin APIs (Bearer token attached automatically by axiosInstance)
  createTestimonial: (data) => axiosInstance.post('/testimonials', data),
  updateTestimonial: (id, data) => axiosInstance.put(`/testimonials/${id}`, data),
  deleteTestimonial: (id) => axiosInstance.delete(`/testimonials/${id}`)
};

export default testimonialService;
