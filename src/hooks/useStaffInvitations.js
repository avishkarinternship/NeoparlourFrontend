import { useState, useEffect, useCallback, useRef } from 'react';
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
  const normalizedInitialStaffId = initialStaffId === 'ALL' || !initialStaffId ? '' : String(initialStaffId);

  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0, page: 0, size: 10 });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    salonId: effectiveSalonId,
    staffId: normalizedInitialStaffId,
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

  const lastParamsRef = useRef('');
  const lastFetchedAtRef = useRef(0);
  const inFlightRef = useRef(false);

  // Sync Redux/storage salonId only if changed
  useEffect(() => {
    if (effectiveSalonId) {
      setFilters(prev => {
        if (String(prev.salonId || '') === String(effectiveSalonId || '')) return prev;
        return { ...prev, salonId: effectiveSalonId };
      });
    }
  }, [effectiveSalonId]);

  // Sync initialStaffId only if changed
  useEffect(() => {
    const target = initialStaffId === 'ALL' || !initialStaffId ? '' : String(initialStaffId);
    setFilters(prev => {
      if (String(prev.staffId || '') === String(target || '')) return prev;
      return { ...prev, staffId: target, page: 0 };
    });
  }, [initialStaffId]);

  const fetchInvitations = useCallback(async (force = false) => {
    const currentParams = JSON.stringify(filters);
    const now = Date.now();

    // Prevent duplicate calls: if same query is in-flight OR was fetched in the last 1500ms
    if (!force) {
      if (inFlightRef.current && lastParamsRef.current === currentParams) {
        return;
      }
      if (lastParamsRef.current === currentParams && now - lastFetchedAtRef.current < 1500) {
        return;
      }
    }
    inFlightRef.current = true;
    lastParamsRef.current = currentParams;
    lastFetchedAtRef.current = now;

    setLoading(true);
    try {
      const res = await staffInvitationService.getPaginatedStaffInvitations(filters);
      
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
      inFlightRef.current = false;
    }
  }, [filters]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      if (prev[key] === value && (key !== 'page' || prev.page === 0)) {
        return prev;
      }
      return { ...prev, [key]: value, page: 0 };
    });
  }, []);

  const setPage = useCallback((newPage) => {
    setFilters(prev => {
      if (prev.page === newPage) return prev;
      return { ...prev, page: newPage };
    });
  }, []);

  const setSize = useCallback((newSize) => {
    setFilters(prev => {
      if (prev.size === newSize) return prev;
      return { ...prev, size: newSize, page: 0 };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      salonId: effectiveSalonId,
      staffId: normalizedInitialStaffId,
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
  }, [effectiveSalonId, normalizedInitialStaffId]);

  return { data, loading, filters, updateFilter, setPage, setSize, resetFilters, refresh: () => fetchInvitations(true) };
};

export default useStaffInvitations;
