import axiosInstance from '../api/axiosInstance';

export const kycOwnerService = {
  // Get My KYC Documents
  // GET /api/auth/kyc-documents/my-documents (relative path: /auth/kyc-documents/my-documents)
  getMyKycDocuments: async (salonId) => {
    try {
      return await axiosInstance.get('/auth/kyc-documents/my-documents');
    } catch (err) {
      try {
        return await axiosInstance.get('/api/kyc-documents/my-documents');
      } catch (err2) {
        return await axiosInstance.get('/auth/kyc-documents', {
          params: salonId ? { salonId: Number(salonId) } : {}
        });
      }
    }
  },

  // Resubmit KYC Document
  // POST /api/auth/kyc-documents/resubmit (relative path: /auth/kyc-documents/resubmit)
  resubmitDocument: async (file, documentType, onProgress) => {
    if (!file) throw new Error("Please select a file to upload");
    if (!documentType) throw new Error("Document type is required");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      }
    };

    try {
      return await axiosInstance.post('/auth/kyc-documents/resubmit', formData, config);
    } catch (err) {
      try {
        return await axiosInstance.post('/api/kyc-documents/resubmit', formData, config);
      } catch (err2) {
        return await axiosInstance.post('/api/kyc/resubmit', formData, config);
      }
    }
  },

  // Get File Download / Preview URL or blob
  // GET /api/auth/kyc-documents/{id}/file
  getFileUrl: (documentId) => {
    if (!documentId) return '';
    return `${axiosInstance.defaults.baseURL}/auth/kyc-documents/${documentId}/file`;
  }
};

export default kycOwnerService;
