import axiosInstance from '../api/axiosInstance';

export const kycAdminService = {
  // Admin Filter & Search KYC Queue
  // GET /api/auth/kyc-documents?status=PENDING (relative path: /auth/kyc-documents)
  getKycQueue: async ({ status = 'PENDING', documentType, search, ownerName, page = 0, size = 10 }) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (documentType) params.append('documentType', documentType);
    if (search || ownerName) params.append('ownerName', search || ownerName);
    params.append('page', page);
    params.append('size', size);

    try {
      return await axiosInstance.get(`/auth/kyc-documents?${params.toString()}`);
    } catch (err) {
      try {
        return await axiosInstance.get(`/api/kyc-documents?${params.toString()}`);
      } catch (err2) {
        return await axiosInstance.get(`/kyc-documents?${params.toString()}`);
      }
    }
  },

  // Admin Verify (Approve / Reject) KYC Document
  // PUT /api/auth/kyc-documents/{id}/verify (relative path: /auth/kyc-documents/{id}/verify)
  verifyDocument: async (documentId, status, rejectionReason) => {
    if (!documentId) throw new Error("Document ID is required");
    if (!status) throw new Error("Verification status is required");

    const params = new URLSearchParams();
    params.append('status', status);
    if (rejectionReason && rejectionReason.trim()) {
      params.append('rejectionReason', rejectionReason.trim());
    }

    try {
      return await axiosInstance.put(`/auth/kyc-documents/${documentId}/verify?${params.toString()}`);
    } catch (err) {
      return await axiosInstance.put(`/api/kyc-documents/${documentId}/verify?${params.toString()}`);
    }
  },

  // Admin File Preview / Download Endpoint
  // GET /api/auth/kyc-documents/{id}/file
  getDocumentFileUrl: (documentId) => {
    if (!documentId) return '';
    return `${axiosInstance.defaults.baseURL}/auth/kyc-documents/${documentId}/file`;
  },

  // Fetch document blob with Authorization Bearer header
  fetchDocumentFileBlob: async (documentId) => {
    if (!documentId) throw new Error("Document ID is required");
    return await axiosInstance.get(`/auth/kyc-documents/${documentId}/file`, {
      responseType: 'blob'
    });
  }
};

export default kycAdminService;
