import { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';
import toast from 'react-hot-toast';

export const useSubscriptionRecovery = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    status: null, // 'SUCCESS' | 'FAILED'
    orderDetails: null,
  });

  const checkPendingPayment = useCallback(async (isAutoRetry = false) => {
    const pendingDataStr = localStorage.getItem('pending_subscription_payment');
    if (!pendingDataStr) return;

    try {
      const pendingData = JSON.parse(pendingDataStr);
      const { razorpayOrderId, razorpaySubscriptionId, planCode, timestamp } = pendingData;
      const orderId = razorpayOrderId || razorpaySubscriptionId;

      if (!orderId) {
        localStorage.removeItem('pending_subscription_payment');
        return;
      }

      if (isAutoRetry) {
        toast.loading('⚡ Internet restored. Resuming payment verification...', {
          id: 'reconnect-checking',
          duration: 3000,
        });
      }

      // 1. Try order status check endpoint first
      let orderStatusRes = null;
      try {
        orderStatusRes = await axiosInstance.get(`/subscriptions/order-status/${orderId}`);
      } catch (err) {
        console.warn('order-status route error, falling back to /subscriptions/my-status:', err?.message);
      }

      let activeSub = null;
      let isSuccess = false;
      let isFailed = false;

      if (orderStatusRes?.data) {
        const data = orderStatusRes.data;
        const statusStr = (data.status || data.orderStatus || '').toLowerCase();
        if (['active', 'paid', 'success', 'completed'].includes(statusStr)) {
          isSuccess = true;
          activeSub = data;
        } else if (['failed', 'expired', 'cancelled', 'refunded'].includes(statusStr)) {
          isFailed = true;
        }
      }

      // 2. Fallback to /subscriptions/my-status if orderStatus wasn't conclusive
      if (!isSuccess && !isFailed) {
        try {
          const myStatusRes = await axiosInstance.get('/subscriptions/my-status');
          const subData = myStatusRes.data;
          const statusStr = (subData?.status || subData?.subscriptionStatus || '').toLowerCase();

          if (['active', 'paid', 'completed'].includes(statusStr)) {
            isSuccess = true;
            activeSub = subData;
          } else if (['failed', 'expired'].includes(statusStr)) {
            isFailed = true;
          }
        } catch (myStatusErr) {
          console.error('Error fetching /subscriptions/my-status:', myStatusErr);
        }
      }

      // Function helper to close open Razorpay Checkout iframe modal
      const closeRazorpayModalIfOpen = () => {
        // Method 1: Official Razorpay SDK instance close
        if (window.activeRazorpayInstance && typeof window.activeRazorpayInstance.close === 'function') {
          try {
            window.activeRazorpayInstance.close();
            window.activeRazorpayInstance = null;
          } catch (e) {
            console.warn('Could not auto-close Razorpay instance via SDK:', e);
          }
        }

        // Method 2: DOM Cleanup Fallback — Force remove any open Razorpay iframe/modal elements from screen
        try {
          const razorpayElements = document.querySelectorAll('.razorpay-container, iframe.razorpay-checkout-frame, iframe[src*="razorpay"], #razorpay-checkout-frame');
          razorpayElements.forEach(el => el.remove());
          document.body.style.overflow = ''; // Restore page scrolling
        } catch (domErr) {
          console.warn('DOM cleanup for Razorpay modal failed:', domErr);
        }
      };

      // 3. Handle modal state, close Razorpay modal, and cleanup localStorage
      if (isSuccess) {
        closeRazorpayModalIfOpen();
        toast.dismiss('reconnect-checking');
        toast.success('🎉 Subscription active and verified!', { id: 'reconnect-success' });
        setModalState({
          isOpen: true,
          status: 'SUCCESS',
          orderDetails: { razorpayOrderId: orderId, planCode, activeSub },
        });
        localStorage.removeItem('pending_subscription_payment');
      } else if (isFailed) {
        closeRazorpayModalIfOpen();
        toast.dismiss('reconnect-checking');
        setModalState({
          isOpen: true,
          status: 'FAILED',
          orderDetails: { razorpayOrderId: orderId, planCode },
        });
        localStorage.removeItem('pending_subscription_payment');
      } else {
        // If order was placed over 24 hours ago and still pending, treat as failed & refund window
        const hoursPassed = timestamp ? (Date.now() - timestamp) / (1000 * 60 * 60) : 0;
        if (hoursPassed > 24) {
          closeRazorpayModalIfOpen();
          toast.dismiss('reconnect-checking');
          setModalState({
            isOpen: true,
            status: 'FAILED',
            orderDetails: { razorpayOrderId: orderId, planCode },
          });
          localStorage.removeItem('pending_subscription_payment');
        }
      }
    } catch (err) {
      console.error('Error checking pending subscription status:', err);
    }
  }, []);

  useEffect(() => {
    // Check on initial app mount
    checkPendingPayment();

    // Listen for internet reconnection
    const handleOnline = () => {
      console.log('⚡ Internet reconnected! Automatically resuming subscription verification process...');
      checkPendingPayment(true);
    };

    window.addEventListener('online', handleOnline);

    // Periodic check interval (every 10 seconds if a pending payment exists)
    const timer = setInterval(() => {
      if (navigator.onLine && localStorage.getItem('pending_subscription_payment')) {
        checkPendingPayment(false);
      }
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(timer);
    };
  }, [checkPendingPayment]);

  const closeModal = () => {
    setModalState({ isOpen: false, status: null, orderDetails: null });
  };

  return { modalState, closeModal, checkPendingPayment };
};
