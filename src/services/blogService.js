import axiosInstance from '../api/axiosInstance';

export const blogService = {
  // Public APIs
  getAllBlogs: (params) => axiosInstance.get('/blogs', { params }),
  getBlogById: (id) => axiosInstance.get(`/blogs/${id}`),
  getBlogBySlug: (slug) => axiosInstance.get(`/blogs/slug/${slug}`),

  // Admin APIs (Bearer token attached automatically by axiosInstance)
  createBlog: (data) => axiosInstance.post('/blogs', data),
  updateBlog: (id, data) => axiosInstance.put(`/blogs/${id}`, data),
  deleteBlog: (id) => axiosInstance.delete(`/blogs/${id}`)
};

export default blogService;
