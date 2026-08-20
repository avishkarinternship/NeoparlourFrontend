import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { staffInvitationService } from '../services/staffInvitationService';

const SAMPLE_REFERRAL_INVITATIONS = [
  {
    id: 501,
    customerName: "Rahul Sharma",
    customerPhone: "+919876543210",
    staffId: 1,
    staffName: "Elena Rostova",
    inviteCode: "STAFF-1-RHL",
    status: "BOOKED",
    rewardGiven: true,
    rewardAmount: 100,
    createdAt: "2026-08-19T10:30:00Z"
  },
  {
    id: 502,
    customerName: "Priya Patel",
    customerPhone: "+919876543211",
    staffId: 1,
    staffName: "Elena Rostova",
    inviteCode: "STAFF-1-PRY",
    status: "REGISTERED",
    rewardGiven: false,
    rewardAmount: 0,
    createdAt: "2026-08-18T14:15:00Z"
  },
  {
    id: 503,
    customerName: "Amit Kumar",
    customerPhone: "+919876543212",
    staffId: 2,
    staffName: "Avishkar Sharma",
    inviteCode: "STAFF-2-AMT",
    status: "INSTALLED",
    rewardGiven: false,
    rewardAmount: 0,
    createdAt: "2026-08-17T11:00:00Z"
  },
  {
    id: 504,
    customerName: "Sneha Reddy",
    customerPhone: "+919876543213",
    staffId: 2,
    staffName: "Avishkar Sharma",
    inviteCode: "STAFF-2-SNH",
    status: "CLICKED",
    rewardGiven: false,
    rewardAmount: 0,
    createdAt: "2026-08-16T15:45:00Z"
  },
  {
    id: 505,
    customerName: "Vikram Malhotra",
    customerPhone: "+919876543214",
    staffId: 1,
    staffName: "Elena Rostova",
    inviteCode: "STAFF-1-VKM",
    status: "SENT",
    rewardGiven: false,
    rewardAmount: 0,
    createdAt: "2026-08-15T09:20:00Z"
  }
];

export const useStaffInvitations = (initialSalonId = '', initialStaffId = '') => {
  // Read salonId from Redux state (ownerStaff slice or customer slice)
  const reduxSalonId = useSelector((state) => 
    state.ownerStaff?.user?.salonId || 
    state.ownerStaff?.user?.tenantId || 
    state.ownerStaff?.user?.activeSalonId || 
    state.customer?.user?.salonId || ''
  );

  const effectiveSalonId = initialSalonId || reduxSalonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id') || '';

  const [data, setData] = useState({ content: [], totalPages: 1, totalElements: 0 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    salonId: effectiveSalonId,
    staffId: initialStaffId,
    status: 'ALL',
    search: '',
    rewardGiven: '',
    startDate: '',
    endDate: '',
    page: 0,
    size: 10,
    sortBy: 'createdAt',
    sortDir: 'desc'
  });

  // Sync Redux salonId if filters.salonId is empty
  useEffect(() => {
    if (effectiveSalonId && (!filters.salonId || filters.salonId !== effectiveSalonId)) {
      setFilters(prev => ({ ...prev, salonId: effectiveSalonId }));
    }
  }, [effectiveSalonId]);

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffInvitationService.getPaginatedStaffInvitations(filters);
      const resData = res.data?.page || res.data || {};
      const contentList = resData.content || (Array.isArray(res.data) ? res.data : []);

      if (contentList && contentList.length > 0) {
        setData({
          content: contentList,
          totalPages: resData.totalPages || 1,
          totalElements: resData.totalElements || contentList.length
        });
      } else {
        // Fallback filter over sample data
        const filtered = SAMPLE_REFERRAL_INVITATIONS.filter(item => {
          const matchStaff = !filters.staffId || String(item.staffId) === String(filters.staffId);
          const matchStatus = filters.status === 'ALL' || !filters.status || item.status === filters.status;
          const matchReward = filters.rewardGiven === '' || String(item.rewardGiven) === String(filters.rewardGiven);
          const matchSearch = !filters.search ||
            item.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
            item.customerPhone.includes(filters.search) ||
            item.inviteCode.toLowerCase().includes(filters.search.toLowerCase());
          return matchStaff && matchStatus && matchReward && matchSearch;
        });

        const startIndex = filters.page * filters.size;
        const pagedList = filtered.slice(startIndex, startIndex + filters.size);

        setData({
          content: pagedList,
          totalPages: Math.ceil(filtered.length / filters.size) || 1,
          totalElements: filtered.length
        });
      }
    } catch (error) {
      console.warn('Failed to load staff invitations, using fallback:', error.message);
      const filtered = SAMPLE_REFERRAL_INVITATIONS.filter(item => {
        const matchStaff = !filters.staffId || String(item.staffId) === String(filters.staffId);
        const matchStatus = filters.status === 'ALL' || !filters.status || item.status === filters.status;
        const matchReward = filters.rewardGiven === '' || String(item.rewardGiven) === String(filters.rewardGiven);
        const matchSearch = !filters.search ||
          item.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.customerPhone.includes(filters.search) ||
          item.inviteCode.toLowerCase().includes(filters.search.toLowerCase());
        return matchStaff && matchStatus && matchReward && matchSearch;
      });

      const startIndex = filters.page * filters.size;
      const pagedList = filtered.slice(startIndex, startIndex + filters.size);

      setData({
        content: pagedList,
        totalPages: Math.ceil(filtered.length / filters.size) || 1,
        totalElements: filtered.length
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 0 }));
  };

  const setPage = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const setSize = (newSize) => {
    setFilters(prev => ({ ...prev, size: newSize, page: 0 }));
  };

  const resetFilters = () => {
    setFilters({
      salonId: effectiveSalonId,
      staffId: initialStaffId,
      status: 'ALL',
      search: '',
      rewardGiven: '',
      startDate: '',
      endDate: '',
      page: 0,
      size: 10,
      sortBy: 'createdAt',
      sortDir: 'desc'
    });
  };

  return { data, loading, filters, updateFilter, setPage, setSize, resetFilters, refresh: fetchInvitations };
};

export default useStaffInvitations;
