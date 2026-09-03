// src/components/services/AddServiceModal.jsx
import React, { useState, useEffect } from 'react';
import { calculateInclusiveGst } from '../../utils/taxUtils';

export const AddServiceModal = ({ isOpen, onClose, onSave, salonGstStatus, isDarkMode = false }) => {
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [gstBreakdown, setGstBreakdown] = useState(null);

  // Check if salon has GSTIN and whether state is UT
  const hasGstin = Boolean(salonGstStatus?.hasGstin || salonGstStatus?.gstin);
  const stateUpper = (salonGstStatus?.state || '').toUpperCase();
  const isUt = stateUpper === 'LADAKH' || 
               stateUpper === 'CHANDIGARH' || 
               stateUpper === 'LAKSHADWEEP' || 
               stateUpper === 'ANDAMAN_AND_NICOBAR_ISLANDS' || 
               stateUpper === 'DADRA_AND_NAGAR_HAVELI_AND_DAMAN_AND_DIU' ||
               stateUpper.includes('DAMAN') ||
               stateUpper.includes('ANDAMAN');

  // Recalculate live GST breakdown on price change
  useEffect(() => {
    if (hasGstin && price) {
      setGstBreakdown(calculateInclusiveGst(price, isUt));
    } else {
      setGstBreakdown(null);
    }
  }, [price, hasGstin, isUt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ serviceName, price: parseFloat(price), duration: parseInt(duration, 10) });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className={`rounded-2xl max-w-md w-full p-6 shadow-xl border transition-all ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-gray-100 text-gray-900'
      }`}>
        <h2 className="text-xl font-bold mb-4">Add New Service</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Name */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>Service Name</label>
            <input
              type="text"
              required
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="e.g. Premium Haircut"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
            />
          </div>

          {/* Price Input */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>Service Price (₹)</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400 font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                required
                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold focus:outline-none ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="300"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          </div>

          {/* LIVE GST BREAKDOWN PREVIEW CARD (Visible only when GSTIN exists) */}
          {hasGstin && gstBreakdown && (
            <div className={`p-3.5 border rounded-xl space-y-2 text-xs transition-all ${
              isDarkMode 
                ? 'bg-purple-950/40 border-purple-800/60 text-purple-200' 
                : 'bg-purple-50/70 border-purple-200 text-purple-900'
            }`}>
              <div className={`flex items-center justify-between font-semibold border-b pb-1.5 ${
                isDarkMode ? 'border-purple-800/60' : 'border-purple-200/60'
              }`}>
                <span>Inclusive GST Breakdown (18%)</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  isDarkMode ? 'bg-purple-900 text-purple-200' : 'bg-purple-200 text-purple-800'
                }`}>
                  GSTIN: {salonGstStatus?.gstin || 'Registered'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-400">
                <div>Taxable Base Value: <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>₹{gstBreakdown.baseValue}</strong></div>
                <div>Total Tax (18%): <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>₹{gstBreakdown.totalGst}</strong></div>
                <div>CGST (9%): <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>₹{gstBreakdown.cgst}</strong></div>
                <div>{gstBreakdown.secondTaxLabel}: <strong className={isDarkMode ? 'text-white' : 'text-gray-900'}>₹{gstBreakdown.sgstOrUtgst}</strong></div>
              </div>
              <div className={`text-[11px] font-medium pt-1 space-y-1 ${isDarkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                <div>✔ Customer will pay <strong>₹{gstBreakdown.totalPrice}</strong> on the invoice.</div>
                <div className={`text-[10px] italic ${isDarkMode ? 'text-purple-400/80' : 'text-purple-600/80'}`}>
                  * Note: This tax distribution is for salon accounting reference only and will not be displayed to customers when booking.
                </div>
              </div>
            </div>
          )}

          {/* Duration Input */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>Duration (minutes)</label>
            <input
              type="number"
              required
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300 text-gray-900'
              }`}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className={`flex justify-end gap-3 pt-4 border-t ${isDarkMode ? 'border-zinc-800' : 'border-gray-100'}`}>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                isDarkMode ? 'text-zinc-400 hover:bg-zinc-800' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition"
            >
              Save Service
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
