import React from 'react';

const AppointmentSuccess = ({ onClose }) => {
  // Structured metadata matching the context parameters from the design layout
  const appointmentDetails = {
    serviceName: "Haircut",
    dateAndTime: "25-04-2026 12:30PM",
    stylistName: "Akshay",
    grandTotal: 250,
    customer: {
      name: "Prowin Wadkar",
      phone: "8984753423"
    }
  };

  return (
    <div className="mx-auto max-w-xl border border-neutral-100 bg-white p-6 sm:p-10 font-sans antialiased text-[#131313] relative rounded-2xl shadow-lg">
      
      {/* --- SYSTEM TOP TRIGGER CONTROL --- */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
        <span className="text-[10px] text-neutral-300 font-medium tracking-tight select-none cursor-default leading-none">i...</span>
        <button 
          onClick={onClose}
          className="p-1 text-neutral-800 hover:bg-neutral-100 rounded-full transition"
          aria-label="Close modal view"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* --- RIPPLE GLOW SUCCESS GLYPH MATRIX --- */}
      <div className="flex justify-center pt-6 pb-4">
        <div className="relative flex items-center justify-center h-28 w-28 rounded-full bg-[#FF0B01]/5 animate-pulse">
          <div className="absolute h-24 w-24 rounded-full bg-[#FF0B01]/10" />
          <div className="absolute h-20 w-20 rounded-full bg-[#FF0B01]/20" />
          <div className="relative h-16 w-16 rounded-full bg-[#FF0B01] flex items-center justify-center shadow-md shadow-red-500/20">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* --- CONTEXT IDENTITY HEADLINE --- */}
      <div className="text-center pb-8">
        <h1 className="font-poppins text-2xl font-bold tracking-tight text-[#131313]">
          Appointment Booked
        </h1>
      </div>

      {/* --- METADATA VALUE ATTRIBUTE PARAMETERS --- */}
      <section className="space-y-4 text-sm font-semibold text-[#131313]">
        <div className="flex items-center justify-between">
          <span className="text-neutral-700">Service Name</span>
          <span className="text-neutral-900 font-bold">{appointmentDetails.serviceName}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-neutral-700">Date And Time</span>
          <span className="text-neutral-900 font-bold">{appointmentDetails.dateAndTime}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-neutral-700">Stylist Name</span>
          <span className="text-neutral-900 font-bold">{appointmentDetails.stylistName}</span>
        </div>

        <div className="flex items-center justify-between text-base font-bold pt-2">
          <span className="text-lg">Grand Total</span>
          <span className="text-lg">₹ {appointmentDetails.grandTotal}</span>
        </div>
      </section>

      {/* --- PARTITION SEPARATOR RULE --- */}
      <div className="h-[1px] w-full bg-[#8D8D8D] opacity-35 my-6" />

      {/* --- ACCOUNT IDENTIFICATION RECOGNITION BLOCK --- */}
      <section className="space-y-2.5 pb-2">
        <h2 className="font-poppins text-base font-bold text-[#131313]">
          Personal Details
        </h2>
        <div className="text-sm font-semibold text-neutral-700">
          {appointmentDetails.customer.name} - {appointmentDetails.customer.phone}
        </div>
      </section>

    </div>
  );
}

export default AppointmentSuccess;
