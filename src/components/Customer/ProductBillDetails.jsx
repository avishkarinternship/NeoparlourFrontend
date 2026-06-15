import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

export default function ProductBillDetails({ onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, quantity } = location.state || {};
  const [loading, setLoading] = useState(false);

  const customerProfile = (() => { try { return JSON.parse(localStorage.getItem('customerProfile')) || {}; } catch { return {}; } })();
  const customerUser = (() => { try { return JSON.parse(localStorage.getItem('customerUser')) || {}; } catch { return {}; } })();
  const customerId = customerProfile.id || customerUser.id || 1;
  const customerName = customerProfile.fullName || customerProfile.name || customerUser.fullName || customerUser.name || "Customer";
  const customerPhone = customerProfile.phone || customerProfile.mobile || customerUser.phone || customerUser.mobile || "";

  const priceVal = product?.price || 450;
  const quantityVal = quantity || 1;
  const serviceTotal = priceVal * quantityVal;
  const grandTotal = serviceTotal;

  const handleConfirmOrder = async () => {
    setLoading(true);
    try {
      const orderPayload = {
        customerId,
        customerName,
        customerMobile: customerPhone,
        salonId: product?.salonId || 1,
        totalAmount: grandTotal,
        status: "PENDING",
        items: [
          {
            productId: product?.id,
            productName: product?.name,
            quantity: quantityVal,
            price: priceVal
          }
        ]
      };

      await axiosInstance.post('/orders', orderPayload);
      toast.success('Order placed successfully!');
      navigate('/customer/appointment-success');
    } catch (err) {
      console.error('Failed to place order:', err);
      toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-xl border border-neutral-200 bg-white p-6 sm:p-8 font-sans antialiased text-[#131313] relative rounded-2xl shadow-lg">
        
        {/* --- HEADER BLOCK --- */}
        <div className="flex items-center justify-between pb-5">
          <h1 className="font-poppins text-xl font-bold uppercase tracking-wide text-[#131313]">
            Bill Details
          </h1>
          <button 
            onClick={onClose || (() => navigate(-1))}
            className="p-1 text-neutral-800 hover:bg-neutral-100 rounded-full transition"
            aria-label="Close panel"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="h-[1px] w-full bg-[#8D8D8D] opacity-40 mb-6" />

        {/* --- PRODUCT CONFIRMATION BLOCK --- */}
        <section className="space-y-4">
          <h2 className="font-poppins text-lg font-semibold text-[#131313]">
            Confirm Your Product
          </h2>

          <div className="space-y-1.5">
            <h3 className="font-poppins text-xl font-medium text-[#131313]">
              {product?.name || 'Necessaire'}
            </h3>
            <p className="text-sm font-medium leading-relaxed text-[#8D8D8D]">
              {product?.description || 'The Body Lotion - Firming Moisturizer With 5 Peptides And 2.5% Niacinamide'}
            </p>
          </div>

          <div className="text-lg font-semibold text-[#131313] pt-1">
            ₹ {priceVal}
          </div>

          {/* Dynamic Append Interaction Anchor */}
          <div className="pt-2 flex justify-center">
            <button className="flex items-center gap-2 text-sm font-bold text-[#FF0B01] hover:opacity-90 transition">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>Add More Product</span>
            </button>
          </div>
        </section>

        <div className="h-[1px] w-full bg-[#8D8D8D] opacity-40 my-6" />

        {/* --- FINANCIAL BREAKDOWN MATRIX --- */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold text-[#131313]">
            <span>Service Total</span>
            <span>₹ {serviceTotal}</span>
          </div>

          <div className="flex items-center justify-between text-base font-bold text-[#131313] pt-1">
            <span className="text-lg">Grand Total</span>
            <span className="text-lg">₹ {grandTotal}</span>
          </div>
        </section>

        <div className="h-[1px] w-full bg-[#8D8D8D] opacity-40 my-6" />

        {/* --- USER IDENTITY CONTEXT BLOCK --- */}
        <section className="space-y-3 pb-8">
          <h2 className="font-poppins text-base font-bold text-[#131313]">
            Personal Details
          </h2>
          
          <div className="flex items-start justify-between gap-4">
            <div className="text-sm font-semibold text-neutral-700">
              {customerName} - {customerPhone}
            </div>
            <button className="text-sm font-bold text-[#FF0B01] underline underline-offset-2 hover:opacity-90 transition shrink-0">
              Change
            </button>
          </div>
        </section>

        {/* --- ACTION DISPATCHER FOOTER --- */}
        <div className="space-y-4">
          <div className="text-xs font-medium text-neutral-300 select-none">
            Frame 165
          </div>
          
          <button 
            onClick={handleConfirmOrder}
            disabled={loading}
            className="w-full py-4 bg-[#FF0B01] text-white font-bold tracking-wider text-sm rounded-lg hover:bg-red-700 transition uppercase disabled:opacity-50">
            {loading ? 'Placing Order...' : 'Book And Pay After Services'}
          </button>
        </div>

      </div>
    </div>
  );
}