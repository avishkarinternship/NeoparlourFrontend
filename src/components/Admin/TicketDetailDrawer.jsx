import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, User, Phone, MapPin, Calendar, Clock, AlertTriangle, Send, 
  CheckCircle2, AlertCircle, MessageSquare, StickyNote, Lock, ExternalLink,
  Smartphone, Tag, ArrowUpRight
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../services/supportService';
import ImageLightboxModal from './ImageLightboxModal';

const TicketDetailDrawer = ({ ticket, isOpen, onClose, onRefresh, isDarkMode = false }) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(ticket?.status || 'OPEN');
  const [newComment, setNewComment] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [showLightbox, setShowLightbox] = useState(false);

  if (!isOpen || !ticket) return null;

  // Comment submit
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoadingAction(true);
    try {
      await axiosInstance.post(`/tickets/${ticket.id}/comments`, {
        comment: newComment.trim(),
        internalNote: isInternalNote
      });
      toast.success(isInternalNote ? 'Internal note added!' : 'Reply sent to customer!');
      setNewComment('');
      setIsInternalNote(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to add comment:', err);
      toast.error(err.response?.data?.message || 'Failed to submit comment.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Status & Resolution update
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if ((selectedStatus === 'RESOLVED' || selectedStatus === 'CLOSED') && !resolutionNotes.trim()) {
      toast.error('Please enter compulsory resolution notes before closing ticket');
      return;
    }

    setLoadingAction(true);
    try {
      await axiosInstance.put(`/tickets/${ticket.id}/status`, {
        status: selectedStatus,
        resolutionNotes: resolutionNotes.trim()
      });
      toast.success(`Ticket marked as ${selectedStatus}`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.response?.data?.message || 'Failed to update ticket status.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Escalate to Lead Dev
  const handleEscalateToDev = async () => {
    if (!escalationReason.trim()) {
      toast.error('Please specify escalation reason for the Lead Developer');
      return;
    }

    setLoadingAction(true);
    try {
      await axiosInstance.post(`/tickets/${ticket.id}/escalate`, {
        reason: escalationReason.trim(),
        devPhone: '9970529500'
      });
      toast.success('Ticket escalated to Lead Dev! Instant WhatsApp alert dis-patched to 9970529500.');
      setShowEscalateModal(false);
      setEscalationReason('');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      console.error('Failed to escalate ticket:', err);
      toast.error(err.response?.data?.message || 'Failed to escalate ticket to Lead Dev.');
    } finally {
      setLoadingAction(false);
    }
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
        <div className={`w-full max-w-2xl h-full shadow-2xl flex flex-col transition-colors overflow-hidden ${
          isDarkMode ? 'bg-zinc-950 text-white' : 'bg-white text-slate-900'
        }`}>
          
          {/* Header */}
          <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#FF0B01]/10 text-[#FF0B01] border border-red-500/20">
                  {ticket.ticketCode || `TICK-${ticket.id}`}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                  ticket.priority === 'URGENT' || ticket.priority === 'HIGH'
                    ? 'bg-red-500/20 text-red-500'
                    : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {ticket.priority || 'MEDIUM'}
                </span>
                {ticket.escalatedToDev && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1">
                    <Smartphone className="w-3 h-3" /> Escalated to Dev
                  </span>
                )}
              </div>
              <h2 className="text-base font-black uppercase tracking-tight">{ticket.subject || ticket.category || 'Support Ticket Details'}</h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

            {/* Reported By Card */}
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#FF0B01]" /> Reporter Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">User Name</span>
                  <span className="font-bold">{ticket.userName || ticket.name || 'Anonymous User'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Mobile</span>
                  <span className="font-bold">{ticket.userPhone || ticket.mobile || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Salon / Context</span>
                  <span className="font-bold">{ticket.salonName || 'General Platform Inquiry'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-semibold">Assigned Engineer</span>
                  <span className="font-bold text-[#FF0B01]">{ticket.assignedEngineerName || 'Support Staff'}</span>
                </div>
              </div>

              {/* Problem Description */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800">
                <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Issue Description</span>
                <p className="text-xs font-semibold text-slate-700 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-950 p-3 rounded-xl border border-slate-200 dark:border-zinc-800 whitespace-pre-wrap">
                  {ticket.description || ticket.message || 'No description provided.'}
                </p>
              </div>

              {/* Screenshot Attachment */}
              {(ticket.screenshotUrl || ticket.attachmentUrl) && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-zinc-800">
                  <span className="text-[10px] font-black uppercase text-slate-400 block mb-2">Screenshot Attachment</span>
                  <div 
                    onClick={() => setShowLightbox(true)}
                    className="relative group cursor-pointer w-48 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm"
                  >
                    <img 
                      src={getImageUrl(ticket.screenshotUrl || ticket.attachmentUrl)} 
                      alt="Ticket Screenshot" 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
                      <ArrowUpRight className="w-4 h-4" /> Inspect Image
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Conversation & Internal Notes Thread */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-blue-500" /> Conversation & Activity Log</span>
                <span className="text-[10px] text-zinc-400 font-semibold">{ticket.comments?.length || 0} Entries</span>
              </h4>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {(ticket.comments || []).length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-semibold italic bg-slate-50/50 dark:bg-zinc-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
                    No comments or internal notes added yet.
                  </div>
                ) : (
                  ticket.comments.map((cmt, idx) => (
                    <div
                      key={cmt.id || idx}
                      className={`p-3.5 rounded-2xl text-xs space-y-1.5 border transition ${
                        cmt.internalNote
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
                          : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="flex items-center gap-1">
                          {cmt.internalNote ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black uppercase text-[9px] flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Internal Staff Note
                            </span>
                          ) : (
                            <span className="text-blue-500 font-extrabold uppercase">Customer / Public Reply</span>
                          )}
                          <span className="text-slate-400">by {cmt.authorName || 'Staff'}</span>
                        </span>
                        <span className="text-slate-400 font-mono">{cmt.createdAt ? new Date(cmt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{cmt.text || cmt.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment Input Form */}
              <form onSubmit={handleAddComment} className="pt-2 space-y-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={isInternalNote ? "Type internal staff note (visible only to support team & admin)..." : "Type reply to customer..."}
                  rows="2"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none transition resize-none ${
                    isDarkMode 
                      ? 'bg-zinc-900 border-zinc-800 text-white focus:border-[#FF0B01]' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#FF0B01]'
                  }`}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded text-[#FF0B01] focus:ring-[#FF0B01]"
                    />
                    <span className={isInternalNote ? 'text-amber-500 font-black' : ''}>Mark as Internal Note</span>
                  </label>

                  <button
                    type="submit"
                    disabled={loadingAction || !newComment.trim()}
                    className="px-4 py-2 bg-slate-900 dark:bg-zinc-800 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isInternalNote ? 'Save Note' : 'Send Reply'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Resolution Control & Status Update */}
            <div className={`p-4 rounded-2xl border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resolution & Ticket Status
              </h4>

              <form onSubmit={handleUpdateStatus} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Update Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="PENDING_CLIENT">PENDING_CLIENT</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">Escalate Option</label>
                    <button
                      type="button"
                      onClick={() => setShowEscalateModal(true)}
                      className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-extrabold text-xs rounded-xl border border-red-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-[#FF0B01]" /> Escalate to Lead Dev
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    Compulsory Resolution Notes <span className="text-[#FF0B01]">*</span>
                  </label>
                  <textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter summary fix explanation before resolving..."
                    rows="2"
                    className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border outline-none transition resize-none ${
                      isDarkMode 
                        ? 'bg-zinc-950 border-zinc-800 text-white focus:border-[#FF0B01]' 
                        : 'bg-white border-slate-200 text-slate-900 focus:border-[#FF0B01]'
                    }`}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loadingAction}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save Resolution State
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Escalate to Dev Prompt Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-black uppercase tracking-tight flex items-center gap-2 text-red-500">
                <AlertTriangle className="w-5 h-5" /> Escalate Bug to Lead Dev
              </h3>
              <button onClick={() => setShowEscalateModal(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              This will assign ticket <strong className="text-white font-mono">{ticket.ticketCode || `TICK-${ticket.id}`}</strong> to the Lead Developer and send an instant WhatsApp alert to <strong className="text-[#FF0B01]">9970529500</strong>.
            </p>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 block mb-1">Escalation Reason / Technical Notes <span className="text-red-500">*</span></label>
              <textarea
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="Describe bug details, error code, or logs for the developer..."
                rows="3"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border outline-none transition resize-none ${
                  isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEscalateToDev}
                disabled={loadingAction || !escalationReason.trim()}
                className="px-5 py-2.5 bg-[#FF0B01] hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" /> Send WhatsApp & Escalate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={showLightbox}
        imageUrl={ticket.screenshotUrl || ticket.attachmentUrl}
        title={`Screenshot - ${ticket.ticketCode || `TICK-${ticket.id}`}`}
        onClose={() => setShowLightbox(false)}
      />
    </>,
    document.body
  );
};

export default TicketDetailDrawer;
