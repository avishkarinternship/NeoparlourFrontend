import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductPaymentMethod() {
  const navigate = useNavigate();
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
      
      {/* --- PLATFORM MASTER HEADER --- */}
      <header className="sticky top-0 z-50 flex h-20 items-center justify-between border-b border-[#E8E8E8] bg-white px-4 sm:px-8 lg:px-16 shadow-sm">
        {/* Brand Group */}
        <div className="flex items-center gap-3 select-none cursor-pointer shrink-0">
          <NeoLogoIcon className="h-8 w-8" />
          <span className="font-poppins text-xl font-bold tracking-tight text-[#242424]">
            NeoParlour
          </span>
        </div>

        {/* Dynamic Global Hub Search Bar */}
        <div className="hidden md:flex h-12 w-full max-w-[620px] items-center rounded-xl border border-[#909090] bg-white px-2 shadow-sm mx-4">
          <div className="flex flex-1 items-center gap-2 px-2">
            <svg className="h-5 w-5 text-[#8D8D8D] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search near by salon"
              className="w-full text-sm bg-transparent placeholder-[#8D8D8D] outline-none text-neutral-800"
            />
          </div>

          <div className="h-6 w-[1px] bg-[#E4E4E4]" />

          {/* Context Hub: Location */}
          <button className="flex items-center gap-1.5 px-3 text-xs font-semibold text-[#8D8D8D] hover:text-neutral-600 transition shrink-0">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 21">
              <path fillRule="evenodd" d="M9.547 19.195C12.397 15.92 16 11.779 16 8.055 16 3.607 12.418 0 8 0S0 3.607 0 8.055c0 3.724 3.603 7.865 6.453 11.14.555.638 1.082 1.242 1.547 1.805.465-.563.992-1.167 1.547-1.805zM8 10.5a2.887 2.887 0 100-5.775A2.887 2.887 0 008 10.5z" clipRule="evenodd" />
            </svg>
            <span>Location</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>

          <div className="h-6 w-[1px] bg-[#E4E4E4]" />

          {/* Context Hub: Date */}
          <button className="flex items-center gap-1.5 px-3 text-xs font-semibold text-[#8D8D8D] hover:text-neutral-600 transition shrink-0">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Date</span>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
          </button>

          {/* Command Executer Trigger */}
          <button className="h-9 rounded-lg bg-[#FF0B01] px-5 text-xs font-bold tracking-widest text-white hover:bg-red-700 transition">
            SEARCH
          </button>
        </div>

        {/* System Responsive Menu Toggler */}
        <button className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg transition">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

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
                nessaire
              </h3>
              <p className="font-poppins text-[15px] font-medium leading-relaxed text-[#8D8D8D]">
                The Body Lotion - Firming Moisturizer With 5 Peptides and 2.5% Niacinamide
              </p>
            </div>

            {/* Configured Item Parameters Layout */}
            <div className="flex h-9 w-24 items-center justify-center rounded-md border border-black px-4">
              <span className="font-poppins text-base font-medium text-[#FF0B01]">50ml</span>
            </div>

            <div className="h-[1px] w-full bg-[#8D8D8D]" />

            {/* Pricing Financial Breakdowns */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm font-semibold uppercase text-[#131313]">
                <span>subtotal</span>
                <span>₹ 450</span>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold uppercase text-[#131313]">
                <span>tax</span>
                <span>₹ 50</span>
              </div>

              <div className="h-[1px] w-full bg-[#8D8D8D]" />

              {/* Command Confirmation Action Dispatcher */}
              <div className="flex items-center justify-between text-base font-semibold uppercase mb-4">
                <span className="text-[#131313]">total</span>
                <span className="text-lg text-[#FF0B01]">₹ 500</span>
              </div>

              <button 
                onClick={() => navigate('/customer/product-bill')}
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

      {/* --- PLATFORM MASTER FOOTER --- */}
      <footer className="bg-[#EAEAEA] mt-24 px-6 sm:px-12 lg:px-24 pt-14 pb-8">
        <div className="mx-auto max-w-7xl flex flex-col lg:flex-row lg:justify-between gap-12">
          
          {/* Brand Vector Column Alignment Anchor */}
          <div className="space-y-4 shrink-0">
            <div className="flex items-center gap-3 select-none">
              <NeoLogoIcon className="h-8 w-8" />
              <span className="font-poppins text-xl font-bold tracking-tight text-[#242424]">
                NeoParlour
              </span>
            </div>
          </div>

          {/* Structured Context Directories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-20">
            <FooterLinkGroup
              title="company"
              links={['Influencer Program', 'Careers', 'About Us', 'Partner with us', 'Buy gift card', 'Blogs']}
            />
            <FooterLinkGroup
              title="company"
              links={['Privacy Policy', 'Terms of service']}
            />
            <FooterLinkGroup
              title="company"
              links={['Whatsapp', 'Emails']}
            />
          </div>
        </div>

        {/* Structural Separation Rule */}
        <div className="mx-auto max-w-7xl my-8 h-[1px] w-full bg-[#8D8D8D] opacity-65" />

        {/* Global Rights Registry / Social Media Gateway Cluster */}
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-[#8D8D8D]">
            copyright@neopaceinfotech.com
          </span>
          
          <div className="flex items-center gap-5">
            {/* Instagram Social Trigger Layout */}
            <a href="#instagram" className="text-neutral-600 hover:text-neutral-900 transition">
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            {/* Facebook Social Trigger Layout */}
            <a href="#facebook" className="text-[#1877F2] hover:opacity-90 transition">
              <span className="sr-only">Facebook</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12c0-6.627-5.373-12-12-12S0 5.373 0 12c0 5.99 4.388 10.954 10.125 11.854V15.47H7.078V12h3.047V9.356c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874V12h3.328l-.532 3.47h-2.796v8.385C19.612 22.954 24 17.99 24 12z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterLinkGroup({ title, links }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col">
      <h4 className="font-poppins text-base font-bold capitalize text-black mb-4">
        {title}
      </h4>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <li 
            key={index} 
            onClick={() => {
              if (link === 'Partner with us') {
                navigate('/customer/partner-with-us');
              } else if (link === 'About Us') {
                navigate('/customer/about');
              }
            }}
            className="flex items-start text-sm font-medium text-[#505050] hover:text-black transition cursor-pointer select-none"
          >
            <span className="mr-2 text-xs text-neutral-400">•</span>
            <span>{link}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function NeoLogoIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M50.815 0.71C51.524 5.928 50.204 10.244 46.635 13.679 42.628 17.538 38.473 21.241 34.405 25.038c-.508.472-.775.503-1.253-.021-1.16-1.275-2.352-2.518-3.595-3.703-.58-.556-.477-.845.062-1.333 6.42-5.815 12.82-11.657 19.225-17.494.596-.54 1.192-1.07 1.978-1.773z" fill="#878787" />
      <path fillRule="evenodd" clipRule="evenodd" d="M45.068 28.004c-3.868-2.402-8.542-2.397-12.317-.01C25.324 20.499 17.918 12.995 10.527 5.464 8.791 3.687 7.132 1.83 5.432 0c-.267.299-.344.341-.354.399-.837 4.998-.093 9.576 3.528 13.336 1.895 1.966 3.873 3.854 5.804 5.784 2.625 2.611 5.25 5.223 7.874 7.835 2.959 3.325 5.691 6.393 8.537 9.586.344-.855.55-1.458.817-2.025 1.941-4.064 6.79-5.773 10.775-3.812 2.887 1.421 4.747 4.49 4.495 7.689-.262 3.366-1.972 5.831-5.11 7.048-3.23 1.248-6.281.634-8.644-1.925-4.12-4.46-8.059-9.09-12.126-13.6-2.656-2.953-6.046-4.39-9.996-4.018-5.362.509-9.44 4.159-10.693 9.272C-1.196 40.453.863 45.687 5.06 48.414c4.448 2.895 9.723 2.716 14.088-.635 1.1-.85 1.829-1.023 2.553.23 0 0 4.294 2.56 7.314 2.22-3.205-3.624-6.179-6.98-9.255-10.468-.344.876-.545 1.495-.822 2.072-1.921 3.933-6.39 5.606-10.396 3.912-3.826-1.62-5.783-6.078-4.406-10.053 1.977-5.748 9.342-7.269 13.549-2.701 4.067 4.41 7.925 9.014 11.977 13.44 3.23 3.53 7.293 4.757 11.936 3.561 4.833-1.243 8.397-5.26 8.9-10.043.54-5.134-1.36-9.214-5.762-11.946z" fill="#EF3E23" />
    </svg>
  );
}

