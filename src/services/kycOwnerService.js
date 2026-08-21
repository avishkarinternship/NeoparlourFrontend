import axiosInstance from '../api/axiosInstance';

export const kycOwnerService = {
  // Fetch KYC documents for logged in owner
  // GET /api/kyc-documents/my-documents (with fallback to /auth/kyc-documents)
  getMyKycDocuments: async (salonId) => {
    try {
      return await axiosInstance.get('/api/kyc-documents/my-documents');
    } catch (err) {
      // Fallback
      return await axiosInstance.get('/auth/kyc-documents', {
        params: salonId ? { salonId: Number(salonId) } : {}
      });
    }
  },

  // Resubmit KYC document
  // POST /api/kyc-documents/resubmit (with fallback to /api/kyc/resubmit & /auth/kyc-documents/resubmit)
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
      return await axiosInstance.post('/api/kyc-documents/resubmit', formData, config);
    } catch (err) {
      try {
        return await axiosInstance.post('/api/kyc/resubmit', formData, config);
      } catch (err2) {
        return await axiosInstance.post('/auth/kyc-documents/resubmit', formData, config);
      }
    }
  }
};

export default kycOwnerService;
