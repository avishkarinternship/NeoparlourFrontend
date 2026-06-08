import React from 'react';
import { X, Plus, Clock } from 'lucide-react';

const BillDetails = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedServices = [], 
  date = '', 
  time = '', 
  expert = null, 
  customerName = '', 
  customerPhone = '',
  selectedOffer = null,
  discountAmount = 0
}) => {
  if (!isOpen) return null;

  const serviceTotal = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const taxAndCharges = Math.round((serviceTotal - discountAmount) * 0.18); // 18% GST on discounted total
  const grandTotal = Math.max(0, serviceTotal - discountAmount + taxAndCharges);

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
            
            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {selectedOffer ? (
                <div className="space-y-4">
                  {/* Group 1: Offer Services */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 bg-red-50 text-[#FF0B01] text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider w-fit">
                      <span>{selectedOffer.name} services</span>
                    </div>
                    <div className="pl-2.5 border-l-2 border-red-100 space-y-2">
                      {selectedServices.filter(s => selectedOffer.services?.some(os => os.id === s.id)).map((service) => (
                        <div key={service.id} className="flex items-start justify-between border-b border-gray-50 pb-1.5 last:border-0 last:pb-0">
                          <div className="space-y-0.5">
                            <h4 className="text-xs font-bold text-gray-800 leading-tight uppercase">
                              {service.name || service.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold">
                              <span>₹ {service.price}</span>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span>{service.duration || 30} Min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Group 2: Regular Services */}
                  {selectedServices.filter(s => !selectedOffer.services?.some(os => os.id === s.id)).length > 0 && (
                    <div className="space-y-2 pt-2">
                      <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        Regular Services
                      </div>
                      <div className="space-y-2">
                        {selectedServices.filter(s => !selectedOffer.services?.some(os => os.id === s.id)).map((service) => (
                          <div key={service.id} className="flex items-start justify-between border-b border-gray-50 pb-1.5 last:border-0 last:pb-0">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-gray-800 leading-tight uppercase">
                                  {service.name || service.title}
                                </h4>
                                {service.category && (
                                  <span className="bg-slate-100 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    {service.category}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-[10px] text-gray-500 font-semibold">
                                <span>₹ {service.price}</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  <span>{service.duration || 30} Min</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                selectedServices.map((service) => (
                  <div key={service.id} className="flex items-start justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-gray-800 leading-tight uppercase">
                          {service.name || service.title}
                        </h4>
                        {service.category && (
                          <span className="bg-red-50 text-[#FF0B01] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            {service.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                        <span>₹ {service.price}</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Approx. {service.duration || 30} Min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {selectedServices.length === 0 && (
                <p className="text-xs text-gray-400">No services selected.</p>
              )}
            </div>
          </div>

          {/* Booking Info Box */}
          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-600 font-medium space-y-2">
            <div className="flex justify-between">
              <span>Selected Date & Time:</span>
              <span className="text-gray-900 font-bold">{date} at {time}</span>
            </div>
            <div className="flex justify-between">
              <span>Stylist / Expert:</span>
              <span className="text-gray-900 font-bold">{expert?.name || 'Any Stylist'}</span>
            </div>
          </div>

          {/* Action Trigger: Add More Services */}
          <div className="pt-2 text-center border-b border-gray-100 pb-5">
            <button 
              type="button"
              onClick={onClose}
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
              <span className="text-gray-800 font-semibold">₹ {serviceTotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold">
                <span>Offer Discount</span>
                <span>-₹ {discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax & Charges (18% GST)</span>
              <span className="text-gray-800 font-semibold">₹ {taxAndCharges}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1">
              <span>Grand Total</span>
              <span>₹ {grandTotal}</span>
            </div>
          </div>

          {/* User Meta Assignment Blocks */}
          <div className="space-y-2 pb-2">
            <h3 className="text-sm font-bold text-gray-900">
              Personal Details
            </h3>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-gray-600 font-semibold">
                {customerName} - {customerPhone}
              </span>
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