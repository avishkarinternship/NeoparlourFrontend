import axiosInstance from '../api/axiosInstance';

export const staffPayoutService = {
  // 1. Fetch My Payout Requests History
  // GET /staff-invitations/payout-requests/my (with staffId fallback)
  getMyPayoutRequests: async (staffId) => {
    try {
      const response = await axiosInstance.get('/staff-invitations/payout-requests/my', { skipGlobalToast: true });
      return response.data?.content || response.data || [];
    } catch (err) {
      if (staffId) {
        try {
          const res = await axiosInstance.get(`/staff-invitations/payout-requests?staffId=${staffId}`, { skipGlobalToast: true });
          return res.data?.content || res.data || [];
        } catch (e) {
          // ignore fallback error
        }
      }
      return [];
    }
  },

  // 2. Submit New Payout Request
  // POST /staff-invitations/payout-requests
  // payload: { pointsToRedeem, payoutMethod ('UPI'|'BANK_TRANSFER'), upiId, accountNumber, ifscCode, accountHolderName }
  submitPayoutRequest: async (payload) => {
    const response = await axiosInstance.post('/staff-invitations/payout-requests', payload);
    return response.data;
  },

  // 3. Fetch Staff Available Wallet Points Balance from real backend APIs
  getWalletBalance: async (staffId) => {
    const id = staffId || (() => {
      try {
        const userStr = localStorage.getItem('ownerStaffUser');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.staffId) return u.staffId;
          if (u.id) return u.id;
        }
      } catch (e) {}
      return localStorage.getItem('staff_id') || localStorage.getItem('staff_user_id') || localStorage.getItem('user_id') || null;
    })();

    if (!id) {
      return { availablePoints: 0, totalEarnedPoints: 0 };
    }

    // A. Priority 1: Official wallet balance endpoint (/staff-invitations/wallet-balance)
    try {
      const param = id ? `?staffId=${id}` : '';
      const response = await axiosInstance.get(`/staff-invitations/wallet-balance${param}`, { skipGlobalToast: true });
      const data = response.data?.content || response.data || {};
      const pts = Number(data.availablePoints ?? data.points ?? data.totalPointsEarned ?? 0);
      const total = Number(data.totalEarnedPoints ?? data.totalPointsEarned ?? pts);
      return {
        availablePoints: pts,
        totalEarnedPoints: total,
        stats: data
      };
    } catch (err0) {
      console.warn('staff wallet-balance endpoint fallback:', err0?.message);
    }

    // B. Priority 2: Staff referral stats endpoint (/staff-invitations/stats/{staffId})
    try {
      const response = await axiosInstance.get(`/staff-invitations/stats/${id}`, { skipGlobalToast: true });
      const data = response.data?.content || response.data || {};
      const pts = Number(data.totalPointsEarned ?? data.points ?? data.availablePoints ?? data.rewardPoints ?? 0);
      const total = Number(data.totalPointsEarned ?? pts);
      return {
        availablePoints: pts,
        totalEarnedPoints: total,
        stats: data
      };
    } catch (err) {
      console.warn('staff-invitations stats endpoint fallback:', err?.message);
    }

    // B. Priority 2: Staff profile endpoint (/staff/{staffId})
    try {
      const res = await axiosInstance.get(`/staff/${id}`, { skipGlobalToast: true });
      const staff = res.data?.content || res.data || {};
      const pts = Number(staff.rewardPoints ?? staff.points ?? 0);
      return {
        availablePoints: pts,
        totalEarnedPoints: pts,
        staff
      };
    } catch (err2) {
      console.warn('staff profile endpoint fallback:', err2?.message);
    }

    // C. Priority 3: Staff referral stats endpoint (/staff/{staffId}/referral-stats)
    try {
      const res3 = await axiosInstance.get(`/staff/${id}/referral-stats`, { skipGlobalToast: true });
      const stats = res3.data?.content || res3.data || {};
      const pts = Number(stats.totalPointsEarned ?? stats.points ?? 0);
      return {
        availablePoints: pts,
        totalEarnedPoints: pts,
        stats
      };
    } catch (err3) {
      console.warn('staff referral-stats endpoint fallback:', err3?.message);
    }

    return { availablePoints: 0, totalEarnedPoints: 0 };
  }
};

export default staffPayoutService;
