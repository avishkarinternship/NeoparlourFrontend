import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Send, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { staffApi } from '../services/staffApi';
import toast from 'react-hot-toast';

export default function StaffLeaveManagement({ staffId, isDarkMode = false }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  useEffect(() => {
    if (staffId) {
      loadLeaveHistory();
    }
  }, [staffId]);

  const loadLeaveHistory = async () => {
    setFetchingHistory(true);
    try {
      const res = await staffApi.getLeaveRequests(staffId);
      setLeaveHistory(res.data?.content || res.data || []);
    } catch (err) {
      console.error('Failed to load leave history:', err);
      toast.error('Could not load leave history.');
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      toast.error('Please fill out all required fields');
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error('End date cannot be earlier than start date');
      return;
    }
    setLoading(true);
    try {
      await staffApi.applyLeave(staffId, startDate, endDate, reason);
      toast.success('Leave application submitted successfully!');
      setStartDate('');
      setEndDate('');
      setReason('');
      loadLeaveHistory();
    } catch (err) {
      toast.error('Error applying for leave: ' + (err.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-2 sm:p-4 max-w-4xl mx-auto space-y-6">
      {/* Apply Leave Form Card */}
      <div className="glass-card p-6 sm:p-8 rounded-[32px] shadow-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--brand-primary,#7C3AED)]" />
          Apply for Leave Request
        </h3>
        <form onSubmit={handleApplyLeave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
              Start Date*
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
              End Date*
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-bold text-slate-900 dark:text-zinc-100 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-1.5">
              Reason for Leave*
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide detailed reason (e.g. Personal leave, Family event, Medical)..."
              className="w-full glass-input rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[var(--brand-primary,#7C3AED)] hover:brightness-110 text-white px-6 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md flex items-center gap-2 cursor-pointer"
              style={{ backgroundColor: 'var(--brand-primary)', color: '#ffffff' }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Leave Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* My Leave Requests Table */}
      <div className="glass-card p-6 sm:p-8 rounded-[32px] shadow-sm">
        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--brand-primary,#7C3AED)]" />
          My Leave Applications & History
        </h3>
        {fetchingHistory ? (
          <div className="py-8 text-center text-slate-500 dark:text-zinc-400 font-bold text-xs">
            <div className="w-8 h-8 border-4 border-[var(--brand-primary,#7C3AED)] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading leave requests...
          </div>
        ) : leaveHistory.length === 0 ? (
          <div className="text-center py-8 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 text-slate-400 dark:text-zinc-500 font-semibold text-xs">
            No leave requests submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/20 dark:border-white/10 bg-slate-100/50 dark:bg-zinc-800/50 text-slate-600 dark:text-zinc-300 font-black uppercase tracking-wider">
                  <th className="p-3.5 rounded-l-xl">Duration</th>
                  <th className="p-3.5">Reason</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl">Applied On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 dark:divide-white/5 font-semibold">
                {leaveHistory.map((leave) => (
                  <tr key={leave.id || Math.random()} className="hover:bg-white/40 dark:hover:bg-white/5 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400 dark:text-zinc-500" />
                      {leave.startDate} to {leave.endDate}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-zinc-300 max-w-xs truncate">{leave.reason}</td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-xl ${getLeaveBadgeColor(leave.status, isDarkMode)}`}>
                        {getLeaveIcon(leave.status)}
                        {leave.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 dark:text-zinc-500">
                      {leave.createdAt ? new Date(leave.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getLeaveBadgeColor(status, isDark) {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return isDark ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80' : 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'REJECTED':
      return isDark ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80' : 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return isDark ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80' : 'bg-amber-50 text-amber-700 border border-amber-200';
  }
}

function getLeaveIcon(status) {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    case 'REJECTED':
      return <XCircle className="w-3.5 h-3.5" />;
    default:
      return <AlertCircle className="w-3.5 h-3.5" />;
  }
}
