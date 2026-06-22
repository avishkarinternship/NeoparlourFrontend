import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ProductPaymentMethod() {
  const navigate = useNavigate();
  const location = useLocation();
  const { product, quantity } = location.state || {};
  const subtotal = (product?.price || 450) * (quantity || 1);
  const total = subtotal;
  // State hooks for selection context simulation
  const [paymentType, setPaymentType] = useState('upi'); // 'upi' or 'card'
  const [selectedUpiApp, setSelectedUpiApp] = useState('gpay'); // 'gpay', 'phonepe', or 'paytm'

  // --- RELATED PRODUCTS DATA ---
  const relatedProducts = [
    {
      id: 1,
      brand: "Necessaire",
      name: "Necessaire",
      price: "₹ 470.00",
      volume: "100ml",
      rating: "4.6"
    },
    {
      id: 2,
      brand: "Ecocradle",
      name: "Ecocradle Complete Care Hair Serum",
      price: "₹ 500.00",
      volume: "50ml",
      rating: "4.6"
    },
    {
      id: 3,
      brand: "Hyphen",
      name: "Hyphen 18% Brightening + 20% Collagen Face Serum",
      price: "₹ 500.00",
      volume: "50ml",
      rating: "4.6"
    },
    {
      id: 4,
      brand: "Swiss Beauty",
      name: "wiss Beauty Cream It Up Blush",
      price: "₹ 225.00",
      volume: "50ml",
      rating: "4.6"
    },
    {
      id: 5,
      brand: "Fixer Spray",
      name: "Fixer Spray for Face makeup",
      price: "₹ 236.00",
      volume: "50ml",
      rating: "4.6"
    },
    {
      id: 6,
      brand: "Fixer Spray 2",
      name: "Fixer Spray for Face makeup",
      price: "₹ 236.00",
      volume: "50ml",
      rating: "4.6"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-[#131313]">

      {/* --- MASTER CHECKOUT MATRIX SECTION --- */}
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-8 lg:px-16">
        {/* Context Identification Headline */}
        <h1 className="font-poppins text-2xl font-semibold uppercase tracking-wide text-[#131313] mb-8">
          Payment Method
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT INTERACTION MATRIX COLUMN: PAYMENT SELECTION */}
          <div className="rounded-xl border border-black bg-white p-6 sm:p-8 lg:col-span-7 space-y-6">
            
            {/* Payment Method Structural High-Level Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pay with UPI Option */}
              <button 
                onClick={() => setPaymentType('upi')}
                className={`flex h-24 flex-col justify-center items-start px-6 rounded-xl border-2 transition ${
                  paymentType === 'upi' ? 'border-[#FF0B01]' : 'border-black hover:border-neutral-400'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-poppins text-base font-semibold capitalize text-[#131313]">pay with upi</span>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-between p-1 transition ${
                    paymentType === 'upi' ? 'border-[#FF0B01]' : 'border-neutral-400'
                  }`}>
                    {paymentType === 'upi' && <div className="h-full w-full rounded-full bg-[#FF0B01]" />}
                  </div>
                </div>
              </button>

              {/* Pay with Card Option */}
              <button 
                onClick={() => setPaymentType('card')}
                className={`flex h-24 flex-col justify-center items-start px-6 rounded-xl border-2 transition ${
                  paymentType === 'card' ? 'border-[#FF0B01]' : 'border-black hover:border-neutral-400'
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-poppins text-base font-semibold capitalize text-[#131313]">pay with Card</span>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-between p-1 transition ${
                    paymentType === 'card' ? 'border-[#FF0B01]' : 'border-neutral-400'
                  }`}>
                    {paymentType === 'card' && <div className="h-full w-full rounded-full bg-[#FF0B01]" />}
                  </div>
                </div>
              </button>
            </div>

            {/* NESTED LAYER CONDITIONAL CONTEXT: UPI APP SELECTION PANEL */}
            {paymentType === 'upi' && (
              <div className="pt-4 space-y-3.5">
                {/* Google Pay */}
                <div 
                  onClick={() => setSelectedUpiApp('gpay')}
                  className={`flex h-16 items-center justify-between px-6 rounded-xl border-2 cursor-pointer transition ${
                    selectedUpiApp === 'gpay' ? 'border-[#FF0B01]' : 'border-black hover:border-neutral-600'
                  }`}
                >
                  <span className="font-poppins text-base font-semibold text-[#131313]">Google pay</span>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center p-0.5 ${
                    selectedUpiApp === 'gpay' ? 'border-[#FF0B01]' : 'border-black'
                  }`}>
                    {selectedUpiApp === 'gpay' && <div className="h-full w-full rounded-full bg-[#FF0B01]" />}
                  </div>
                </div>

                {/* PhonePe */}
                <div 
                  onClick={() => setSelectedUpiApp('phonepe')}
                  className={`flex h-16 items-center justify-between px-6 rounded-xl border-2 cursor-pointer transition ${
                    selectedUpiApp === 'phonepe' ? 'border-[#FF0B01]' : 'border-black hover:border-neutral-600'
                  }`}
                >
                  <span className="font-poppins text-base font-semibold capitalize text-[#131313]">phonepe</span>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center p-0.5 ${
                    selectedUpiApp === 'phonepe' ? 'border-[#FF0B01]' : 'border-black'
                  }`}>
                    {selectedUpiApp === 'phonepe' && <div className="h-full w-full rounded-full bg-[#FF0B01]" />}
                  </div>
                </div>

                {/* Paytm */}
                <div 
                  onClick={() => setSelectedUpiApp('paytm')}
                  className={`flex h-16 items-center justify-between px-6 rounded-xl border-2 cursor-pointer transition ${
                    selectedUpiApp === 'paytm' ? 'border-[#FF0B01]' : 'border-black hover:border-neutral-600'
                  }`}
                >
                  <span className="font-poppins text-base font-semibold capitalize text-[#131313]">paytm</span>
                  <div className={`h-5 w-5 rounded-full border flex items-center justify-center p-0.5 ${
                    selectedUpiApp === 'paytm' ? 'border-[#FF0B01]' : 'border-black'
                  }`}>
                    {selectedUpiApp === 'paytm' && <div className="h-full w-full rounded-full bg-[#FF0B01]" />}
                  </div>
                </div>
              </div>
            )}

            {/* NESTED LAYER CONDITIONAL CONTEXT: CARD INTERACTION FALLBACK */}
            {paymentType === 'card' && (
              <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-sm font-medium text-neutral-500">
                Secure standard multi-gateway credit/debit card interface mapping slot.
              </div>
            )}

          </div>

          {/* RIGHT INFORMATION CONTEXT COLUMN: ORDER SUMMARY CARD */}
          <div className="rounded-xl border border-black bg-white p-6 sm:p-8 lg:col-span-5 space-y-6">
            <h2 className="font-poppins text-sm font-semibold uppercase tracking-wider text-[#131313]">
              order summary
            </h2>

            {/* Main Brand Meta Core Identification info */}
            <div className="space-y-2">
              <h3 className="font-poppins text-4xl font-semibold capitalize tracking-tight text-[#131313]">
                {product?.name || 'Necessaire'}
              </h3>
              <p className="font-poppins text-[15px] font-medium leading-relaxed text-[#8D8D8D]">
                {product?.description || 'The Body Lotion - Firming Moisturizer With 5 Peptides and 2.5% Niacinamide'}
              </p>
            </div>

            {/* Configured Item Parameters Layout */}
            <div className="flex h-9 w-24 items-center justify-center rounded-md border border-black px-4">
              <span className="font-poppins text-base font-medium text-[#FF0B01]">Qty: {quantity || 1}</span>
            </div>

            <div className="h-[1px] w-full bg-[#8D8D8D]" />

            {/* Pricing Financial Breakdowns */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-semibold uppercase text-[#131313]">
                <span>subtotal</span>
                <span>₹ {subtotal}</span>
              </div>

              <div className="h-[1px] w-full bg-[#8D8D8D]" />

              {/* Command Confirmation Action Dispatcher */}
              <div className="flex items-center justify-between text-base font-semibold uppercase mb-4">
                <span className="text-[#131313]">total</span>
                <span className="text-lg text-[#FF0B01]">₹ {total}</span>
              </div>

              <button 
                onClick={() => navigate('/customer/product-bill', { state: { product, quantity, paymentType } })}
                className="w-full py-4 bg-[#FF0B01] text-white font-bold tracking-widest text-sm rounded-lg hover:bg-red-700 transition uppercase">
                Proceed To Payment
              </button>
            </div>
          </div>

        </div>

        {/* --- DYNAMIC PRODUCT SUGGESTIONS MATRIX (RELATED PRODUCTS) --- */}
        <section className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-poppins text-xl font-bold uppercase tracking-wide text-[#131313]">
              Related Products
            </h2>
            <button className="text-sm font-bold text-neutral-800 hover:underline transition">
              See More
            </button>
          </div>

          <div className="relative">
            {/* Horizontal Product Feed Scroller Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory">
              {relatedProducts.map((product) => (
                <div 
                  key={product.id} 
                  className="w-[180px] sm:w-[200px] shrink-0 bg-white flex flex-col justify-between snap-start"
                >
                  {/* Media Placeholder Deck Container */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl bg-[#E3E1E2] p-3 flex items-start justify-end">
                    {/* Floating Rating Tag Entity */}
                    <div className="flex items-center gap-1 rounded-md bg-transparent px-1.5 py-0.5">
                      <svg className="h-3.5 w-3.5 text-[#FFA012]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs font-bold text-neutral-800">{product.rating}</span>
                    </div>
                  </div>

                  {/* Metatag Core Descriptions */}
                  <div className="mt-4 space-y-2 px-1">
                    <h4 className="font-poppins text-xs font-medium text-neutral-800 line-clamp-2 min-h-[32px] leading-snug">
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                      <span>{product.price}</span>
                      <span className="font-medium text-neutral-500">{product.volume}</span>
                    </div>
                  </div>

                  {/* Immediate Interactive Action Button */}
                  <button className="mt-4 w-full py-2.5 rounded-lg border border-neutral-800 bg-white text-xs font-bold tracking-wider text-neutral-900 uppercase hover:bg-neutral-50 transition">
                    Buy Now
                  </button>
                </div>
              ))}
            </div>

            {/* Slider Hub Navigation Right Trigger Arrow */}
            <button className="absolute -right-4 top-[30%] -translate-y-1/2 z-10 hidden lg:flex h-10 w-10 items-center justify-center rounded-full border border-neutral-800 bg-white text-neutral-800 shadow hover:bg-neutral-50 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}

