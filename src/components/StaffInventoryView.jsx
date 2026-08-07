import React, { useState, useEffect } from 'react';
import { Package, Unlock, Layers, RefreshCw } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import toast from 'react-hot-toast';

export default function StaffInventoryView({ staffId }) {
  const [assignedInventory, setAssignedInventory] = useState([]);
  const [openedProducts, setOpenedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Open Product Modal State
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openQty, setOpenQty] = useState('');
  const [notes, setNotes] = useState('');
  const [openLoading, setOpenLoading] = useState(false);

  useEffect(() => {
    if (staffId) {
      loadInventoryData();
    }
  }, [staffId]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      const [assignedRes, openedRes] = await Promise.all([
        staffApi.getAssignedInventory(staffId),
        staffApi.getActiveOpenedProducts(staffId),
      ]);
      setAssignedInventory(assignedRes.data?.content || assignedRes.data || []);
      setOpenedProducts(openedRes.data?.content || openedRes.data || []);
    } catch (err) {
      console.error('Error loading staff inventory:', err);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProduct = async (e) => {
    e.preventDefault();
    if (!openQty || parseFloat(openQty) <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    setOpenLoading(true);
    try {
      await staffApi.openProductQuantity(selectedItem.id, parseFloat(openQty), notes);
      toast.success(`Opened ${openQty} units of ${selectedItem.productName || 'product'}`);
      setOpenModal(false);
      setSelectedItem(null);
      setOpenQty('');
      setNotes('');
      loadInventoryData();
    } catch (err) {
      toast.error('Failed to open product: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setOpenLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center bg-white rounded-[24px] shadow-sm border border-slate-100 max-w-4xl mx-auto my-6">
        <div className="w-10 h-10 border-4 border-[#FF0B01] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 font-bold text-sm">Loading inventory stock...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#FF0B01]" />
            Staff Inventory & Opened Stock
          </h2>
          <p className="text-xs font-semibold text-slate-400 mt-0.5">Track products assigned to you and manage active open containers</p>
        </div>
        <button
          onClick={loadInventoryData}
          className="p-2.5 text-slate-600 hover:text-[#FF0B01] hover:bg-slate-100 rounded-xl transition flex items-center gap-1.5 text-xs font-black uppercase tracking-wider cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* 1. Active Opened Products Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
          <Unlock className="w-5 h-5 text-amber-500" />
          Active Opened Products (Ready for Service Use)
        </h3>

        {openedProducts.length === 0 ? (
          <div className="text-center py-6 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200 text-amber-800 font-semibold text-xs">
            No active opened product containers found. Open sealed items from your assigned stock below when needed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openedProducts.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 text-base">{item.productName || 'Product'}</h4>
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider rounded-lg">OPEN</span>
                </div>
                <div className="text-xs text-slate-600 space-y-1 font-semibold">
                  <p><span className="text-slate-400 uppercase tracking-wider text-[10px] block">Remaining Qty:</span> <strong className="text-amber-800 text-sm">{item.remainingQuantity} {item.unit || 'units'}</strong></p>
                  <p><span className="text-slate-400 uppercase tracking-wider text-[10px]">Opened On:</span> {item.openedAt ? new Date(item.openedAt).toLocaleDateString() : 'N/A'}</p>
                  {item.notes && <p className="text-slate-500 italic text-[11px]">"{item.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Assigned Stock Table */}
      <div className="bg-white p-6 sm:p-8 rounded-[32px] shadow-sm border border-slate-100">
        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#FF0B01]" />
          Assigned Inventory Stock
        </h3>

        {assignedInventory.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 font-semibold text-xs">
            No inventory stock assigned to your profile yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-black uppercase tracking-wider">
                  <th className="p-3.5 rounded-l-xl">Product Name</th>
                  <th className="p-3.5">SKU / Category</th>
                  <th className="p-3.5">Assigned Qty</th>
                  <th className="p-3.5">Unopened Qty</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {assignedInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-3.5 font-bold text-slate-900">{item.productName}</td>
                    <td className="p-3.5 text-slate-400">{item.sku || item.category || 'General'}</td>
                    <td className="p-3.5 text-slate-700">{item.assignedQuantity || item.quantity || 0}</td>
                    <td className="p-3.5 text-[#FF0B01] font-bold">{item.unopenedQuantity || item.quantity || 0}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => { setSelectedItem(item); setOpenModal(true); }}
                        className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-[#FF0B01] border border-red-100 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Open Quantity
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Open Product Quantity Modal */}
      {openModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="text-xl font-black mb-2 text-slate-900 uppercase tracking-tight">Open Product Container</h3>
            <p className="text-xs text-slate-500 font-semibold mb-4">
              Open container/pack for product <strong className="text-[#FF0B01]">{selectedItem.productName}</strong>
            </p>

            <form onSubmit={handleOpenProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Open Quantity*</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={openQty}
                  onChange={(e) => setOpenQty(e.target.value)}
                  placeholder="Number of units to open"
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Opened for hair treatment session..."
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#FF0B01] outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setOpenModal(false); setSelectedItem(null); }}
                  className="px-4 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={openLoading}
                  className="px-5 py-3 bg-gradient-to-r from-[#FF0B01] to-[#FF4D3A] hover:from-red-600 hover:to-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  {openLoading ? 'Opening...' : 'Confirm Open'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
