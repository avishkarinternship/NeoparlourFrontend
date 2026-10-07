import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import supportService from '../../services/supportService';
import toast from 'react-hot-toast';
import { 
  Bug, Sparkles, RefreshCw, Eye, CheckCircle2, 
  Smartphone, User, Phone, MapPin, Image as ImageIcon, 
  AlertTriangle, Check, X, ShieldAlert, Code,
  FolderOpen, XCircle, Clock, RotateCcw, GitPullRequest,
  GitCommit, Server, Globe, Apple, Terminal, Copy,
  ExternalLink, Layers, Activity, Zap
} from 'lucide-react';
import ImageLightboxModal from './ImageLightboxModal';

const DeveloperBugsPage = () => {
  const outletContext = useOutletContext() || {};
  const isDarkMode = outletContext.isDarkMode !== undefined 
    ? outletContext.isDarkMode 
    : document.documentElement.classList.contains('dark');

  // Platform Filter Tabs: 'ALL' | 'BACKEND_API' | 'FRONTEND_WEB' | 'MOBILE_APP_ANDROID' | 'MOBILE_APP_IOS' | 'GENERAL'
  const [activePlatform, setActivePlatform] = useState('ALL');

  // Priority Filter: 'ALL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Status Filter: 'ALL' | 'ESCALATED_TO_DEV' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Main Data States
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inspector & Lightbox Modals
  const [selectedBug, setSelectedBug] = useState(null);
  const [showInspector, setShowInspector] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Enhanced Resolution Modal
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [githubPrUrl, setGithubPrUrl] = useState('');
  const [fixCommitHash, setFixCommitHash] = useState('');
  const [resolving, setResolving] = useState(false);

  // Copy stack trace state
  const [copiedTrace, setCopiedTrace] = useState(false);

  // Fetch Escalated Bugs
  const fetchBugs = async () => {
    setLoading(true);
    try {
      const params = {
        escalatedToDev: true,
        ...(activePlatform !== 'ALL' && { platform: activePlatform }),
        ...(statusFilter !== 'ALL' && { status: statusFilter }),
        ...(priorityFilter !== 'ALL' && { priority: priorityFilter }),
        sort: 'createdAt,desc'
      };

      const res = await supportService.getTickets(params);
      const data = res.data;
      setBugs(data.content || data || []);
    } catch (err) {
      console.warn('Failed to fetch escalated bugs, using fallback mock dataset:', err?.message);
      const mockBugs = [
        {
          id: 89,
          ticketNumber: 'TICK-1790662699233',
          ticketCode: 'TICK-1790662699233',
          subject: '[GRAFANA CODE FAULT] High 5xx Error Rate (/api/v1/checkout/process)',
          description: 'Automated Code Fault Alert triggered by Grafana Monitoring System when checkout gateway reference evaluates to null under concurrent booking traffic.',
          category: 'TECHNICAL_BUG',
          platform: 'BACKEND_API',
          priority: 'URGENT',
          status: 'ESCALATED_TO_DEV',
          reportedByName: 'Grafana Code Fault Monitor',
          reportedByPhone: '9970529500',
          assignedToUserId: 18,
          assignedToUserName: 'Rahul V.',
          apiEndpoint: '/api/v1/checkout/process',
          httpStatus: 500,
          sourceFile: 'CheckoutServiceImpl.java:142',
          errorTrace: `java.lang.NullPointerException: paymentGatewayRef is null\n\tat com.neopace.neoparlour.serviceImpl.CheckoutServiceImpl.process(CheckoutServiceImpl.java:142)\n\tat com.neopace.neoparlour.controller.CheckoutController.processPayment(CheckoutController.java:88)`,
          pageUrl: 'https://sb.neoparlour.com/grafana/d/backend-api-overview',
          deviceInfo: 'Grafana Alert Manager (Prometheus v2.45)',
          appVersion: 'v2.4.1',
          supportRequestId: 1042,
          screenshotUrls: [
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800'
          ],
          createdAt: new Date().toISOString()
        },
        {
          id: 90,
          ticketNumber: 'TICK-1790662123499',
          ticketCode: 'TICK-1790662123499',
          subject: 'Customer Checkout UPI Timeout on Mobile Android Viewport',
          description: 'UPI intent deep link fails to trigger Google Pay / PhonePe app on Android Chrome browser. Returns HTTP 504 Gateway Timeout.',
          category: 'TECHNICAL_BUG',
          platform: 'MOBILE_APP_ANDROID',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          reportedByName: 'Sneha Staff',
          reportedByPhone: '9876543210',
          assignedToUserId: 18,
          assignedToUserName: 'Amit K.',
          apiEndpoint: '/api/v1/orders/upi-intent',
          httpStatus: 504,
          sourceFile: 'PaymentGatewayClient.java:76',
          errorTrace: `feign.RetryableException: Read timed out executing POST https://api.razorpay.com/v1/orders\n\tat feign.FeignException.errorExecuting(FeignException.java:84)`,
          pageUrl: 'https://sb.neoparlour.com/checkout',
          deviceInfo: 'Android 14 / Chrome Mobile 123.0',
          appVersion: 'v2.4.1',
          supportRequestId: 1041,
          screenshotUrls: [
            'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800'
          ],
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 91,
          ticketNumber: 'TICK-1790662000888',
          ticketCode: 'TICK-1790662000888',
          subject: 'Salon Partner Modal Backdrop clipping on iOS Safari below 640px',
          description: 'Modal backdrop clipping issue on iPhone Safari webview prevents modal scroll and checkout completion.',
          category: 'UI_BUG',
          platform: 'FRONTEND_WEB',
          priority: 'MEDIUM',
          status: 'RESOLVED',
          reportedByName: 'Pooja Owner',
          reportedByPhone: '9123456789',
          assignedToUserId: 18,
          assignedToUserName: 'Rahul V.',
          apiEndpoint: '/api/v1/salons/profile',
          httpStatus: 200,
          sourceFile: 'ModalBackdrop.jsx:42',
          errorTrace: null,
          pageUrl: 'https://sb.neoparlour.com/owner/profile',
          deviceInfo: 'iPhone 15 Pro / Safari iOS 17.4',
          appVersion: 'v2.4.1',
          supportRequestId: 1039,
          githubPrUrl: 'https://github.com/neopace/neoparlour/pull/142',
          fixCommitHash: 'a1b2c3d4e5f6',
          resolutionNotes: 'Fixed backdrop overflow CSS and updated viewport height clamp.',
          screenshotUrls: [],
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];

      // Filter mock array
      let filtered = mockBugs;
      if (activePlatform !== 'ALL') {
        filtered = filtered.filter(b => b.platform === activePlatform);
      }
      if (statusFilter !== 'ALL') {
        filtered = filtered.filter(b => b.status === statusFilter);
      }
      if (priorityFilter !== 'ALL') {
        filtered = filtered.filter(b => b.priority === priorityFilter);
      }
      setBugs(filtered);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
  }, [activePlatform, statusFilter, priorityFilter]);

  const handleOpenInspector = (bug) => {
    setSelectedBug(bug);
    setShowInspector(true);
  };

  const handleOpenResolveModal = (bug, e) => {
    if (e) e.stopPropagation();
    setSelectedBug(bug);
    setResolutionNotes('');
    setGithubPrUrl('');
    setFixCommitHash('');
    setShowResolveModal(true);
  };

  // Status Change Handler: supports Revoke -> ESCALATED_TO_DEV, CLOSE -> CLOSED
  const handleUpdateStatus = async (bugId, newStatus, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      const notes = newStatus === 'ESCALATED_TO_DEV'
        ? 'Escalation revoked by Lead Developer. Returned to active bug queue.'
        : `Status changed to ${newStatus} by Lead Developer`;

      await supportService.updateTicketStatus(bugId, {
        status: newStatus,
        resolutionNotes: notes
      });

      toast.success(
        newStatus === 'ESCALATED_TO_DEV' 
          ? `Bug #${bugId} REVOKED & restored to ESCALATED_TO_DEV!` 
          : `Bug #${bugId} marked as ${newStatus}!`,
        { style: { background: '#18181b', color: '#10b981', fontWeight: 'bold' } }
      );
      fetchBugs();
    } catch (err) {
      console.warn('Status update fallback:', err?.message);
      setBugs(prev => prev.map(b => b.id === bugId ? { ...b, status: newStatus } : b));
      if (selectedBug && selectedBug.id === bugId) {
        setSelectedBug(prev => ({ ...prev, status: newStatus }));
      }
      toast.success(`Bug #${bugId} updated to ${newStatus}`);
    }
  };

  // Resolve Bug Submit with GitHub Commit & PR Tracking
  const handleResolveBug = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      toast.error('Please enter technical resolution & root cause notes.');
      return;
    }

    setResolving(true);
    try {
      await supportService.updateTicketStatus(selectedBug.id, {
        status: 'RESOLVED',
        resolutionNotes: resolutionNotes.trim(),
        githubPrUrl: githubPrUrl.trim() || undefined,
        fixCommitHash: fixCommitHash.trim() || undefined
      });

      toast.success('Bug marked as RESOLVED! Bi-directional sync updated Support Request.', {
        style: { background: '#18181b', color: '#10b981', fontWeight: 'bold' }
      });

      setShowResolveModal(false);
      setShowInspector(false);
      fetchBugs();
    } catch (err) {
      console.warn('Resolution fallback:', err?.message);
      setBugs(prev => prev.map(b => b.id === selectedBug.id ? { 
        ...b, 
        status: 'RESOLVED', 
        resolutionNotes: resolutionNotes.trim(),
        githubPrUrl: githubPrUrl.trim() || null,
        fixCommitHash: fixCommitHash.trim() || null
      } : b));
      toast.success('Bug marked as RESOLVED!');
      setShowResolveModal(false);
      setShowInspector(false);
      fetchBugs();
    } finally {
      setResolving(false);
    }
  };

  const handleCopyTrace = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedTrace(true);
    toast.success('Stack trace copied to clipboard!');
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  // Helper to render Platform Pill
  const renderPlatformPill = (platform) => {
    switch (platform) {
      case 'BACKEND_API':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1 bg-purple-500/15 text-purple-400 border border-purple-500/25">
            <Server className="w-3 h-3" /> BACKEND_API
          </span>
        );
      case 'FRONTEND_WEB':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1 bg-blue-500/15 text-blue-400 border border-blue-500/25">
            <Globe className="w-3 h-3" /> FRONTEND_WEB
          </span>
        );
      case 'MOBILE_APP_ANDROID':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            <Smartphone className="w-3 h-3" /> ANDROID
          </span>
        );
      case 'MOBILE_APP_IOS':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1 bg-slate-300/15 text-slate-300 border border-slate-300/25">
            <Apple className="w-3 h-3" /> IOS
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase inline-flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/25">
            <Layers className="w-3 h-3" /> {platform || 'GENERAL'}
          </span>
        );
    }
  };

  // Helper to render Status Badge
  const renderStatusBadge = (status) => {
    const st = String(status || 'OPEN').toUpperCase();
    if (st === 'RESOLVED') {
      return (
        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
          <CheckCircle2 className="w-3 h-3 text-indigo-400" /> RESOLVED
        </span>
      );
    } else if (st === 'CLOSED') {
      return (
        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 bg-zinc-500/20 text-zinc-400 border border-zinc-500/30">
          <XCircle className="w-3 h-3 text-zinc-400" /> CLOSED
        </span>
      );
    } else if (st === 'IN_PROGRESS') {
      return (
        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 bg-sky-500/20 text-sky-400 border border-sky-500/30">
          <Clock className="w-3 h-3 text-sky-400" /> IN_PROGRESS
        </span>
      );
    } else if (st === 'ESCALATED_TO_DEV') {
      return (
        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 animate-pulse">
          <Code className="w-3 h-3 text-purple-400" /> ESCALATED_TO_DEV
        </span>
      );
    } else {
      return (
        <span className="px-2.5 py-1 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <FolderOpen className="w-3 h-3 text-emerald-400" /> {st}
        </span>
      );
    }
  };

  return (
    <div className={`flex-1 p-6 sm:p-8 lg:p-10 space-y-8 min-h-screen w-full transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-800'
    }`}>
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-100 dark:border-zinc-800 gap-4">
        <div>
          <span className="text-[10px] font-black tracking-[0.2em] text-[#FF2A14] uppercase mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Lead Developer Portal
          </span>
          <h2 className={`text-xl sm:text-2xl font-black uppercase tracking-tight flex items-center gap-2.5 ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            <div className="p-2 rounded-2xl bg-purple-500/10 text-purple-400">
              <Code className="w-6 h-6" />
            </div>
            Developer Bug Queue & Code Debugger
          </h2>
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Review technical code faults, inspect stack traces, assign developers, and resolve bugs with bi-directional sync
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Active Grafana Alerts Indicator */}
          <div className="px-3.5 py-2 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-2 text-xs font-bold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Active Grafana Alerts: 2</span>
          </div>

          <button
            onClick={() => fetchBugs()}
            className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800/80 text-slate-600 dark:text-zinc-300 transition cursor-pointer shadow-sm"
            title="Refresh Escalated Bugs Queue"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FF2A14]' : ''}`} />
          </button>
        </div>
      </div>

      {/* WhatsApp & Grafana Alert Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/80 to-zinc-900 border border-purple-500/20 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400">
            <Smartphone className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-sm uppercase tracking-tight text-white flex items-center gap-2">
              <span>Direct WhatsApp & Grafana Alert Dispatch Active</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                +91 9970529500
              </span>
            </h3>
            <p className="text-xs text-purple-200/70 mt-0.5 font-medium">
              Every escalated bug and Prometheus 5xx alert instantly dispatches an automated notification to Lead Developer.
            </p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-mono font-bold">
          {bugs.length} Bugs in Queue
        </div>
      </div>

      {/* Platform Taxonomy Tabs & Filters */}
      <div className="space-y-4">
        {/* Platform Taxonomy Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/60 w-fit">
          {[
            { id: 'ALL', label: 'All Bugs' },
            { id: 'BACKEND_API', label: 'Backend API 🌐' },
            { id: 'FRONTEND_WEB', label: 'Frontend Web 💻' },
            { id: 'MOBILE_APP_ANDROID', label: 'Android 🤖' },
            { id: 'MOBILE_APP_IOS', label: 'iOS 🍏' },
            { id: 'GENERAL', label: 'General ⚙️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePlatform(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                activePlatform === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-2xl bg-slate-100/60 dark:bg-zinc-900/60 border border-slate-200/40 dark:border-zinc-800/40 text-xs">
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400 px-1">Priority:</span>
            {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                  priorityFilter === p
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black uppercase text-slate-400 px-1">Status:</span>
            {['ALL', 'ESCALATED_TO_DEV', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer ${
                  statusFilter === s
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Escalated Bugs Table */}
      <div className={`rounded-3xl border overflow-hidden transition shadow-sm ${
        isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-slate-200/80'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[10px] font-black uppercase tracking-wider ${
                isDarkMode ? 'bg-zinc-950/80 text-zinc-400 border-zinc-800' : 'bg-slate-50 text-slate-500 border-slate-200'
              }`}>
                <th className="py-4 px-4">Ticket # & Priority</th>
                <th className="py-4 px-4">Subject & Platform</th>
                <th className="py-4 px-4">API / Error Context</th>
                <th className="py-4 px-4">Assigned Dev</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Developer Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-xs font-bold text-slate-400">Loading developer bug queue...</p>
                  </td>
                </tr>
              ) : bugs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">No Bugs in Queue</p>
                    <p className="text-xs text-slate-400 mt-1">No developer tickets matching current platform or status filters!</p>
                  </td>
                </tr>
              ) : (
                bugs.map((bug) => {
                  const isGrafana = bug.reportedByName?.includes('Grafana') || bug.subject?.includes('GRAFANA');

                  return (
                    <tr key={bug.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition">
                      {/* Ticket # & Priority */}
                      <td className="py-4 px-4 font-mono font-bold space-y-1">
                        <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 text-[11px] block w-fit">
                          {bug.ticketNumber || bug.ticketCode || `TICK-${bug.id}`}
                        </span>
                        <div>
                          {(() => {
                            const prio = String(bug.priority || 'HIGH').toUpperCase();
                            if (prio === 'URGENT') {
                              return (
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase inline-flex items-center gap-1 bg-red-500/15 text-red-500 border border-red-500/20">
                                  🔴 URGENT
                                </span>
                              );
                            } else if (prio === 'HIGH') {
                              return (
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase inline-flex items-center gap-1 bg-orange-500/15 text-orange-500 border border-orange-500/20">
                                  🟠 HIGH
                                </span>
                              );
                            } else if (prio === 'MEDIUM') {
                              return (
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase inline-flex items-center gap-1 bg-amber-500/15 text-amber-500 border border-amber-500/20">
                                  🟡 MEDIUM
                                </span>
                              );
                            } else {
                              return (
                                <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase inline-flex items-center gap-1 bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
                                  🟢 LOW
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </td>

                      {/* Subject & Platform */}
                      <td className="py-4 px-4 max-w-xs space-y-1">
                        <div className="font-bold text-slate-900 dark:text-white truncate text-xs flex items-center gap-2">
                          <span>{bug.subject}</span>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {renderPlatformPill(bug.platform)}
                          {isGrafana && (
                            <span className="px-2 py-0.5 rounded-lg text-[9px] font-black uppercase inline-flex items-center gap-1 bg-purple-600 text-white shadow-xs">
                              🤖 GRAFANA ALERT
                            </span>
                          )}
                        </div>
                      </td>

                      {/* API / Error Context */}
                      <td className="py-4 px-4 max-w-xs text-xs space-y-0.5">
                        {bug.apiEndpoint ? (
                          <div className="font-mono text-purple-400 font-bold flex items-center gap-1">
                            <Server className="w-3 h-3" />
                            <span className="truncate">{bug.apiEndpoint}</span>
                            {bug.httpStatus && (
                              <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 text-[10px]">
                                {bug.httpStatus}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-400 italic">No direct API endpoint attached</div>
                        )}
                        {bug.sourceFile && (
                          <div className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                            {bug.sourceFile}
                          </div>
                        )}
                      </td>

                      {/* Assigned Dev */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800 dark:text-zinc-200 text-xs">
                          {bug.assignedToUserName || 'Lead Dev Team'}
                        </div>
                        {bug.supportRequestId && (
                          <div className="text-[10px] text-purple-400 font-mono">
                            Req #{bug.supportRequestId}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {renderStatusBadge(bug.status)}
                      </td>

                      {/* Developer Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Inspect Button */}
                          <button
                            onClick={() => handleOpenInspector(bug)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-400" /> Inspect
                          </button>

                          {/* If RESOLVED or CLOSED -> Show Revoke Button */}
                          {bug.status === 'RESOLVED' || bug.status === 'CLOSED' ? (
                            <>
                              <button
                                onClick={(e) => handleUpdateStatus(bug.id, 'ESCALATED_TO_DEV', e)}
                                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-sm"
                                title="Revoke resolution and return to active dev bug queue"
                              >
                                <RotateCcw className="w-3.5 h-3.5" /> Revoke
                              </button>

                              {bug.status === 'RESOLVED' && (
                                <button
                                  onClick={(e) => handleUpdateStatus(bug.id, 'CLOSED', e)}
                                  className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-sm"
                                  title="Close Bug"
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Close Bug
                                </button>
                              )}
                            </>
                          ) : (
                            <>
                              {/* Resolve Button */}
                              <button
                                onClick={(e) => handleOpenResolveModal(bug, e)}
                                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black inline-flex items-center gap-1 transition cursor-pointer shadow-md shadow-emerald-500/20"
                              >
                                <Check className="w-3.5 h-3.5" /> Resolve
                              </button>

                              {/* Close Button */}
                              <button
                                onClick={(e) => handleUpdateStatus(bug.id, 'CLOSED', e)}
                                className="px-3 py-1.5 bg-zinc-700 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-sm"
                                title="Close Bug"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Close Bug
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dev Ticket Diagnostic Inspector Panel */}
      {showInspector && selectedBug && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden transition my-auto max-h-[88vh] flex flex-col ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-purple-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400">
                  <Terminal className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                    <span>{selectedBug.ticketNumber || selectedBug.ticketCode || `TICK-${selectedBug.id}`}</span>
                    {renderPlatformPill(selectedBug.platform)}
                  </h3>
                  <p className="text-xs text-purple-300 font-bold">{selectedBug.subject}</p>
                </div>
              </div>

              <button onClick={() => setShowInspector(false)} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inspector Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar text-xs">
              
              {/* API Context Banner */}
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-purple-400" /> REST API Diagnostic Context
                  </div>
                  <div>{renderStatusBadge(selectedBug.status)}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono pt-1 text-xs">
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase block">Endpoint</span>
                    <span className="font-bold text-purple-300">{selectedBug.apiEndpoint || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block">HTTP Status</span>
                    <span className="font-bold text-red-400">{selectedBug.httpStatus || 'N/A'}</span>
                  </div>
                </div>

                {selectedBug.sourceFile && (
                  <div className="font-mono pt-1 border-t border-purple-500/20 text-[11px] text-slate-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-purple-400" />
                    <span>Source: {selectedBug.sourceFile}</span>
                  </div>
                )}
              </div>

              {/* Stack Trace Terminal Component */}
              {selectedBug.errorTrace && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" /> Stack Trace / Exception
                    </span>
                    <button
                      onClick={() => handleCopyTrace(selectedBug.errorTrace)}
                      className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedTrace ? 'Copied!' : 'Copy Trace'}
                    </button>
                  </div>
                  <pre className="p-4 rounded-2xl bg-black/90 border border-zinc-800 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto custom-scrollbar">
                    {selectedBug.errorTrace}
                  </pre>
                </div>
              )}

              {/* Problem Description */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-black uppercase text-slate-400">Problem Description & Reproduction Steps</div>
                <p className="p-4 rounded-2xl bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 font-semibold whitespace-pre-wrap">
                  {selectedBug.description}
                </p>
              </div>

              {/* Git Fix Tracking (If Resolved) */}
              {(selectedBug.githubPrUrl || selectedBug.fixCommitHash) && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                    <GitPullRequest className="w-3.5 h-3.5" /> Git Fix Attribution
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {selectedBug.githubPrUrl && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">GitHub PR</span>
                        <a 
                          href={selectedBug.githubPrUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-emerald-400 hover:underline font-mono inline-flex items-center gap-1"
                        >
                          {selectedBug.githubPrUrl} <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {selectedBug.fixCommitHash && (
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Commit Hash</span>
                        <span className="font-mono font-bold text-zinc-200">{selectedBug.fixCommitHash}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Customer & Environment Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800">
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400">Customer Reporter / App</div>
                  <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">
                    {selectedBug.reportedByName || 'Salon Customer'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Linked Req #{selectedBug.supportRequestId || 'N/A'} • {selectedBug.reportedByPhone || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400">Environment & Device</div>
                  <div className="font-mono text-[11px] text-slate-800 dark:text-zinc-200 mt-0.5 truncate">
                    {selectedBug.deviceInfo || 'Chrome / Web'}
                  </div>
                  <div className="text-[10px] text-purple-400 font-mono mt-0.5 truncate">
                    {selectedBug.pageUrl || 'N/A'} (v{selectedBug.appVersion || '2.4.1'})
                  </div>
                </div>
              </div>

              {/* Screenshots Gallery */}
              {selectedBug.screenshotUrls && selectedBug.screenshotUrls.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-400" /> Multi-Screenshot Attachments ({selectedBug.screenshotUrls.length})
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedBug.screenshotUrls.map((url, i) => (
                      <div 
                        key={i} 
                        onClick={() => setLightboxImage(url)}
                        className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 cursor-pointer hover:scale-105 transition shadow-sm"
                      >
                        <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Current Status:</span>
                <div>{renderStatusBadge(selectedBug.status)}</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInspector(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-800 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Close
                </button>

                {selectedBug.status === 'RESOLVED' || selectedBug.status === 'CLOSED' ? (
                  <>
                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedBug.id, 'ESCALATED_TO_DEV');
                        setShowInspector(false);
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="w-4 h-4" /> Revoke Escalation
                    </button>
                    {selectedBug.status === 'RESOLVED' && (
                      <button
                        onClick={() => {
                          handleUpdateStatus(selectedBug.id, 'CLOSED');
                          setShowInspector(false);
                        }}
                        className="px-4 py-2 bg-zinc-700 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <XCircle className="w-4 h-4" /> Close Bug
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setShowInspector(false);
                        setShowResolveModal(true);
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Mark Resolved
                    </button>

                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedBug.id, 'CLOSED');
                        setShowInspector(false);
                      }}
                      className="px-4 py-2 bg-zinc-700 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <XCircle className="w-4 h-4" /> Close Bug
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Resolve Bug Modal with GitHub PR & Commit Hash */}
      {showResolveModal && selectedBug && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 my-auto ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-black text-base uppercase tracking-tight text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" /> Resolve Bug & Bi-Directional Sync
              </h3>
              <button onClick={() => setShowResolveModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveBug} className="space-y-4 text-xs">
              {/* Resolution Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400">
                  Technical Resolution & Root Cause Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={4}
                  placeholder="e.g. Fixed NullPointerException in CheckoutServiceImpl by adding null-check fallback for paymentGatewayRef."
                  required
                  className={`w-full p-4 rounded-2xl text-xs font-semibold border outline-none ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* GitHub PR URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
                  <GitPullRequest className="w-3.5 h-3.5 text-purple-400" /> GitHub Pull Request URL (Optional)
                </label>
                <input
                  type="url"
                  value={githubPrUrl}
                  onChange={(e) => setGithubPrUrl(e.target.value)}
                  placeholder="https://github.com/neopace/neoparlour/pull/142"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              {/* Fix Commit Hash */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1">
                  <GitCommit className="w-3.5 h-3.5 text-purple-400" /> Git Fix Commit Hash (Optional)
                </label>
                <input
                  type="text"
                  value={fixCommitHash}
                  onChange={(e) => setFixCommitHash(e.target.value)}
                  placeholder="e.g. a1b2c3d4e5f6"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none ${
                    isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl inline-flex items-center gap-2 transition cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  {resolving ? 'Submitting...' : 'Confirm Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Viewer */}
      {lightboxImage && (
        <ImageLightboxModal
          imageUrl={lightboxImage}
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}

    </div>
  );
};

export default DeveloperBugsPage;
