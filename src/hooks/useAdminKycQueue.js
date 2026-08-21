import { useState, useEffect, useCallback } from 'react';
import kycAdminService from '../services/kycAdminService';

export const useAdminKycQueue = (initialStatus = 'PENDING') => {
  const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0, number: 0 });
  const [filters, setFilters] = useState({ status: initialStatus, documentType: '', search: '', page: 0, size: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await kycAdminService.getKycQueue(filters);
      if (res.data) {
        if (Array.isArray(res.data)) {
          setData({ content: res.data, totalPages: 1, totalElements: res.data.length, number: 0 });
        } else {
          setData({
            content: res.data.content || [],
            totalPages: res.data.totalPages || res.data.page?.totalPages || 0,
            totalElements: res.data.totalElements || res.data.page?.totalElements || 0,
            number: res.data.number || res.data.page?.number || 0
          });
        }
      }
    } catch (err) {
      console.error('Failed to load admin KYC queue:', err);
      setError(err.response?.data?.message || 'Failed to load admin KYC queue');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const verifyDocument = async (documentId, status, rejectionReason) => {
    await kycAdminService.verifyDocument(documentId, status, rejectionReason);
    await fetchQueue(); // Refresh queue after decision
  };

  return { data, filters, setFilters, loading, error, verifyDocument, refresh: fetchQueue };
};

export default useAdminKycQueue;
