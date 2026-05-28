import React from 'react';
import { X, Plus, Clock } from 'lucide-react';

const BillDetails = ({ isOpen, onClose, onConfirm }) => {
  // Note: If you want this modal to show without passing props from App.jsx,
  // you can temporarily comment out the next line:
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans antialiased">
      {/* Modal Container */}
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-gray-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header Section */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 tracking-tight uppercase">
            Bill Details
          </h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Framework */}
        <div className="p-6 space-y-6">
          
          {/* Service Confirmation Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Confirm Your Services
            </h3>
            
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-sm font-medium text-gray-800">
                    Hair Cut - Stylist
                  </h4>
                  <span className="bg-red-50 text-[#FF0B01] text-[11px] font-bold px-2.5 py-0.5 rounded-md tracking-wide">
                    Men
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                  <span>₹ 200</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Approx. 45 Min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Trigger: Add More Services */}
          <div className="pt-2 text-center border-b border-gray-100 pb-5">
            <button 
              type="button"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#FF0B01] hover:text-red-700 transition tracking-wide"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add More Service</span>
            </button>
          </div>

          {/* Pricing Ledger Calculator */}
          <div className="space-y-3 border-b border-gray-100 pb-5 text-sm font-medium">
            <div className="flex justify-between text-gray-600">
              <span>Service Total</span>
              <span className="text-gray-800 font-semibold">₹ 200</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax & Charges</span>
              <span className="text-gray-800 font-semibold">₹ 50</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
              <span>Grand Total</span>
              <span>₹ 250</span>
            </div>
          </div>

          {/* User Meta Assignment Blocks */}
          <div className="space-y-2 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              Personal Details
            </h3>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-gray-600">
                Prowin Wadkar - 7057577012
              </span>
              <button 
                type="button"
                className="text-[#FF0B01] font-bold hover:underline"
              >
                Change
              </button>
            </div>
          </div>

          {/* Primary Action Button Submission Stack */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onConfirm}
              className="w-full bg-[#FF0B01] text-white text-xs font-bold uppercase tracking-widest py-3.5 rounded hover:bg-red-700 transition shadow-sm"
            >
              Book and Pay After Services
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BillDetails;