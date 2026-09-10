import React from 'react';
import { Receipt, Info } from 'lucide-react';

/**
 * BillingSummaryCard Component
 * Dynamically displays tax breakdowns (Net Taxable Amount, CGST 9%, SGST 9%) 
 * based on salon.includeGstInInvoice toggle settings.
 */
export const BillingSummaryCard = ({
  subtotal = 0,
  discountAmount = 0,
  homeCharge = 0,
  includeGst = false,
  gstin = '',
  isDarkMode = false,
  className = '',
}) => {
  const baseNet = Math.max(0, subtotal - discountAmount + homeCharge);
  
  // If GST enabled: CGST 9% + SGST 9% (18% total tax)
  const cgst = includeGst ? baseNet * 0.09 : 0;
  const sgst = includeGst ? baseNet * 0.09 : 0;
  const totalGst = cgst + sgst;
  const grandTotal = includeGst ? baseNet + totalGst : baseNet;

  return (
    <div
      className={`p-5 rounded-2xl border font-sans transition-all duration-300 ${
        isDarkMode
          ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
          : 'bg-gray-50 border-gray-200 text-gray-900'
      } ${className}`}
    >
      <div className={`flex items-center justify-between pb-3 mb-3 border-b ${
        isDarkMode ? 'border-zinc-800' : 'border-gray-200'
      }`}>
        <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
          isDarkMode ? 'text-zinc-200' : 'text-gray-700'
        }`}>
          <Receipt className="w-4 h-4 text-[#ff0b01]" />
          Billing Breakdown
        </h4>
        {includeGst && (
          <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
            isDarkMode
              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
              : 'bg-emerald-100 text-emerald-800 border-emerald-200'
          }`}>
            GST 18% Enabled
          </span>
        )}
      </div>

      <div className="space-y-2 text-xs font-semibold">
        {/* Subtotal */}
        <div className={`flex justify-between ${
          isDarkMode ? 'text-zinc-400' : 'text-gray-600'
        }`}>
          <span>Item Subtotal</span>
          <span className="font-mono">₹{subtotal.toFixed(2)}</span>
        </div>

        {/* Discount */}
        {discountAmount > 0 && (
          <div className={`flex justify-between ${
            isDarkMode ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            <span>Special Discount</span>
            <span className="font-mono">- ₹{discountAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Home Charge */}
        {homeCharge > 0 && (
          <div className={`flex justify-between ${
            isDarkMode ? 'text-zinc-400' : 'text-gray-600'
          }`}>
            <span>Home Service Convenience Charge</span>
            <span className="font-mono">+ ₹{homeCharge.toFixed(2)}</span>
          </div>
        )}

        {/* GST Tax Breakdown vs Standard */}
        {includeGst ? (
          <>
            <div className={`flex justify-between pt-2 border-t border-dashed font-bold ${
              isDarkMode ? 'text-zinc-200 border-zinc-800' : 'text-gray-700 border-gray-200'
            }`}>
              <span>Net Taxable Amount</span>
              <span className="font-mono">₹{baseNet.toFixed(2)}</span>
            </div>

            <div className={`flex justify-between text-[11px] pl-2 ${
              isDarkMode ? 'text-zinc-400' : 'text-gray-500'
            }`}>
              <span>CGST (9%)</span>
              <span className="font-mono">₹{cgst.toFixed(2)}</span>
            </div>

            <div className={`flex justify-between text-[11px] pl-2 ${
              isDarkMode ? 'text-zinc-400' : 'text-gray-500'
            }`}>
              <span>SGST (9%)</span>
              <span className="font-mono">₹{sgst.toFixed(2)}</span>
            </div>

            {gstin && (
              <div className={`text-[10px] font-mono tracking-wider pt-1 flex items-center gap-1 ${
                isDarkMode ? 'text-zinc-400' : 'text-gray-500'
              }`}>
                <Info className="w-3 h-3 text-blue-500 shrink-0" />
                <span>GSTIN: {gstin}</span>
              </div>
            )}

            <div className={`flex justify-between text-sm font-black pt-2.5 border-t ${
              isDarkMode ? 'text-white border-zinc-800' : 'text-gray-900 border-gray-300'
            }`}>
              <span>Total Amount Payable (incl. GST)</span>
              <span className="font-mono text-[#ff0b01]">₹{grandTotal.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <div className={`flex justify-between text-sm font-black pt-2.5 border-t ${
            isDarkMode ? 'text-white border-zinc-800' : 'text-gray-900 border-gray-300'
          }`}>
            <span>Total Amount Payable</span>
            <span className="font-mono text-[#ff0b01]">₹{baseNet.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingSummaryCard;
