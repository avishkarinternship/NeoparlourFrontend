import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import staffPayoutService from '../services/staffPayoutService';

export const useMyStaffPayouts = (providedStaffId) => {
  const [payouts, setPayouts] = useState([]);
  const [walletBalance, setWalletBalance] = useState({ availablePoints: 0, totalEarnedPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveStaffId = useCallback(() => {
    if (providedStaffId) return providedStaffId;
    try {
      const userStr = localStorage.getItem('ownerStaffUser');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.staffId) return u.staffId;
        if (u.id) return u.id;
      }
    } catch (e) {}
    return localStorage.getItem('staff_id') || localStorage.getItem('staff_user_id') || localStorage.getItem('user_id') || null;
  }, [providedStaffId]);

  const fetchMyPayouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const staffId = resolveStaffId();

      const [payoutsData, balanceData] = await Promise.all([
        staffPayoutService.getMyPayoutRequests(staffId).catch(err => {
          console.warn("Failed to load staff payout requests:", err);
          return [];
        }),
        staffPayoutService.getWalletBalance(staffId).catch(err => {
          console.warn("Failed to load staff wallet balance:", err);
          return { availablePoints: 0, totalEarnedPoints: 0 };
        })
      ]);

      const payoutList = Array.isArray(payoutsData)
        ? payoutsData
        : payoutsData?.content || payoutsData?.data || [];

      setPayouts(payoutList);

      if (balanceData && typeof balanceData.availablePoints === 'number') {
        setWalletBalance(balanceData);
      } else if (typeof balanceData === 'number') {
        setWalletBalance({ availablePoints: balanceData, totalEarnedPoints: balanceData });
      }
    } catch (err) {
      console.error("Error loading staff payouts:", err);
      setError(err.response?.data?.message || err.message || "Failed to load staff payouts.");
    } finally {
      setLoading(false);
    }
  }, [resolveStaffId]);

  useEffect(() => {
    fetchMyPayouts();
  }, [fetchMyPayouts]);

  const submitPayoutRequest = async (payload) => {
    try {
      const result = await staffPayoutService.submitPayoutRequest(payload);
      toast.success("Payout request submitted successfully! Awaiting admin approval.");
      await fetchMyPayouts(); // Refresh state after request
      return result;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to submit payout request.";
      toast.error(errMsg);
      throw err;
    }
  };

  return {
    payouts,
    walletBalance,
    loading,
    error,
    submitPayoutRequest,
    refresh: fetchMyPayouts
  };
};

export default useMyStaffPayouts;
