import axiosInstance from '../api/axiosInstance';

export const kycService = {
  // Fetch KYC documents for a salon
  // GET /auth/kyc-documents?salonId={salonId}
  getKycDocuments: (salonId) => {
    if (!salonId) return Promise.reject(new Error("Salon ID is required"));
    return axiosInstance.get('/auth/kyc-documents', {
      params: { salonId: Number(salonId) }
    });
  },

  // Resubmit KYC Document
  // POST /api/kyc/resubmit (with fallback to /auth/kyc-documents/resubmit)
  resubmitKycDocument: async ({ file, documentType, salonId }, onUploadProgress) => {
    if (!file) throw new Error("Please select a file to upload");
    if (!documentType) throw new Error("Document type is required");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);
    if (salonId) {
      formData.append('salonId', Number(salonId));
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      }
    };

    try {
      return await axiosInstance.post('/kyc/resubmit', formData, config);
    } catch (err) {
      // Fallback to /auth/kyc-documents/resubmit
      return await axiosInstance.post('/auth/kyc-documents/resubmit', formData, config);
    }
  }
};

export default kycService;
