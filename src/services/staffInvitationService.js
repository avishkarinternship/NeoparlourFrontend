import axiosInstance from '../api/axiosInstance';

export const staffInvitationService = {
  // ==================== UNIFIED STAFF INVITATIONS APIS (/staff-invitations) ====================

  // 1. Fetch Paginated Invitations with Search & Filters
  // GET /staff-invitations
  // Note: status is OMITTED by default unless user explicitly selects a status filter (SENT, CLICKED, INSTALLED, REGISTERED, BOOKED)
  getPaginatedInvitations: (filterParams = {}) => {
    const params = new URLSearchParams();

    if (filterParams.salonId && !isNaN(filterParams.salonId)) {
      params.append('salonId', String(Number(filterParams.salonId)));
    }

    if (filterParams.staffId && !isNaN(filterParams.staffId)) {
      params.append('staffId', String(Number(filterParams.staffId)));
    }

    // ONLY append status if the user deliberately selected a status filter
    if (
      filterParams.status &&
      filterParams.status.trim() !== '' &&
      filterParams.status.toUpperCase() !== 'ALL'
    ) {
      params.append('status', filterParams.status.trim().toUpperCase());
    }

    if (filterParams.statuses && Array.isArray(filterParams.statuses) && filterParams.statuses.length > 0) {
      filterParams.statuses.forEach(s => params.append('statuses', s));
    }

    if (filterParams.customerPhone) params.append('customerPhone', filterParams.customerPhone);
    if (filterParams.customerName) params.append('customerName', filterParams.customerName);
    if (filterParams.search) params.append('search', filterParams.search);

    if (filterParams.rewardGiven !== undefined && filterParams.rewardGiven !== null && filterParams.rewardGiven !== '') {
      params.append('rewardGiven', filterParams.rewardGiven);
    }

    // Format ISO Date Time for Instant parsing
    if (filterParams.startDate) {
      const startIso = filterParams.startDate.includes('T')
        ? filterParams.startDate
        : `${filterParams.startDate}T00:00:00Z`;
      params.append('startDate', startIso);
    }

    if (filterParams.endDate) {
      const endIso = filterParams.endDate.includes('T')
        ? filterParams.endDate
        : `${filterParams.endDate}T23:59:59Z`;
      params.append('endDate', endIso);
    }

    params.append('page', filterParams.page || 0);
    params.append('size', filterParams.size || 10);
    params.append('sortBy', filterParams.sortBy || 'createdAt');
    params.append('sortDir', filterParams.sortDir || 'desc');

    return axiosInstance.get(`/staff-invitations?${params.toString()}`);
  },

  // Alias for backward compatibility
  getPaginatedStaffInvitations: function (filterParams) {
    return this.getPaginatedInvitations(filterParams);
  },

  // 2. Create / Send Invitation
  // POST /staff-invitations
  createInvitation: (invitePayload) =>
    axiosInstance.post('/staff-invitations', invitePayload),

  sendInvitation: function (invitePayload) {
    return this.createInvitation(invitePayload);
  },

  // 3. Fetch Staff Referral Dashboard Stats
  // GET /staff-invitations/stats/{staffId}
  getStaffStats: (staffId) => {
    if (!staffId || isNaN(staffId)) {
      return Promise.reject(new Error("Invalid staffId"));
    }
    return axiosInstance.get(`/staff-invitations/stats/${Number(staffId)}`);
  },

  // 4. Fetch Salon Staff Leaderboard
  // GET /staff-invitations/leaderboard/{salonId}
  getSalonLeaderboard: (salonId) => {
    if (!salonId || isNaN(salonId)) {
      return Promise.reject(new Error("Invalid salonId"));
    }
    return axiosInstance.get(`/staff-invitations/leaderboard/${Number(salonId)}`);
  },

  // 5. Public Invite Metadata Preview
  // GET /staff-invitations/details/{inviteCode}
  getPublicInviteDetails: (inviteCode) =>
    axiosInstance.get(`/staff-invitations/details/${encodeURIComponent(inviteCode)}`),

  // 6. Post-OTP Referral Claim
  // POST /staff-invitations/claim
  claimReferral: (claimPayload) =>
    axiosInstance.post('/staff-invitations/claim', claimPayload),

  // 7. Get Referral Points Config
  // GET /staff-invitations/config
  getReferralConfig: () =>
    axiosInstance.get('/staff-invitations/config'),

  // Backward compatibility helper methods
  getOwnerInvitations: function (salonId) {
    return this.getPaginatedInvitations({ salonId });
  },

  getPendingInvitationsForStaff: function (params = {}) {
    let filterParams = {};
    if (typeof params === 'string' || typeof params === 'number') {
      if (!isNaN(params)) {
        filterParams.staffId = Number(params);
      } else {
        filterParams.customerPhone = String(params);
      }
    } else if (params && typeof params === 'object') {
      if (params.staffId) filterParams.staffId = params.staffId;
      if (params.salonId) filterParams.salonId = params.salonId;
      if (params.mobile || params.phone) filterParams.customerPhone = params.mobile || params.phone;
    }
    return this.getPaginatedInvitations(filterParams);
  },

  resendInvitation: (invitationId) => {
    if (!invitationId || isNaN(invitationId)) {
      return Promise.reject(new Error("Invalid invitation ID"));
    }
    return axiosInstance.post(`/staff-invitations/${Number(invitationId)}/resend`, {});
  },

  revokeInvitation: (invitationId) => {
    if (!invitationId || isNaN(invitationId)) {
      return Promise.reject(new Error("Invalid invitation ID"));
    }
    return axiosInstance.delete(`/staff-invitations/${Number(invitationId)}`);
  },

  acceptInvitation: (invitationId) => {
    if (!invitationId || isNaN(invitationId)) {
      return Promise.reject(new Error("Invalid invitation ID"));
    }
    return axiosInstance.post(`/staff-invitations/${Number(invitationId)}/accept`, {});
  },

  rejectInvitation: (invitationId) => {
    if (!invitationId || isNaN(invitationId)) {
      return Promise.reject(new Error("Invalid invitation ID"));
    }
    return axiosInstance.post(`/staff-invitations/${Number(invitationId)}/reject`, {});
  }
};

export default staffInvitationService;
