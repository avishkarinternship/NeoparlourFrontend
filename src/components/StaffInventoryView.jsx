import React, { useState, useEffect } from 'react';
import { Package, Unlock, Layers, RefreshCw } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import toast from 'react-hot-toast';

export default function StaffInventoryView({ staffId, isDarkMode = false }) {
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
      <div className="glass-card p-12 text-center rounded-[24px] shadow-sm max-w-4xl mx-auto my-6">
        <div className="w-10 h-10 border-4 border-[var(--brand-primary,#7C3AED)] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-slate-500 dark:text-zinc-400 font-bold text-sm">Loading inventory stock...</p>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 glass-card p-6 rounded-[24px] shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[var(--brand-primary,#7C3AED)]" />
            Staff Inventory & Opened Stock
          </h2>
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400 mt-0.5">
            Track products assigned to you and manage active open containers
          </p>
        </div>
        <button
          onClick={loadInventoryData}
          className="p-2.5 glass-card-interactive rounded-xl transition flex items-center gap-1.5 text-xs font-black uppercase tracking-wider cursor-pointer text-slate-700 dark:text-zinc-200"
        >
          <RefreshCw className="w-4 h-4 text-[var(--brand-primary,#7C3AED)]" /> Refresh
        </button>
      </div>

      {/* 1. Active Opened Products Card */}
      <div className="glass-card p-6 sm:p-8 rounded-[32px] shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
          <Unlock className="w-5 h-5 text-amber-500" />
          Active Opened Products (Ready for Service Use)
        </h3>

        {openedProducts.length === 0 ? (
          <div className="text-center py-6 rounded-2xl border border-dashed border-amber-500/30 text-amber-700 dark:text-amber-400 font-semibold text-xs bg-amber-500/5">
            No active opened product containers found. Open sealed items from your assigned stock below when needed.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {openedProducts.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl glass-card border border-amber-500/30 shadow-xs">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">{item.productName || 'Product'}</h4>
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-amber-500/20">
                    OPEN
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-zinc-300 space-y-1 font-semibold">
                  <p>
                    <span className="text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[10px] block">Remaining Qty:</span>{' '}
                    <strong className="text-amber-600 dark:text-amber-400 text-sm">{item.remainingQuantity} {item.unit || 'units'}</strong>
                  </p>
                  <p>
                    <span className="text-slate-400 dark:text-zinc-500 uppercase tracking-wider text-[10px]">Opened On:</span>{' '}
                    {item.openedAt ? new Date(item.openedAt).toLocaleDateString() : 'N/A'}
                  </p>
                  {item.notes && <p className="text-slate-500 dark:text-zinc-400 italic text-[11px]">"{item.notes}"</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Assigned Stock Table */}
      <div className="glass-card p-6 sm:p-8 rounded-[32px] shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-[var(--brand-primary,#7C3AED)]" />
          Assigned Inventory Stock
        </h3>

        {assignedInventory.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 font-semibold text-xs">
            No inventory stock assigned to your profile yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/20 dark:border-white/10 bg-slate-100/50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 font-black uppercase tracking-wider">
                  <th className="p-3.5 rounded-l-xl">Product Name</th>
                  <th className="p-3.5">SKU / Category</th>
                  <th className="p-3.5">Assigned Qty</th>
                  <th className="p-3.5">Unopened Qty</th>
                  <th className="p-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-white/5 font-semibold">
                {assignedInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{item.productName}</td>
                    <td className="p-3.5 text-slate-400 dark:text-zinc-400">{item.sku || item.category || 'General'}</td>
                    <td className="p-3.5 text-slate-700 dark:text-zinc-200">{item.assignedQuantity || item.quantity || 0}</td>
                    <td className="p-3.5 text-[var(--brand-primary,#7C3AED)] font-bold">{item.unopenedQuantity || item.quantity || 0}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => { setSelectedItem(item); setOpenModal(true); }}
                        className="px-3.5 py-2 bg-[var(--brand-primary,#7C3AED)]/10 hover:bg-[var(--brand-primary,#7C3AED)]/20 text-[var(--brand-primary,#7C3AED)] border border-[var(--brand-primary,#7C3AED)]/20 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ml-auto cursor-pointer"
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
          <div className="glass-panel rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl border border-white/20">
            <h3 className="text-xl font-black mb-2 text-slate-900 dark:text-white uppercase tracking-tight">Open Product Container</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold mb-4">
              Open container/pack for product <strong className="text-[var(--brand-primary,#7C3AED)]">{selectedItem.productName}</strong>
            </p>

            <form onSubmit={handleOpenProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Open Quantity*</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  required
                  value={openQty}
                  onChange={(e) => setOpenQty(e.target.value)}
                  placeholder="Number of units to open"
                  className="w-full glass-input rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Opened for hair treatment session..."
                  className="w-full glass-input rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/20 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => { setOpenModal(false); setSelectedItem(null); }}
                  className="px-4 py-3 glass-card rounded-xl text-xs font-bold text-slate-700 dark:text-zinc-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={openLoading}
                  className="px-5 py-3 bg-[var(--brand-primary,#7C3AED)] hover:brightness-110 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-md"
                  style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff' }}
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
