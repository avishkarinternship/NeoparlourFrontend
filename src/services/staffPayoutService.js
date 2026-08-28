import axiosInstance from '../api/axiosInstance';

export const staffPayoutService = {
  // 1. Fetch My Payout Requests History
  // GET /staff-invitations/payout-requests/my
  getMyPayoutRequests: async () => {
    const response = await axiosInstance.get('/staff-invitations/payout-requests/my');
    return response.data;
  },

  // 2. Submit New Payout Request
  // POST /staff-invitations/payout-requests
  // payload: { pointsToRedeem, payoutMethod ('UPI'|'BANK_TRANSFER'), upiId, accountNumber, ifscCode, accountHolderName }
  submitPayoutRequest: async (payload) => {
    const response = await axiosInstance.post('/staff-invitations/payout-requests', payload);
    return response.data;
  },

  // 3. Fetch Staff Available Wallet Points Balance
  // GET /staff-invitations/wallet-balance
  getWalletBalance: async () => {
    try {
      const response = await axiosInstance.get('/staff-invitations/wallet-balance');
      return response.data;
    } catch (err) {
      console.warn('Failed to fetch staff wallet balance endpoint, fallback to 0 balance:', err);
      return { availablePoints: 0, totalEarnedPoints: 0 };
    }
  }
};

export default staffPayoutService;
