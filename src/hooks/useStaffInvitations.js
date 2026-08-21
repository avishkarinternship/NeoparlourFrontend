import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { staffInvitationService } from '../services/staffInvitationService';

export const useStaffInvitations = (initialSalonId = '', initialStaffId = '') => {
  // Read salonId from Redux state (ownerStaff slice or customer slice)
  const reduxSalonId = useSelector((state) => 
    state.ownerStaff?.user?.salonId || 
    state.ownerStaff?.user?.tenantId || 
    state.ownerStaff?.user?.activeSalonId || 
    state.customer?.user?.salonId || ''
  );

  const effectiveSalonId = initialSalonId || reduxSalonId || localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id') || '';

  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 10 });
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
      
      // Backend response format:
      // { content: [...], page: { size, number, totalElements, totalPages } }
      const contentList = Array.isArray(res.data?.content) ? res.data.content : (Array.isArray(res.data) ? res.data : []);
      const pageInfo = res.data?.page || {};

      setData({
        content: contentList,
        totalPages: pageInfo.totalPages ?? (contentList.length > 0 ? 1 : 0),
        totalElements: pageInfo.totalElements ?? contentList.length,
        page: pageInfo.number ?? filters.page,
        size: pageInfo.size ?? filters.size
      });
    } catch (error) {
      console.error('Failed to load staff invitations from backend:', error.message);
      setData({ content: [], totalPages: 0, totalElements: 0, page: 0, size: filters.size });
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
