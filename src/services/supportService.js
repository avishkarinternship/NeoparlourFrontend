import axiosInstance from '../api/axiosInstance';

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  const BASE = 'https://sb.neoparlour.com';
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${BASE}${cleanPath}`;
};

export const supportService = {
  /**
   * Resolve relative image paths into full API image URLs
   */
  getImageUrl,

  /**
   * Helper: Convert File object to Base64 Data URI string
   */
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (typeof file === 'string') return resolve(file); // Already Base64 or URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  },

  /**
   * Submit Support Request via Base64 JSON (Strategy A - Recommended)
   * POST /api/public/support-requests
   */
  submitSupportRequestJSON: async (data) => {
    try {
      return await axiosInstance.post('/public/support-requests', data);
    } catch (err) {
      return await axiosInstance.post('/tickets/create', data);
    }
  },

  /**
   * Submit Support Request via Multipart Form Data (Strategy B)
   * POST /api/public/support-requests/multipart
   */
  submitSupportRequestMultipart: async (data) => {
    let formData;
    if (data instanceof FormData) {
      formData = data;
    } else {
      formData = new FormData();
      if (data.name) formData.append('name', data.name);
      if (data.email) formData.append('email', data.email);
      if (data.mobile) formData.append('mobile', data.mobile);
      if (data.description) formData.append('description', data.description);
      if (data.files && data.files.length > 0) {
        data.files.forEach((file) => formData.append('files', file));
      }
    }

    try {
      return await axiosInstance.post('/public/support-requests/multipart', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (err) {
      return await axiosInstance.post('/public/support-requests', data);
    }
  },

  // Public Customer Submission - POST /api/public/support-requests
  submitSupportRequest: async (data) => {
    try {
      return await axiosInstance.post('/public/support-requests', data);
    } catch (err) {
      return await axiosInstance.post('/tickets/create', data);
    }
  },

  // Admin/Engineer Fetch Requests List with Filters - GET /api/admin/support-requests
  getSupportRequests: async (params) => {
    try {
      return await axiosInstance.get('/admin/support-requests', { params });
    } catch (err) {
      return await axiosInstance.get('/tickets', { params });
    }
  },

  // Get Support Request By ID - GET /api/admin/support-requests/{id}
  getSupportRequestById: async (id) => {
    try {
      return await axiosInstance.get(`/admin/support-requests/${id}`);
    } catch (err) {
      return await axiosInstance.get(`/tickets/${id}`);
    }
  },

  // Claim Request (Self-Assign) - POST /api/admin/support-requests/{id}/claim
  claimRequest: async (id) => {
    try {
      return await axiosInstance.post(`/admin/support-requests/${id}/claim`);
    } catch (err) {
      return await axiosInstance.post(`/tickets/${id}/claim`);
    }
  },

  // Assign Request to Engineer - PUT /api/admin/support-requests/{id}/assign/{engineerId}
  assignRequest: async (id, engineerId) => {
    try {
      return await axiosInstance.put(`/admin/support-requests/${id}/assign/${engineerId}`);
    } catch (err) {
      return await axiosInstance.put(`/tickets/${id}/assign/${engineerId}`);
    }
  },

  // Update Status & Resolution Notes - PUT /api/tickets/{id}/status (Backend syncs support-requests automatically)
  updateStatus: async (id, status, resolutionNotes = '') => {
    const formattedStatus = String(status || 'OPEN').toUpperCase();
    const payload = {
      status: formattedStatus,
      resolutionNotes: resolutionNotes || ''
    };

    try {
      return await axiosInstance.put(
        `/tickets/${id}/status`, 
        payload, 
        { params: payload }
      );
    } catch (err) {
      try {
        return await axiosInstance.put(
          `/admin/support-requests/${id}/status`, 
          payload, 
          { params: payload }
        );
      } catch (err2) {
        return await axiosInstance.put(`/tickets/${id}/status`, payload);
      }
    }
  },

  // Escalate to Developer Ticket - POST /api/admin/support-requests/{id}/escalate-to-dev
  escalateToDev: async (id, escalationData, priority = 'HIGH', additionalImages = []) => {
    let payload = {};
    if (typeof escalationData === 'object' && escalationData !== null) {
      payload = {
        priority: String(escalationData.priority || 'HIGH').toUpperCase(),
        platform: escalationData.platform || 'BACKEND_API',
        escalationNotes: escalationData.escalationNotes || escalationData.escalationReason || '',
        escalationReason: escalationData.escalationNotes || escalationData.escalationReason || '',
        apiEndpoint: escalationData.apiEndpoint || null,
        httpStatus: escalationData.httpStatus ? Number(escalationData.httpStatus) : null,
        sourceFile: escalationData.sourceFile || null,
        errorTrace: escalationData.errorTrace || null,
        pageUrl: escalationData.pageUrl || null,
        deviceInfo: escalationData.deviceInfo || null,
        appVersion: escalationData.appVersion || null,
        additionalImages: escalationData.additionalImages || []
      };
    } else {
      const formattedPriority = String(priority || 'HIGH').toUpperCase();
      payload = {
        escalationReason: escalationData,
        escalationNotes: escalationData,
        priority: formattedPriority,
        platform: 'BACKEND_API',
        additionalImages
      };
    }

    try {
      return await axiosInstance.post(
        `/admin/support-requests/${id}/escalate-to-dev`, 
        payload,
        {
          params: {
            escalationReason: payload.escalationReason,
            priority: payload.priority,
            platform: payload.platform
          }
        }
      );
    } catch (err) {
      return await axiosInstance.post(`/tickets/${id}/escalate`, payload, {
        params: { reason: payload.escalationReason, priority: payload.priority }
      });
    }
  },

  // Fetch Tickets List - GET /api/tickets
  getTickets: async (params) => {
    return await axiosInstance.get('/tickets', { params });
  },

  // Get Single Ticket By ID - GET /api/tickets/{id}
  getTicketById: async (id) => {
    return await axiosInstance.get(`/tickets/${id}`);
  },

  // Update Ticket Status & Dev Resolution - PUT /api/tickets/{id}/status
  updateTicketStatus: async (id, statusPayload) => {
    let payload = {};
    if (typeof statusPayload === 'object' && statusPayload !== null) {
      payload = {
        ...statusPayload,
        status: String(statusPayload.status || 'OPEN').toUpperCase()
      };
    } else {
      payload = {
        status: String(statusPayload || 'OPEN').toUpperCase()
      };
    }
    return await axiosInstance.put(`/tickets/${id}/status`, payload, { params: payload });
  },

  // Get Engineers List - GET /api/tickets/support-engineers
  getSupportEngineers: async () => {
    try {
      return await axiosInstance.get('/tickets/support-engineers');
    } catch (err) {
      return await axiosInstance.get('/admin/support-engineers');
    }
  },

  // Fetch Engineer Metrics & SLA - GET /api/tickets/metrics/{engineerId}
  getEngineerMetrics: async (engineerId = 'all') => {
    try {
      return await axiosInstance.get(`/tickets/metrics/${engineerId}`);
    } catch (err) {
      return await axiosInstance.get(`/admin/tickets/metrics/${engineerId}`);
    }
  },

  // Add Comment / Note to Ticket - POST /api/tickets/{id}/comments
  addComment: (id, commentData) =>
    axiosInstance.post(`/tickets/${id}/comments`, commentData),

  // Get Ticket Comments - GET /api/tickets/{id}/comments
  getTicketComments: (id) =>
    axiosInstance.get(`/tickets/${id}/comments`),

  // Deprecated upfront upload (retained for backward compatibility if needed)
  uploadFiles: async (files) => {
    if (!files || files.length === 0) return [];
    return Array.from(files).map(file => URL.createObjectURL(file));
  }
};

export default supportService;
