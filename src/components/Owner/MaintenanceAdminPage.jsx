import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Wrench, ShieldAlert, CheckCircle2, Clock, UserCheck, RefreshCw, AlertTriangle } from 'lucide-react';

export const MaintenanceAdminPage = () => {
  const [status, setStatus] = useState(null);
  const [message, setMessage] = useState('');
  const [durationMins, setDurationMins] = useState(30);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchStatus = async () => {
    setFetching(true);
    try {
      let res = null;
      try {
        res = await axiosInstance.get('/v1/maintenance/status');
      } catch (e) {
        res = await axios.get('https://uat.neoparlour.com/api/v1/maintenance/status');
      }
      setStatus(res.data);
      if (res.data?.message) {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error('Failed to fetch maintenance status', err);
      toast.error('Failed to fetch current maintenance status');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleEnable = async () => {
    setLoading(true);
    try {
      let res = null;
      try {
        res = await axiosInstance.post('/v1/maintenance/enable', {
          message: message || "We are currently performing scheduled backend maintenance...",
          estimatedEndTimeMinutes: durationMins,
        });
      } catch (err) {
        const token = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');
        res = await axios.post(
          'https://uat.neoparlour.com/api/v1/maintenance/enable',
          { message: message || "We are currently performing scheduled backend maintenance...", estimatedEndTimeMinutes: durationMins },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setStatus(res.data);
      toast.success('🔴 Maintenance Mode ENABLED successfully!');
    } catch (err) {
      console.error("Failed to enable maintenance:", err);
      toast.error(err.response?.data?.message || 'Failed to enable maintenance mode. Ensure ADMIN privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      let res = null;
      try {
        res = await axiosInstance.post('/v1/maintenance/disable', {});
      } catch (err) {
        const token = localStorage.getItem('ownerStaffToken') || localStorage.getItem('user_token');
        res = await axios.post(
          'https://uat.neoparlour.com/api/v1/maintenance/disable',
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setStatus(res.data);
      toast.success('🟢 Maintenance Mode DISABLED! Live access restored.');
    } catch (err) {
      console.error("Failed to disable maintenance:", err);
      toast.error(err.response?.data?.message || 'Failed to disable maintenance mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 dark:border-zinc-800 gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-red-600 uppercase mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> System Admin Control
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-zinc-100 tracking-tight uppercase flex items-center gap-2">
            <Wrench className="w-7 h-7 text-red-600" />
            System Maintenance Controls
          </h1>
          <p className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mt-1">
            Control backend maintenance state and user notification banners during server upgrades
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStatus}
            disabled={fetching}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${fetching ? 'animate-spin' : ''}`} />
          </button>
          
          <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 border ${
            status?.enabled 
              ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/50' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/50'
          }`}>
            <span className={`w-2 h-2 rounded-full ${status?.enabled ? 'bg-red-600 animate-ping' : 'bg-emerald-500'}`} />
            {status?.enabled ? '🔴 Maintenance Active' : '🟢 System Operational'}
          </div>
        </div>
      </div>

      {/* Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Toggle & Announcement Form */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Configure Maintenance Mode
            </h2>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Admin Privileges Required</span>
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
              Announcement Message for Users
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="We are currently performing scheduled backend maintenance..."
              className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-3.5 text-xs font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-red-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-zinc-400 mb-2">
              Estimated Duration
            </label>
            <select
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-2xl p-3.5 text-xs font-semibold text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-red-600 transition-colors cursor-pointer"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={60}>1 Hour</option>
              <option value={120}>2 Hours</option>
              <option value={240}>4 Hours</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleEnable}
              disabled={loading || status?.enabled}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-red-600/20"
            >
              {loading ? "Processing..." : "Enable Maintenance"}
            </button>
            <button
              onClick={handleDisable}
              disabled={loading || !status?.enabled}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-2xl transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-emerald-600/20"
            >
              {loading ? "Processing..." : "Disable Maintenance"}
            </button>
          </div>
        </div>

        {/* Live Status Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-4 mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Live System State
              </h2>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Real-Time Sync</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-zinc-800">
                <span className="text-gray-500 dark:text-zinc-400 font-medium">Current Status</span>
                <span className={`font-black uppercase tracking-wider ${status?.enabled ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {status?.enabled ? 'IN MAINTENANCE' : 'OPERATIONAL'}
                </span>
              </div>

              <div className="flex justify-between items-start py-2.5 border-b border-gray-100 dark:border-zinc-800 gap-4">
                <span className="text-gray-500 dark:text-zinc-400 font-medium">Message Banner</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400 text-right max-w-[220px] break-words">
                  {status?.message || 'Default System Operational Message'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-zinc-800">
                <span className="text-gray-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Estimated Completion
                </span>
                <span className="text-gray-900 dark:text-zinc-200 font-bold">
                  {status?.estimatedEndTime ? new Date(status.estimatedEndTime).toLocaleString() : 'Not Specified'}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5">
                <span className="text-gray-500 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-gray-400" /> Last Modified By
                </span>
                <span className="text-gray-900 dark:text-zinc-200 font-mono text-xs font-bold">
                  {status?.updatedBy || 'SYSTEM'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 dark:bg-zinc-800/60 rounded-2xl text-[11px] text-gray-500 dark:text-zinc-400 border border-gray-100 dark:border-zinc-700/60 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Enabling maintenance mode blocks client web requests and displays full-screen overlay for non-admin users.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceAdminPage;
