import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductBillDetails({ onClose }) {
  const navigate = useNavigate();
  // Mock data representing the current context state
  const productData = {
    name: "Necessaire",
    description: "The Body Lotion - Firming Moisturizer With 5 Peptides And 2.5% Niacinamide",
    price: 450,
    serviceTotal: 450,
    taxAndCharges: 50,
    grandTotal: 550, // Note: Rendered as 550 in reference image frame
    customer: {
      name: "Prowin Wadkar",
      phone: "7057577012"
    }
  };

  return (
    <div className="mx-auto max-w-xl border border-neutral-200 bg-white p-6 sm:p-8 font-sans antialiased text-[#131313] relative rounded-xl shadow-md">
      
      {/* --- HEADER BLOCK --- */}
      <div className="flex items-center justify-between pb-5">
        <h1 className="font-poppins text-xl font-bold uppercase tracking-wide text-[#131313]">
          Bill Details
        </h1>
        <button 
          onClick={onClose}
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
            {productData.name}
          </h3>
          <p className="text-sm font-medium leading-relaxed text-[#8D8D8D]">
            {productData.description}
          </p>
        </div>

        <div className="text-lg font-semibold text-[#131313] pt-1">
          ₹ {productData.price}
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
          <span>₹ {productData.serviceTotal}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm font-semibold text-[#131313]">
          <span>Tax & Charges</span>
          <span>₹ {productData.taxAndCharges}</span>
        </div>

        <div className="flex items-center justify-between text-base font-bold text-[#131313] pt-1">
          <span className="text-lg">Grand Total</span>
          <span className="text-lg">₹ {productData.grandTotal}</span>
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
            {productData.customer.name} - {productData.customer.phone}
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
          onClick={() => navigate('/customer/appointment-success')}
          className="w-full py-4 bg-[#FF0B01] text-white font-bold tracking-wider text-sm rounded-lg hover:bg-red-700 transition uppercase">
          Book And Pay After Services
        </button>
      </div>

    </div>
  );
}