import axiosInstance from '../api/axiosInstance';

export const kycAdminService = {
  // Fetch Admin KYC verification queue
  // GET /api/kyc-documents?status=...&documentType=...&ownerName=...&page=...&size=...
  getKycQueue: async ({ status = 'PENDING', documentType, search, page = 0, size = 10 }) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (documentType) params.append('documentType', documentType);
    if (search) params.append('ownerName', search);
    params.append('page', page);
    params.append('size', size);

    try {
      return await axiosInstance.get(`/api/kyc-documents?${params.toString()}`);
    } catch (err) {
      // Fallback endpoint
      return await axiosInstance.get(`/auth/kyc-documents?${params.toString()}`);
    }
  },

  // Verify / Approve / Reject KYC Document
  // PUT /api/kyc-documents/{id}/verify?status={status}&rejectionReason=...
  verifyDocument: async (documentId, status, rejectionReason) => {
    if (!documentId) throw new Error("Document ID is required");
    if (!status) throw new Error("Verification status is required");

    const params = new URLSearchParams();
    params.append('status', status);
    if (rejectionReason && rejectionReason.trim()) {
      params.append('rejectionReason', rejectionReason.trim());
    }

    try {
      return await axiosInstance.put(`/api/kyc-documents/${documentId}/verify?${params.toString()}`);
    } catch (err) {
      return await axiosInstance.put(`/auth/kyc-documents/${documentId}/verify?${params.toString()}`);
    }
  }
};

export default kycAdminService;
