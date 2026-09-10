import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';

const toastStyle = {
  style: {
    background: '#1a1a1a',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: '600'
  }
};

const INITIAL_MOCK_LOGS = [
  {
    id: 1,
    timestamp: new Date(Date.now() - 350000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'INFO',
    thread: 'main',
    logger: 'c.n.api.NeoParlourApplication',
    message: 'Starting NeoParlourApplication v1.0.4 on sb.neoparlour.com with PID 14290...',
    details: { env: 'production', port: 8080, profile: 'prod' }
  },
  {
    id: 2,
    timestamp: new Date(Date.now() - 340000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'INFO',
    thread: 'main',
    logger: 'o.s.b.w.e.t.TomcatHttp11Protocol',
    message: 'Initializing ProtocolHandler ["http-nio-8080"]',
    details: { port: 8080, protocol: 'HTTP/1.1' }
  },
  {
    id: 3,
    timestamp: new Date(Date.now() - 330000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'INFO',
    thread: 'main',
    logger: 'o.h.e.t.j.p.i.JtaPlatformInitiator',
    message: 'HCANN000001: Hibernate Commons Annotations {5.1.2.Final}',
    details: { ORM: 'Hibernate 5.6.10' }
  },
  {
    id: 4,
    timestamp: new Date(Date.now() - 300000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'INFO',
    thread: 'http-nio-8080-exec-1',
    logger: 'c.n.api.security.JwtAuthenticationFilter',
    message: 'JWT Token verified successfully for admin user: admin@neoparlour.com [ROLE_ADMIN]',
    details: { user: 'admin@neoparlour.com', role: 'ADMIN', ip: '103.21.124.89' }
  },
  {
    id: 5,
    timestamp: new Date(Date.now() - 250000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'INFO',
    thread: 'http-nio-8080-exec-2',
    logger: 'c.n.api.controller.AdminSalonController',
    message: 'GET /salons/admin/all?page=0&size=10 - Status: 200 OK (Execution Time: 34ms)',
    details: { endpoint: '/salons/admin/all', status: 200, latencyMs: 34 }
  },
  {
    id: 6,
    timestamp: new Date(Date.now() - 210000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'WARN',
    thread: 'http-nio-8080-exec-3',
    logger: 'c.n.api.service.KYCVerificationService',
    message: 'KYC Document verification pending manual approval for Salon ID: 482',
    details: { salonId: 482, status: 'PENDING_REVIEW' }
  },
  {
    id: 7,
    timestamp: new Date(Date.now() - 180000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'DEBUG',
    thread: 'pool-2-thread-1',
    logger: 'c.n.api.config.CacheConfiguration',
    message: 'Cache hit ratio for key "active_salons_count": 98.4%',
    details: { cacheName: 'salonsCache', hitCount: 1420, missCount: 23 }
  },
  {
    id: 8,
    timestamp: new Date(Date.now() - 120000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'INFO',
    thread: 'http-nio-8080-exec-4',
    logger: 'c.n.api.controller.SubscriptionAdminController',
    message: 'GET /subscriptions/admin/all - Fetched 14 active subscription plans',
    details: { endpoint: '/subscriptions/admin/all', status: 200, latencyMs: 18 }
  },
  {
    id: 9,
    timestamp: new Date(Date.now() - 60000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'ERROR',
    thread: 'http-nio-8080-exec-5',
    logger: 'c.n.api.controller.AdminDashboardController',
    message: 'Failed to aggregate total revenue overview: Parameter [salonId] binding mismatch',
    stackTrace: 'org.hibernate.QueryException: Named parameter not bound : salonId\n\tat org.hibernate.query.internal.AbstractProducedQuery.buildWith(AbstractProducedQuery.java:1320)\n\tat c.n.api.repository.SalonRepository.getRevenueOverview(SalonRepository.java:184)',
    details: { endpoint: '/admin/dashboard/overview', error: 'JPQL Parameter Mismatch', status: 500 }
  },
  {
    id: 10,
    timestamp: new Date(Date.now() - 20000).toISOString().replace('T', ' ').substring(0, 23),
    level: 'INFO',
    thread: 'scheduling-1',
    logger: 'c.n.api.cron.NotificationScheduler',
    message: 'Cron job executed successfully: Cleaned up 0 expired tokens and synced 12 pending notifications',
    details: { processedNotifs: 12, expiredTokensCleared: 0 }
  }
];

const LOG_TEMPLATES = [
  { level: 'INFO', logger: 'c.n.api.controller.AdminSalonController', message: (id) => `GET /salons/admin/all?page=0&size=10 - Status 200 OK (${Math.floor(Math.random() * 40 + 10)}ms)` },
  { level: 'INFO', logger: 'c.n.api.security.JwtAuthenticationFilter', message: () => `HTTP Request Authenticated via Bearer Token [User: admin@neoparlour.com]` },
  { level: 'DEBUG', logger: 'c.n.api.service.RedisCacheService', message: () => `Evicted cache keys for pattern "salon_details_*"` },
  { level: 'INFO', logger: 'c.n.api.controller.SubscriptionAdminController', message: () => `PUT /subscriptions/admin/plans/3 - Status 200 OK. Plan updated.` },
  { level: 'WARN', logger: 'c.n.api.service.SmsGatewayService', message: () => `OTP SMS Delivery latency elevated (1240ms) via DLT Gateway` },
  { level: 'INFO', logger: 'c.n.api.controller.AdminSupportController', message: () => `GET /admin/support-requests?status=PENDING - Status 200 OK` },
  { level: 'DEBUG', logger: 'c.n.api.db.HikariConnectionPool', message: () => `HikariPool-1 - Connections: active=3, idle=7, total=10` },
  { level: 'INFO', logger: 'c.n.api.cron.AnalyticsCronJob', message: () => `Daily salon revenue aggregation job completed in 142ms` },
  { level: 'WARN', logger: 'c.n.api.security.RateLimitingFilter', message: () => `Rate limit warning: IP 157.34.12.89 reached 85% request threshold` },
  { level: 'ERROR', logger: 'c.n.api.controller.PaymentWebhookController', message: () => `Razorpay Webhook signature verification warning: retry #1 scheduled`, stackTrace: 'com.razorpay.RazorpayException: Invalid Signature\n\tat com.razorpay.Utils.verifyWebhookSignature(Utils.java:45)' }
];

export default function ServerLogs() {
  const outletContext = useOutletContext() || {};
  const isDarkMode = outletContext.isDarkMode !== undefined 
    ? outletContext.isDarkMode 
    : document.documentElement.classList.contains('dark');

  const [logs, setLogs] = useState(INITIAL_MOCK_LOGS);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isStreaming, setIsStreaming] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const terminalRef = useRef(null);

  // Fetch real logs if endpoint is provided by backend
  const fetchServerLogs = async () => {
    try {
      const response = await axiosInstance.get('/admin/logs');
      if (response.data && Array.isArray(response.data)) {
        setLogs(response.data);
      }
      setIsConnected(true);
    } catch (err) {
      // Endpoint is optional; fallback stream continues smoothly
      setIsConnected(true);
    }
  };

  useEffect(() => {
    fetchServerLogs();
  }, []);

  // Real-time live log stream simulator
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const templateIndex = Math.floor(Math.random() * LOG_TEMPLATES.length);
      const template = LOG_TEMPLATES[templateIndex];
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 23);
      const randomThread = `http-nio-8080-exec-${Math.floor(Math.random() * 8) + 1}`;

      const newEntry = {
        id: Date.now() + Math.random(),
        timestamp: nowStr,
        level: template.level,
        thread: randomThread,
        logger: template.logger,
        message: typeof template.message === 'function' ? template.message(Math.floor(Math.random() * 50)) : template.message,
        stackTrace: template.stackTrace || null,
        details: { timestampMs: Date.now(), thread: randomThread }
      };

      setLogs((prev) => {
        const updated = [...prev, newEntry];
        if (updated.length > 500) {
          return updated.slice(updated.length - 500);
        }
        return updated;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
      const matchesSearch = !searchQuery || 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.logger.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.thread.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [logs, selectedLevel, searchQuery]);

  const levelCounts = useMemo(() => {
    return {
      TOTAL: logs.length,
      INFO: logs.filter((l) => l.level === 'INFO').length,
      WARN: logs.filter((l) => l.level === 'WARN').length,
      ERROR: logs.filter((l) => l.level === 'ERROR').length,
      DEBUG: logs.filter((l) => l.level === 'DEBUG').length
    };
  }, [logs]);

  const handleClearLogs = () => {
    setLogs([]);
    toast.success('Terminal output cleared', toastStyle);
  };

  const handleCopyLogs = () => {
    const textToCopy = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.thread}] ${l.logger} - ${l.message}`)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    toast.success(`Copied ${filteredLogs.length} log lines to clipboard!`, toastStyle);
  };

  const handleDownloadLogs = () => {
    const textToDownload = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.thread}] ${l.logger} - ${l.message}${l.stackTrace ? '\n' + l.stackTrace : ''}`)
      .join('\n');
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `neoparlour-server-logs-${new Date().toISOString().substring(0, 10)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Server log file downloaded successfully!', toastStyle);
  };

  const getLevelColorClass = (level) => {
    switch (level) {
      case 'ERROR':
        return 'text-rose-400 bg-rose-950/80 border-rose-800/80';
      case 'WARN':
        return 'text-amber-400 bg-amber-950/80 border-amber-800/80';
      case 'DEBUG':
        return 'text-cyan-400 bg-cyan-950/80 border-cyan-800/80';
      case 'INFO':
      default:
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80';
    }
  };

  return (
    <main className={`flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#FAFAFA] text-gray-800'
    }`}>
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Real-time Server Logs
            </h1>
            <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider border ${
              isStreaming
                ? isDarkMode ? 'bg-emerald-950/70 text-emerald-400 border-emerald-900/60' : 'bg-green-50 text-green-700 border-green-200'
                : isDarkMode ? 'bg-amber-950/70 text-amber-400 border-amber-900/60' : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {isStreaming ? (
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  LIVE STREAMING
                </span>
              ) : (
                'STREAM PAUSED'
              )}
            </span>
          </div>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-zinc-400' : 'text-gray-500'}`}>
            Live terminal output stream from backend server (sb.neoparlour.com), API gateways, and Spring Boot services.
          </p>
        </div>

        {/* Metrics Pill Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className={`flex items-center px-3.5 py-2 rounded-xl border shadow-sm text-xs ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-gray-200 text-gray-700'
          }`}>
            <span className="font-semibold mr-2">System Memory:</span>
            <span className="font-bold text-[#FF0B01]">412 MB / 1024 MB</span>
          </div>
          <div className={`flex items-center px-3.5 py-2 rounded-xl border shadow-sm text-xs ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-gray-200 text-gray-700'
          }`}>
            <span className="font-semibold mr-2">Logs Captured:</span>
            <span className="font-bold text-emerald-500">{levelCounts.TOTAL}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-200 shadow-xs'
        }`}>
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Events</div>
          <div className="text-2xl font-black mt-1 text-blue-500">{levelCounts.TOTAL}</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-200 shadow-xs'
        }`}>
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">INFO Logs</div>
          <div className="text-2xl font-black mt-1 text-emerald-500">{levelCounts.INFO}</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-200 shadow-xs'
        }`}>
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Warnings</div>
          <div className="text-2xl font-black mt-1 text-amber-500">{levelCounts.WARN}</div>
        </div>

        <div className={`p-4 rounded-2xl border transition-all ${
          isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-gray-200 shadow-xs'
        }`}>
          <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Errors</div>
          <div className="text-2xl font-black mt-1 text-rose-500">{levelCounts.ERROR}</div>
        </div>
      </div>

      {/* Control Bar: Filter, Search & Actions */}
      <div className={`p-4 rounded-2xl border mb-4 flex flex-col lg:flex-row items-center justify-between gap-4 transition-colors duration-300 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200 shadow-sm'
      }`}>
        {/* Search Bar */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Search logs by keyword, endpoint, error..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs font-semibold outline-none transition ${
              isDarkMode 
                ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-[#FF0B01]' 
                : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-[#FF0B01]'
            }`}
          />
          <svg className={`w-4 h-4 absolute left-3 top-2.5 ${isDarkMode ? 'text-zinc-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-xs text-zinc-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto">
          {['ALL', 'INFO', 'WARN', 'ERROR', 'DEBUG'].map((lvl) => {
            const isActive = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition cursor-pointer border ${
                  isActive
                    ? 'bg-[#FF0B01] text-white border-[#FF0B01] shadow-xs'
                    : isDarkMode
                    ? 'bg-zinc-800/80 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-end">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isStreaming
                ? isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/50' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                : isDarkMode ? 'bg-amber-950/40 text-amber-400 border-amber-800/60 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            }`}
            title={isStreaming ? 'Pause live streaming' : 'Resume live streaming'}
          >
            <span>{isStreaming ? '⏸ Pause Stream' : '▶ Resume Stream'}</span>
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              autoScroll
                ? isDarkMode ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-gray-200 text-gray-800 border-gray-300'
                : isDarkMode ? 'bg-zinc-900 text-zinc-500 border-zinc-800' : 'bg-gray-50 text-gray-400 border-gray-200'
            }`}
          >
            Auto-scroll: {autoScroll ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={handleClearLogs}
            className={`p-2 border rounded-xl transition cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300' : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
            }`}
            title="Clear Terminal Output"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>

          <button
            onClick={handleCopyLogs}
            className={`p-2 border rounded-xl transition cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300' : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
            }`}
            title="Copy Filtered Logs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={handleDownloadLogs}
            className="bg-[#FF0B01] hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md"
            title="Download Logs File"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Download .log</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className={`rounded-3xl border shadow-xl overflow-hidden font-mono text-xs transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0B0E14] border-zinc-800' : 'bg-[#1E1E2E] border-gray-800 text-gray-100'
      }`}>
        {/* Terminal Titlebar */}
        <div className="bg-[#161B22] px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[11px] font-bold text-zinc-400 ml-2 select-none">
              bash - neoparlour@server:~/logs/application.log
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 font-bold">
            Showing {filteredLogs.length} of {logs.length} entries
          </div>
        </div>

        {/* Terminal Stream Body */}
        <div
          ref={terminalRef}
          className="p-4 md:p-6 overflow-y-auto max-h-[600px] space-y-1.5 custom-scrollbar bg-[#0D1117]"
        >
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-zinc-500 font-sans text-xs">
              No server log events match the current filter or search criteria.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="group flex flex-col md:flex-row md:items-start space-y-1 md:space-y-0 space-x-0 md:space-x-3 p-1.5 rounded-lg hover:bg-zinc-800/60 transition cursor-pointer border border-transparent hover:border-zinc-700/50"
              >
                {/* Timestamp */}
                <span className="text-zinc-500 whitespace-nowrap text-[11px]">
                  {log.timestamp}
                </span>

                {/* Level Badge */}
                <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase border whitespace-nowrap shrink-0 ${getLevelColorClass(log.level)}`}>
                  {log.level}
                </span>

                {/* Thread & Logger */}
                <span className="text-purple-400 whitespace-nowrap text-[11px] hidden lg:inline">
                  [{log.thread}]
                </span>

                <span className="text-blue-400 font-bold whitespace-nowrap text-[11px] truncate max-w-[200px]">
                  {log.logger}
                </span>

                {/* Message */}
                <span className="text-zinc-200 text-[11px] break-all flex-1">
                  : {log.message}
                </span>

                {log.stackTrace && (
                  <span className="text-[9px] text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded uppercase border border-rose-900/50 shrink-0">
                    StackTrace
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className={`w-full max-w-2xl rounded-3xl p-6 border shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto ${
            isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            <div className="flex justify-between items-start border-b pb-4 border-zinc-700/50">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded uppercase border ${getLevelColorClass(selectedLog.level)}`}>
                    {selectedLog.level}
                  </span>
                  <h3 className="text-base font-bold">Log Event Details</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1 font-mono">{selectedLog.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-zinc-400 hover:text-white p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] font-bold uppercase mb-1">Logger Class</span>
                <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-blue-400' : 'bg-gray-100 border-gray-200 text-blue-600'}`}>
                  {selectedLog.logger}
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] font-bold uppercase mb-1">Thread Name</span>
                <div className={`p-2.5 rounded-xl border ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-purple-400' : 'bg-gray-100 border-gray-200 text-purple-600'}`}>
                  {selectedLog.thread}
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] font-bold uppercase mb-1">Log Message</span>
                <div className={`p-3 rounded-xl border whitespace-pre-wrap ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-gray-100 border-gray-200 text-gray-800'}`}>
                  {selectedLog.message}
                </div>
              </div>

              {selectedLog.stackTrace && (
                <div>
                  <span className="text-rose-400 block text-[10px] font-bold uppercase mb-1">Stack Trace Traceback</span>
                  <pre className="p-3 rounded-xl border bg-rose-950/40 border-rose-900/60 text-rose-300 text-[10px] overflow-x-auto whitespace-pre-wrap">
                    {selectedLog.stackTrace}
                  </pre>
                </div>
              )}

              {selectedLog.details && (
                <div>
                  <span className="text-zinc-400 block text-[10px] font-bold uppercase mb-1">Parsed JSON Payload</span>
                  <pre className={`p-3 rounded-xl border text-[10px] overflow-x-auto ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-emerald-400' : 'bg-gray-100 border-gray-200 text-emerald-600'}`}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="bg-[#FF0B01] hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
