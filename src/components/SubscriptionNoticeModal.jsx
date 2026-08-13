import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SubscriptionNoticeModal.css';

export const SubscriptionNoticeModal = ({ isOpen, status, orderDetails, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSuccessAction = () => {
    onClose();
    // Navigate to owner dashboard if on another page
    if (window.location.pathname !== '/owner/dashboard') {
      navigate('/owner/dashboard');
    }
  };

  return (
    <div className="sub-modal-overlay">
      <div className="sub-modal-card">
        {status === 'SUCCESS' ? (
          <div className="sub-status-container success">
            <div className="sub-icon-wrapper">🎉</div>
            <h2 className="sub-modal-title">Subscription Active & Confirmed!</h2>
            <p className="sub-modal-desc">
              Your payment for order <strong>{orderDetails?.razorpayOrderId}</strong> was processed and verified successfully.
            </p>
            <div className="sub-info-box">
              <p>
                <strong>Salon Status:</strong> Active 🟢
              </p>
              {orderDetails?.planCode && (
                <p>
                  <strong>Plan Code:</strong> {orderDetails.planCode.toUpperCase()}
                </p>
              )}
            </div>
            <button className="sub-btn-primary" onClick={handleSuccessAction}>
              Great! Continue to Dashboard
            </button>
          </div>
        ) : (
          <div className="sub-status-container failed">
            <div className="sub-icon-wrapper">⚠️</div>
            <h2 className="sub-modal-title">Payment Unsuccessful</h2>
            <p className="sub-modal-desc">
              We could not confirm the payment for order <strong>{orderDetails?.razorpayOrderId}</strong>.
            </p>
            <div className="sub-refund-notice-box">
              <h4>🔄 Refund Information:</h4>
              <p>
                If money was debited from your bank account or card,{' '}
                <strong>Razorpay will automatically refund it within 3 to 5 business days</strong> back to your original payment method.
              </p>
              <p className="sub-text">Razorpay Order Ref: {orderDetails?.razorpayOrderId}</p>
            </div>
            <button className="sub-btn-secondary" onClick={onClose}>
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionNoticeModal;
