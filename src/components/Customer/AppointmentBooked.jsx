import React from 'react';
import { X, Check } from 'lucide-react';

const AppointmentBooked = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans antialiased">
      {/* Modal Container */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button Trigger */}
        <div className="flex justify-end px-6 pt-5">
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout Stack */}
        <div className="px-8 pb-8 pt-2 flex flex-col items-center">
          
          {/* Animated/Layered Status Success Indicator Rings */}
          <div className="relative flex items-center justify-center w-28 h-28 mb-5">
            <div className="absolute inset-0 bg-[#FF0B01]/5 rounded-full animate-ping dynamic-pulse" />
            <div className="absolute inset-2 bg-[#FF0B01]/10 rounded-full" />
            <div className="absolute inset-4 bg-[#FF0B01]/20 rounded-full" />
            <div className="absolute inset-6 bg-[#FF0B01] rounded-full flex items-center justify-center shadow-lg shadow-[#FF0B01]/30">
              <Check className="w-8 h-8 text-white stroke-[3.5]" />
            </div>
          </div>

          {/* Success Summary Header */}
          <h2 className="text-xl font-bold text-gray-900 tracking-tight text-center mb-8">
            Appointment Booked
          </h2>

          {/* Booking Data Matrix Grid */}
          <div className="w-full space-y-3.5 text-xs font-medium text-gray-600 mb-5">
            <div className="flex justify-between items-center">
              <span>Service Name</span>
              <span className="text-gray-900 font-semibold">Haircut</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Date And Time</span>
              <span className="text-gray-900 font-semibold">25-04-2026 12:30PM</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Stylist Name</span>
              <span className="text-gray-900 font-semibold">Akshay</span>
            </div>

            {/* Total Highlight Row */}
            <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-2">
              <span>Grand Total</span>
              <span className="text-base font-extrabold text-gray-900">₹ 250</span>
            </div>
          </div>

          {/* Separation Boundary */}
          <hr className="w-full border-gray-200 my-1" />

          {/* Customer Metadata Block */}
          <div className="w-full space-y-1.5 pt-4 text-left self-start">
            <h3 className="text-sm font-bold text-gray-900">
              Personal Details
            </h3>
            <p className="text-xs font-medium text-gray-600 tracking-wide">
              Prowin Wadkar - 7057577012
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AppointmentBooked;