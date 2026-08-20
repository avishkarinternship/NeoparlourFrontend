import axiosInstance from '../api/axiosInstance';

export const staffInvitationService = {
  // ==================== SALON OWNER APIS ====================

  // 1. Send Invitation to a Staff Member
  sendInvitation: (invitationData) =>
    axiosInstance.post('/staff/invite', invitationData),

  // 2. Fetch All Invitations Sent by Salon Owner
  getOwnerInvitations: (salonId) => {
    const query = salonId ? `?salonId=${salonId}` : '';
    return axiosInstance.get(`/staff/invitations/salon/${salonId || ''}`.replace(/\/$/, '') + query);
  },

  // 3. Resend Invitation SMS/WhatsApp
  resendInvitation: (invitationId) =>
    axiosInstance.post(`/staff/invitations/${invitationId}/resend`, {}),

  // 4. Revoke / Cancel Invitation
  revokeInvitation: (invitationId) =>
    axiosInstance.delete(`/staff/invitations/${invitationId}`),

  // ==================== STAFF MEMBER APIS ====================

  // 1. Fetch Pending Invitations for Logged-In Staff
  getPendingInvitationsForStaff: (params = {}) => {
    const searchParams = new URLSearchParams();
    searchParams.append('status', 'PENDING');
    if (typeof params === 'string' && params) {
      searchParams.append('customerPhone', params);
    } else if (params && typeof params === 'object') {
      if (params.staffId) searchParams.append('staffId', params.staffId);
      if (params.salonId) searchParams.append('salonId', params.salonId);
      if (params.mobile || params.phone) searchParams.append('customerPhone', params.mobile || params.phone);
    }
    return axiosInstance.get(`/staff/invitations?${searchParams.toString()}`);
  },

  // 2. Accept Invitation
  acceptInvitation: (invitationId) =>
    axiosInstance.post(`/staff/invitations/${invitationId}/accept`, {}),

  // 3. Reject / Decline Invitation
  rejectInvitation: (invitationId) =>
    axiosInstance.post(`/staff/invitations/${invitationId}/reject`, {}),

  // 4. Fetch Paginated Staff Referral Invitations with Search & Filters
  // Exact mapping for @GetMapping("/api/staff/invitations")
  getPaginatedStaffInvitations: (filterParams = {}) => {
    const params = new URLSearchParams();

    if (filterParams.salonId) params.append('salonId', filterParams.salonId);
    if (filterParams.staffId) params.append('staffId', filterParams.staffId);
    
    if (filterParams.status && filterParams.status !== 'ALL') {
      params.append('status', filterParams.status);
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

    return axiosInstance.get(`/staff/invitations?${params.toString()}`);
  }
};

export default staffInvitationService;
