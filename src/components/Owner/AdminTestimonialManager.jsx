import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Star, MessageSquareQuote, CheckCircle, X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { testimonialService } from '../../services/testimonialService';

const SAMPLE_TESTIMONIALS = [
  {
    id: 1,
    clientName: "Rahul Sharma",
    clientRole: "Regular Customer, Pune",
    rating: 5,
    content: "Booking appointments via NeoParlour has completely eliminated weekend queue wait times. Live slot availability is fantastic!",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
    isFeatured: true
  },
  {
    id: 2,
    clientName: "Priya Patel",
    clientRole: "Salon Owner, Biguine",
    rating: 5,
    content: "The staff walk-in tracking and automated inventory features saved our salon over 15 hours a week in manual bookkeeping.",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
    isFeatured: true
  }
];

const AdminTestimonialManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Delete Modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientRole: '',
    content: '',
    avatarUrl: '',
    rating: 5,
    isFeatured: true
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await testimonialService.getAllTestimonials();
      const fetched = res.data?.content || res.data || [];
      if (Array.isArray(fetched) && fetched.length > 0) {
        setTestimonials(fetched);
      } else {
        setTestimonials(SAMPLE_TESTIMONIALS);
      }
    } catch (err) {
      console.warn("Using sample admin testimonials:", err.message);
      setTestimonials(SAMPLE_TESTIMONIALS);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      clientName: '',
      clientRole: 'Verified Customer',
      content: '',
      avatarUrl: '',
      rating: 5,
      isFeatured: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      clientName: item.clientName || '',
      clientRole: item.clientRole || '',
      content: item.content || '',
      avatarUrl: item.avatarUrl || '',
      rating: item.rating || 5,
      isFeatured: item.isFeatured !== undefined ? item.isFeatured : true
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.clientName.trim()) {
      toast.error("Client name is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Testimonial content is required");
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        await testimonialService.updateTestimonial(editingItem.id, formData);
        toast.success("Testimonial updated successfully!");
      } else {
        await testimonialService.createTestimonial(formData);
        toast.success("Testimonial added successfully!");
      }
      setShowModal(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save testimonial");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await testimonialService.deleteTestimonial(deletingId);
      toast.success("Testimonial deleted successfully");
      setShowDeleteModal(false);
      fetchTestimonials();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete testimonial");
    }
  };

  const filteredTestimonials = testimonials.filter(t =>
    t.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.clientRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-[#FF2A14]" /> Admin Testimonial Manager
          </h1>
          <p className="text-xs font-semibold text-slate-400 dark:text-zinc-400 mt-1">
            Create, edit, feature, and manage client reviews displayed on public landing pages.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-[#FF2A14] hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-md shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-2xs">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Search by client name, role, or review quote..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">Loading testimonials...</div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-400">No testimonials found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-zinc-800/50">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Client & Role</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Featured</th>
                  <th className="py-4 px-6">Quote</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs font-semibold">
                {filteredTestimonials.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/40 transition">
                    <td className="py-4 px-6 font-bold text-slate-400">#{item.id}</td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {item.clientName}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">{item.clientRole || 'Customer'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < (item.rating || 5) ? 'fill-amber-400' : 'text-slate-200 dark:text-zinc-700'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full uppercase border border-amber-200 dark:border-amber-800">
                          <Sparkles className="w-3 h-3" /> Featured
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400">Standard</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-zinc-300 max-w-xs truncate">
                      "{item.content}"
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingId(item.id);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-zinc-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {editingItem ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Role / Designation</label>
                  <input
                    type="text"
                    value={formData.clientRole}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientRole: e.target.value }))}
                    placeholder="e.g. Regular Customer, Salon Owner"
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Rating Stars</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  >
                    <option value={5}>5 Stars (★★★★★)</option>
                    <option value={4}>4 Stars (★★★★☆)</option>
                    <option value={3}>3 Stars (★★★☆☆)</option>
                    <option value={2}>2 Stars (★★☆☆☆)</option>
                    <option value={1}>1 Star (★☆☆☆☆)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Avatar Image URL</label>
                  <input
                    type="text"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1">Customer Review Quote *</label>
                <textarea
                  required
                  rows="4"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter review quote..."
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isFeaturedToggle"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="w-4 h-4 accent-[#FF2A14]"
                />
                <label htmlFor="isFeaturedToggle" className="text-xs font-bold text-slate-800 dark:text-zinc-200 cursor-pointer">
                  Feature on Public Landing Page Carousel
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-[#FF2A14] hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 max-w-md w-full rounded-3xl p-6 border border-slate-100 dark:border-zinc-800 shadow-2xl text-center space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-semibold leading-relaxed">
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 rounded-xl font-bold text-xs uppercase cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer"
              >
                Delete Testimonial
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminTestimonialManager;
