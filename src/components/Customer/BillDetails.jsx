import React from 'react';
import { X, Plus, Clock, Sparkles, CheckCircle } from 'lucide-react';

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
  discountAmount = 0,
  weekdayDiscountAmount = 0,
  weekdayDiscountPercent = 0,
  loading = false,
  homeService = false,
  homeCharge = 0,
  address = ''
}) => {
  if (!isOpen) return null;

  const serviceTotal = selectedServices.reduce((sum, s) => sum + (s.price || 0), 0);
  const grandTotal = Math.max(0, serviceTotal - discountAmount - weekdayDiscountAmount + (homeService ? homeCharge : 0));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 font-sans antialiased">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container — drawer on mobile, centered card on sm+ */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[85dvh] sm:max-h-[88vh] animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#FF0B01]" />
            <h2 className="text-sm font-black text-slate-900 tracking-tight uppercase">
              Bill Details
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">

          {/* Services List */}
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
              Confirm Your Services
            </h3>

            <div className="space-y-2">
              {selectedOffer ? (
                <>
                  {/* Offer Services Group */}
                  <div className="rounded-2xl bg-red-50/60 border border-red-100 p-3 space-y-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF0B01] shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#FF0B01]">
                        {selectedOffer.name} Bundle
                      </span>
                    </div>
                    {selectedServices.filter(s => selectedOffer.services?.some(os => os.id === s.id)).map((service) => (
                      <div key={service.id} className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-2 border border-red-50">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 uppercase truncate">{service.name || service.title}</p>
                          <p className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                            <Clock className="w-3 h-3 shrink-0" />
                            {service.duration || 30} Min
                          </p>
                        </div>
                        <span className="text-xs font-black text-slate-700 shrink-0">₹{service.price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Regular Services Group */}
                  {selectedServices.filter(s => !selectedOffer.services?.some(os => os.id === s.id)).length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Regular Services</p>
                      {selectedServices.filter(s => !selectedOffer.services?.some(os => os.id === s.id)).map((service) => (
                        <div key={service.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-bold text-slate-900 uppercase truncate">{service.name || service.title}</p>
                              {service.category && (
                                <span className="bg-slate-200 text-slate-500 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  {service.category}
                                </span>
                              )}
                            </div>
                            <p className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                              <Clock className="w-3 h-3 shrink-0" />
                              {service.duration || 30} Min
                            </p>
                          </div>
                          <span className="text-xs font-black text-slate-700 shrink-0">₹{service.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                selectedServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-bold text-slate-900 uppercase truncate">{service.name || service.title}</p>
                        {service.category && (
                          <span className="bg-red-50 text-[#FF0B01] text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            {service.category}
                          </span>
                        )}
                      </div>
                      <p className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mt-0.5">
                        <Clock className="w-3 h-3 shrink-0" />
                        Approx. {service.duration || 30} Min
                      </p>
                    </div>
                    <span className="text-xs font-black text-slate-700 shrink-0">₹{service.price}</span>
                  </div>
                ))
              )}

              {selectedServices.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4">No services selected.</p>
              )}
            </div>
          </div>

          {/* Booking Info */}
          <div className="bg-slate-50 rounded-2xl p-3.5 space-y-2 border border-slate-100">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Date &amp; Time</span>
              <span className="text-slate-900 font-bold text-right">{date} at {time}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-semibold">Stylist / Expert</span>
              <span className="text-slate-900 font-bold">{expert?.name || 'Any Stylist'}</span>
            </div>
          </div>

          {/* Add More Services */}
          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 text-xs font-black text-[#FF0B01] hover:text-red-700 transition tracking-wide"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add More Service
            </button>
          </div>

          {/* Pricing Ledger */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>Service Total</span>
              <span className="text-slate-800 font-bold">₹{serviceTotal}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600 font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF0B01]" /> Offer Discount
                </span>
                <span>-₹{discountAmount}</span>
              </div>
            )}

            {weekdayDiscountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600 font-bold">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF0B01]" /> Weekday Discount ({weekdayDiscountPercent}%)
                </span>
                <span>-₹{weekdayDiscountAmount}</span>
              </div>
            )}

            {homeService && homeCharge > 0 && (
              <div className="flex justify-between text-xs text-slate-500 font-semibold">
                <span>Home Service Charge</span>
                <span className="text-slate-800 font-bold">₹{homeCharge}</span>
              </div>
            )}

            <div className="border-t border-dashed border-slate-200 pt-2.5 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900">Grand Total</span>
              <span className="text-lg font-black text-[#FF0B01]">₹{grandTotal}</span>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-3">
            <div className="space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Personal Details</h3>
              <p className="text-xs font-semibold text-slate-700">{customerName} · {customerPhone}</p>
            </div>

            {homeService && (
              <div className="space-y-1 bg-red-50/50 border border-red-100/50 rounded-2xl p-3">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#FF0B01]">Home Service Address</h3>
                <p className="text-xs font-semibold text-slate-700 leading-normal">{address || 'No address specified'}</p>
              </div>
            )}
          </div>

        </div>

        {/* ── Sticky Footer CTA ── */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 bg-white">
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#FF0B01] to-[#D00600] text-white text-xs font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] ${
              loading ? 'opacity-60 cursor-not-allowed' : 'hover:from-red-700 hover:to-red-800'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Booking...
              </span>
            ) : 'Book & Pay After Services'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BillDetails;