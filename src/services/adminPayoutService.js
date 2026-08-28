import axiosInstance from '../api/axiosInstance';

export const adminPayoutService = {
  // 1. Fetch Paginated Admin Payout Request Queue with Specification Filters
  // GET /admin/payout-requests
  getPayoutQueue: async (filterParams = {}) => {
    const params = new URLSearchParams();

    if (filterParams.status && filterParams.status.trim() !== '' && filterParams.status.toUpperCase() !== 'ALL') {
      params.append('status', filterParams.status.trim().toUpperCase());
    }

    if (filterParams.payoutMethod && filterParams.payoutMethod.trim() !== '' && filterParams.payoutMethod.toUpperCase() !== 'ALL') {
      params.append('payoutMethod', filterParams.payoutMethod.trim().toUpperCase());
    }

    if (filterParams.staffName) params.append('staffName', filterParams.staffName.trim());
    if (filterParams.upiId) params.append('upiId', filterParams.upiId.trim());
    if (filterParams.accountNumber) params.append('accountNumber', filterParams.accountNumber.trim());
    if (filterParams.utrNumber) params.append('utrNumber', filterParams.utrNumber.trim());
    if (filterParams.search) params.append('search', filterParams.search.trim());

    if (filterParams.startDate) {
      const startIso = filterParams.startDate.includes('T') ? filterParams.startDate : `${filterParams.startDate}T00:00:00Z`;
      params.append('startDate', startIso);
    }

    if (filterParams.endDate) {
      const endIso = filterParams.endDate.includes('T') ? filterParams.endDate : `${filterParams.endDate}T23:59:59Z`;
      params.append('endDate', endIso);
    }

    params.append('page', filterParams.page || 0);
    params.append('size', filterParams.size || 10);
    params.append('sortBy', filterParams.sortBy || 'createdAt');
    params.append('sortDir', filterParams.sortDir || 'desc');

    const response = await axiosInstance.get(`/admin/payout-requests?${params.toString()}`);
    return response.data;
  },

  // 2. Process Payout Request (Approve Transfer or Reject Request)
  // PUT /admin/payout-requests/{id}/process
  // payload: { status: 'COMPLETED'|'REJECTED', utrNumber, rejectionReason }
  processPayoutRequest: async (requestId, payload) => {
    const response = await axiosInstance.put(`/admin/payout-requests/${requestId}/process`, payload);
    return response.data;
  }
};

export default adminPayoutService;
