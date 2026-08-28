import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import adminPayoutService from '../services/adminPayoutService';

export const useAdminPayoutQueue = (initialStatus = 'PENDING') => {
  const [data, setData] = useState({ content: [], totalPages: 1, totalElements: 0, number: 0 });
  const [filters, setFilters] = useState({
    status: initialStatus,
    payoutMethod: '',
    staffName: '',
    upiId: '',
    accountNumber: '',
    utrNumber: '',
    search: '',
    startDate: '',
    endDate: '',
    page: 0,
    size: 10
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueue = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await adminPayoutService.getPayoutQueue(filters);
      
      if (res && Array.isArray(res.content)) {
        setData(res);
      } else if (Array.isArray(res)) {
        setData({ content: res, totalPages: 1, totalElements: res.length, number: 0 });
      } else {
        setData({ content: [], totalPages: 1, totalElements: 0, number: 0 });
      }
    } catch (err) {
      console.error("Failed to load admin payout queue:", err);
      setError(err.response?.data?.message || err.message || "Failed to load admin payout request queue.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchQueue();
    }, 300);
    return () => clearTimeout(handler);
  }, [fetchQueue]);

  const processPayout = async (requestId, status, utrNumber, rejectionReason) => {
    try {
      const payload = {
        status,
        utrNumber: status === 'COMPLETED' ? utrNumber : null,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null
      };

      const result = await adminPayoutService.processPayoutRequest(requestId, payload);
      
      if (status === 'COMPLETED') {
        toast.success(`Payout request #${requestId} APPROVED and marked COMPLETED! UTR: ${utrNumber}`);
      } else {
        toast.success(`Payout request #${requestId} REJECTED. Points refunded to staff wallet.`);
      }

      await fetchQueue(); // Refresh table after decision
      return result;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to process payout decision.";
      toast.error(errMsg);
      throw err;
    }
  };

  return {
    data,
    filters,
    setFilters,
    loading,
    error,
    processPayout,
    refresh: fetchQueue
  };
};

export default useAdminPayoutQueue;
