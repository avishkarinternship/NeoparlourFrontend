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
  getPendingInvitationsForStaff: (mobile) => {
    const query = mobile ? `?mobile=${encodeURIComponent(mobile)}` : '';
    return axiosInstance.get(`/staff/invitations/pending${query}`);
  },

  // 2. Accept Invitation
  acceptInvitation: (invitationId) =>
    axiosInstance.post(`/staff/invitations/${invitationId}/accept`, {}),

  // 3. Reject / Decline Invitation
  rejectInvitation: (invitationId) =>
    axiosInstance.post(`/staff/invitations/${invitationId}/reject`, {})
};

export default staffInvitationService;
