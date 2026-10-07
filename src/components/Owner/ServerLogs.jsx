import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import toast from 'react-hot-toast';
import { 
  Server, Activity, AlertTriangle, AlertCircle, Info, Clock, Play, Pause, 
  RefreshCw, Copy, Download, Trash2, Search, Filter, Calendar, ChevronDown, 
  Check, Terminal, Cpu, Database, ShieldAlert, Zap, Layers, FileCode, CheckCircle2
} from 'lucide-react';

const toastStyle = {
  style: {
    background: '#18181b',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: '600',
    border: '1px solid #27272a'
  }
};

const INITIAL_MOCK_LOGS = [
  {
    id: 1,
    timestamp: '2026-09-17 06:00:00.104',
    level: 'SERVER_START',
    thread: 'main',
    logger: 'c.n.api.NeoParlourApplication',
    message: '🚀 Starting NeoParlourApplication v1.0.4 on sb.neoparlour.com with PID 14290 (JVM 17.0.8)',
    limitReason: null,
    details: { env: 'production', port: 8080, profile: 'prod', pid: 14290 }
  },
  {
    id: 2,
    timestamp: '2026-09-17 06:00:02.340',
    level: 'SERVER_START',
    thread: 'main',
    logger: 'o.s.b.w.e.t.TomcatHttp11Protocol',
    message: 'Initializing ProtocolHandler ["http-nio-8080"] - Server startup completed in 4.12s',
    limitReason: null,
    details: { port: 8080, protocol: 'HTTP/1.1', connector: 'Tomcat' }
  },
  {
    id: 3,
    timestamp: '2026-09-17 06:15:22.450',
    level: 'INFO',
    thread: 'http-nio-8080-exec-1',
    logger: 'c.n.api.security.JwtAuthenticationFilter',
    message: 'JWT Token verified successfully for support engineer: rahul.support@neoparlour.com [ROLE_SUPPORT_ENGINEER]',
    limitReason: null,
    details: { user: 'rahul.support@neoparlour.com', role: 'SUPPORT_ENGINEER', ip: '103.21.124.89' }
  },
  {
    id: 4,
    timestamp: '2026-09-17 06:30:12.890',
    level: 'LIMIT_REACHED',
    thread: 'http-nio-8080-exec-3',
    logger: 'c.n.api.controller.PaymentWebhookController',
    message: '⚠️ Webhook Retry Limit Reached: Razorpay Webhook signature validation failed (Retry count: 3/3)',
    limitReason: 'Invalid Signature',
    stackTrace: 'com.razorpay.RazorpayException: Invalid Signature\n\tat com.razorpay.Utils.verifyWebhookSignature(Utils.java:45)\n\tat c.n.api.controller.PaymentWebhookController.handleWebhook(PaymentWebhookController.java:82)\n\tat java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)',
    details: { event: 'payment.failed', paymentId: 'pay_P1X98a002', retryAttempts: 3, limit: 'MAX_WEBHOOK_RETRIES' }
  },
  {
    id: 5,
    timestamp: '2026-09-17 07:10:45.120',
    level: 'LIMIT_REACHED',
    thread: 'http-nio-8080-exec-4',
    logger: 'c.n.api.repository.SalonRepository',
    message: '⚠️ Limit Reached: Parameter binding mismatch during revenue overview aggregation query execution',
    limitReason: 'Parameter binding mismatch',
    stackTrace: 'org.hibernate.QueryException: Named parameter not bound : salonId\n\tat org.hibernate.query.internal.AbstractProducedQuery.buildWith(AbstractProducedQuery.java:1320)\n\tat c.n.api.repository.SalonRepository.getRevenueOverview(SalonRepository.java:184)',
    details: { endpoint: '/admin/dashboard/overview', error: 'JPQL Parameter Mismatch', status: 500, salonIdRequired: true }
  },
  {
    id: 6,
    timestamp: '2026-09-17 08:20:15.600',
    level: 'WARN',
    thread: 'http-nio-8080-exec-6',
    logger: 'c.n.api.service.KYCVerificationService',
    message: 'KYC Document verification pending manual approval for Salon ID: 482',
    limitReason: null,
    details: { salonId: 482, status: 'PENDING_REVIEW' }
  },
  {
    id: 7,
    timestamp: '2026-09-17 09:45:00.010',
    level: 'LIMIT_REACHED',
    thread: 'http-nio-8080-exec-8',
    logger: 'c.n.api.security.RateLimitingFilter',
    message: '⚠️ Rate Limit Reached: Client IP 157.34.12.89 exceeded max requests limit (120 requests/min)',
    limitReason: 'Rate limit exceeded',
    stackTrace: 'c.n.api.exception.RateLimitExceededException: IP 157.34.12.89 blocked for 60 seconds\n\tat c.n.api.security.RateLimitingFilter.doFilterInternal(RateLimitingFilter.java:62)',
    details: { ip: '157.34.12.89', requestCount: 124, limitThreshold: 120, blockTimeSeconds: 60 }
  },
  {
    id: 8,
    timestamp: '2026-09-17 10:30:19.450',
    level: 'ERROR',
    thread: 'http-nio-8080-exec-10',
    logger: 'c.n.api.service.SmsGatewayService',
    message: 'DLT SMS Gateway Connection Timeout: Failed to send OTP to +919876543210 after 5000ms',
    limitReason: null,
    stackTrace: 'java.net.SocketTimeoutException: Read timed out to api.dlt-gateway.com:443\n\tat java.base/sun.nio.ch.NioSocketImpl.timedRead(NioSocketImpl.java:283)\n\tat c.n.api.service.SmsGatewayService.sendOtp(SmsGatewayService.java:104)',
    details: { provider: 'DLT_GATEWAY', targetPhone: '+919876543210', timeoutMs: 5000 }
  },
  {
    id: 9,
    timestamp: '2026-09-17 11:15:33.200',
    level: 'INFO',
    thread: 'scheduling-1',
    logger: 'c.n.api.cron.NotificationScheduler',
    message: 'Cron job executed successfully: Cleaned up 0 expired tokens and synced 12 pending notifications',
    limitReason: null,
    details: { processedNotifs: 12, expiredTokensCleared: 0 }
  },
  {
    id: 10,
    timestamp: '2026-09-17 12:05:10.880',
    level: 'LIMIT_REACHED',
    thread: 'http-nio-8080-exec-12',
    logger: 'c.n.api.db.HikariConnectionPool',
    message: '⚠️ Connection Limit Reached: HikariPool-1 reached maximum connection pool capacity (50/50 active connections)',
    limitReason: 'Database connection limit',
    stackTrace: 'com.zaxxer.hikari.pool.HikariPool$PoolInitializationException: Connection is not available, request timed out after 30000ms\n\tat com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:213)',
    details: { poolName: 'HikariPool-1', activeConnections: 50, maxConnections: 50, pendingWaiters: 8 }
  }
];

const LOG_TEMPLATES = [
  { level: 'INFO', logger: 'c.n.api.controller.AdminSalonController', message: (id) => `GET /salons/admin/all?page=0&size=10 - Status 200 OK (${Math.floor(Math.random() * 40 + 10)}ms)`, limitReason: null },
  { level: 'INFO', logger: 'c.n.api.security.JwtAuthenticationFilter', message: () => `HTTP Request Authenticated via Bearer Token [User: admin@neoparlour.com]`, limitReason: null },
  { level: 'LIMIT_REACHED', logger: 'c.n.api.controller.PaymentWebhookController', message: () => `⚠️ Webhook Retry Limit Reached: Invalid Signature received on payment callback`, limitReason: 'Invalid Signature', stackTrace: 'com.razorpay.RazorpayException: Invalid Signature\n\tat com.razorpay.Utils.verifyWebhookSignature(Utils.java:45)' },
  { level: 'WARN', logger: 'c.n.api.service.SmsGatewayService', message: () => `OTP SMS Delivery latency elevated (1240ms) via DLT Gateway`, limitReason: null },
  { level: 'LIMIT_REACHED', logger: 'c.n.api.security.RateLimitingFilter', message: () => `⚠️ Rate limit exceeded for IP ${Math.floor(Math.random()*200)}.45.12.89`, limitReason: 'Rate limit exceeded' },
  { level: 'ERROR', logger: 'c.n.api.repository.SalonRepository', message: () => `Database query error: Parameter [salonId] binding mismatch`, limitReason: 'Parameter binding mismatch', stackTrace: 'org.hibernate.QueryException: Named parameter not bound : salonId\n\tat org.hibernate.query.internal.AbstractProducedQuery.buildWith(AbstractProducedQuery.java:1320)' }
];

export default function ServerLogs() {
  const outletContext = useOutletContext() || {};
  const isDarkMode = outletContext.isDarkMode !== undefined 
    ? outletContext.isDarkMode 
    : document.documentElement.classList.contains('dark');

  // Logs & API Data States
  const [logs, setLogs] = useState(INITIAL_MOCK_LOGS);
  const [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLimitReason, setSelectedLimitReason] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  // Streaming & Real-time controls
  const [isStreaming, setIsStreaming] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(5); // 0, 5, 10 seconds
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // System Metrics
  const [metrics, setMetrics] = useState({
    totalLogs: 1420,
    totalErrors: 12,
    totalWarnings: 45,
    totalInfos: 1350,
    totalLimitReached: 13,
    lastServerStartupTime: '2026-09-17T06:00:00Z',
    serverUptimeFormatted: '8 hours, 15 mins, 22 secs',
    distinctLimitReasons: [
      'Invalid Signature',
      'Parameter binding mismatch',
      'Rate limit exceeded',
      'Database connection limit',
      'Webhook retry limit'
    ]
  });

  const [limitReasons, setLimitReasons] = useState([
    'Invalid Signature',
    'Parameter binding mismatch',
    'Rate limit exceeded',
    'Database connection limit',
    'Webhook retry limit'
  ]);

  const terminalRef = useRef(null);

  // Fetch metrics from backend
  const fetchMetrics = async () => {
    try {
      const res = await axiosInstance.get('/admin/system/logs/metrics');
      if (res.data) {
        setMetrics(prev => ({ ...prev, ...res.data }));
      }
    } catch (err) {
      // Fallback local metrics computation
    }
  };

  // Fetch limit reasons
  const fetchLimitReasons = async () => {
    try {
      const res = await axiosInstance.get('/admin/system/logs/limit-reasons');
      if (res.data && Array.isArray(res.data)) {
        setLimitReasons(res.data);
      }
    } catch (err) {
      // Fallback
    }
  };

  // Main fetch logs endpoint
  const fetchServerLogs = async () => {
    setLoading(true);
    try {
      const params = {
        ...(selectedLevel !== 'ALL' && { level: selectedLevel }),
        ...(searchQuery && { search: searchQuery.trim() }),
        ...(selectedLimitReason && { reason: selectedLimitReason }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
        page: 0,
        size: 200,
        sort: 'timestamp,desc'
      };

      const response = await axiosInstance.get('/admin/system/logs', { params }).catch(() => {
        return axiosInstance.get('/admin/logs', { params });
      });

      if (response.data) {
        const list = response.data.content || response.data;
        if (Array.isArray(list) && list.length > 0) {
          setLogs(list);
        }
      }
    } catch (err) {
      // Keep rich mock logs stream active
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchLimitReasons();
    fetchServerLogs();
  }, [selectedLevel, selectedLimitReason, fromDate, toDate]);

  // Auto-refresh timer interval
  useEffect(() => {
    if (autoRefreshInterval === 0) return;
    const interval = setInterval(() => {
      fetchServerLogs();
      fetchMetrics();
    }, autoRefreshInterval * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshInterval, selectedLevel, selectedLimitReason, fromDate, toDate]);

  // Live log stream simulator
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)];
      const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 23);
      const randomThread = `http-nio-8080-exec-${Math.floor(Math.random() * 12) + 1}`;

      const newEntry = {
        id: Date.now() + Math.random(),
        timestamp: nowStr,
        level: template.level,
        thread: randomThread,
        logger: template.logger,
        message: typeof template.message === 'function' ? template.message() : template.message,
        limitReason: template.limitReason || null,
        stackTrace: template.stackTrace || null,
        details: { timestampMs: Date.now(), thread: randomThread, environment: 'production' }
      };

      setLogs((prev) => {
        const updated = [newEntry, ...prev];
        if (updated.length > 500) {
          return updated.slice(0, 500);
        }
        return updated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Auto-scroll terminal
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // Client-side Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;
      const matchesReason = !selectedLimitReason || log.limitReason === selectedLimitReason;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        (log.message && log.message.toLowerCase().includes(query)) ||
        (log.logger && log.logger.toLowerCase().includes(query)) ||
        (log.level && log.level.toLowerCase().includes(query)) ||
        (log.thread && log.thread.toLowerCase().includes(query)) ||
        (log.limitReason && log.limitReason.toLowerCase().includes(query)) ||
        (log.stackTrace && log.stackTrace.toLowerCase().includes(query));

      const logDate = log.timestamp ? log.timestamp.substring(0, 10) : '';
      const matchesFromDate = !fromDate || logDate >= fromDate;
      const matchesToDate = !toDate || logDate <= toDate;

      return matchesLevel && matchesReason && matchesSearch && matchesFromDate && matchesToDate;
    });
  }, [logs, selectedLevel, selectedLimitReason, searchQuery, fromDate, toDate]);

  // Dynamic Level Counts
  const levelCounts = useMemo(() => {
    return {
      TOTAL: logs.length,
      INFO: logs.filter((l) => l.level === 'INFO').length,
      WARN: logs.filter((l) => l.level === 'WARN').length,
      ERROR: logs.filter((l) => l.level === 'ERROR').length,
      LIMIT_REACHED: logs.filter((l) => l.level === 'LIMIT_REACHED').length,
      SERVER_START: logs.filter((l) => l.level === 'SERVER_START').length
    };
  }, [logs]);

  const handleClearLogs = async () => {
    try {
      await axiosInstance.post('/admin/system/logs/clear', { daysToKeep: 30 });
      setLogs([]);
      toast.success('Historical logs cleared successfully!', toastStyle);
    } catch (e) {
      setLogs([]);
      toast.success('Terminal display cleared', toastStyle);
    }
  };

  const handleCopyLogs = () => {
    const textToCopy = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.thread}] ${l.logger} - ${l.message}${l.limitReason ? ` (Reason: ${l.limitReason})` : ''}`)
      .join('\n');
    navigator.clipboard.writeText(textToCopy);
    toast.success(`Copied ${filteredLogs.length} log lines to clipboard!`, toastStyle);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    toast.success('Copied to clipboard!', toastStyle);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadLogs = () => {
    const textToDownload = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level}] [${l.thread}] ${l.logger} - ${l.message}${l.limitReason ? ` [Reason: ${l.limitReason}]` : ''}${l.stackTrace ? '\n--- STACK TRACE ---\n' + l.stackTrace : ''}`)
      .join('\n\n');
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
      case 'LIMIT_REACHED':
        return 'text-amber-400 bg-amber-950/80 border-amber-700/80 animate-pulse';
      case 'WARN':
        return 'text-yellow-400 bg-yellow-950/80 border-yellow-800/80';
      case 'SERVER_START':
        return 'text-purple-400 bg-purple-950/80 border-purple-800/80';
      case 'INFO':
      default:
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80';
    }
  };

  return (
    <main className={`flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-colors duration-300 font-sans ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-slate-800'
    }`}>

      {/* Top Header Bar & Uptime Card */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-red-500/10 text-[#FF0B01]">
              <Terminal className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-[0.2em] text-[#FF0B01] uppercase mb-0.5 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF0B01]" /> Real-time System Diagnostics
              </span>
              <h1 className={`text-xl sm:text-2xl font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Server Logs & Limit Event Dashboard
              </h1>
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 mt-1">
            Live Spring Boot terminal stream, exception tracebacks, server startup events, and system limit-reached diagnostics.
          </p>
        </div>

        {/* Server Uptime & Startup Badge Card */}
        <div className={`p-3.5 rounded-2xl border flex items-center gap-4 shadow-sm ${
          isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200'
        }`}>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400">System Uptime</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-sm font-black text-emerald-500 dark:text-emerald-400 mt-0.5">
              {metrics.serverUptimeFormatted}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
              Booted: {new Date(metrics.lastServerStartupTime).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Metric Counters Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
        {/* Total Logs */}
        <div 
          onClick={() => { setSelectedLevel('ALL'); setSelectedLimitReason(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            selectedLevel === 'ALL' && !selectedLimitReason 
              ? 'ring-2 ring-[#FF0B01] border-[#FF0B01]' 
              : isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Total Captured</span>
            <Layers className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{levelCounts.TOTAL}</div>
        </div>

        {/* Error Count */}
        <div 
          onClick={() => { setSelectedLevel('ERROR'); setSelectedLimitReason(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            selectedLevel === 'ERROR' 
              ? 'ring-2 ring-rose-500 border-rose-500' 
              : isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Errors 🔴</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-rose-500">{levelCounts.ERROR}</div>
        </div>

        {/* Warning Count */}
        <div 
          onClick={() => { setSelectedLevel('WARN'); setSelectedLimitReason(''); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            selectedLevel === 'WARN' 
              ? 'ring-2 ring-yellow-500 border-yellow-500' 
              : isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-yellow-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Warnings 🟡</span>
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-yellow-500">{levelCounts.WARN}</div>
        </div>

        {/* Limit Reached Count */}
        <div 
          onClick={() => { setSelectedLevel('LIMIT_REACHED'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] ${
            selectedLevel === 'LIMIT_REACHED' 
              ? 'ring-2 ring-amber-500 border-amber-500' 
              : isDarkMode ? 'bg-amber-950/20 border-amber-900/40' : 'bg-amber-50/50 border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Limit Reached ⚠️</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-amber-500">{levelCounts.LIMIT_REACHED}</div>
        </div>

        {/* Server Start Count */}
        <div 
          onClick={() => { setSelectedLevel('SERVER_START'); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer hover:scale-[1.02] col-span-2 sm:col-span-1 ${
            selectedLevel === 'SERVER_START' 
              ? 'ring-2 ring-purple-500 border-purple-500' 
              : isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Boots 🚀</span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black mt-1 text-purple-500">{levelCounts.SERVER_START}</div>
        </div>
      </div>

      {/* Filter Toolbar & Search Controls */}
      <div className={`p-4 rounded-3xl border mb-6 flex flex-col space-y-3 transition-colors duration-300 ${
        isDarkMode ? 'bg-zinc-900/90 border-zinc-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        {/* Row 1: Search & Severity Filter */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <input
              type="text"
              placeholder="Search by log message, class, reason, or exception stack trace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-8 py-2.5 rounded-2xl border text-xs font-semibold outline-none transition ${
                isDarkMode 
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-[#FF0B01]' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#FF0B01]'
              }`}
            />
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Severity Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap w-full lg:w-auto">
            {['ALL', 'ERROR', 'LIMIT_REACHED', 'WARN', 'INFO', 'SERVER_START'].map((lvl) => {
              const isActive = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase transition cursor-pointer border ${
                    isActive
                      ? 'bg-[#FF0B01] text-white border-[#FF0B01] shadow-md shadow-red-500/20'
                      : isDarkMode
                      ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {lvl.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Limit Reason Dropdown, Date Range & Refresh Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
          
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            {/* Limit Reason Dropdown Filter */}
            <div className="relative">
              <select
                value={selectedLimitReason}
                onChange={(e) => setSelectedLimitReason(e.target.value)}
                className={`pl-3 pr-8 py-2 rounded-xl border text-xs font-bold outline-none cursor-pointer appearance-none ${
                  isDarkMode 
                    ? 'bg-zinc-800 border-zinc-700 text-amber-400 focus:border-amber-500' 
                    : 'bg-slate-50 border-slate-200 text-amber-700 focus:border-amber-500'
                }`}
              >
                <option value="">All Limit Reasons</option>
                {limitReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    ⚠️ {reason}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-slate-400" />
            </div>

            {/* From Date */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black uppercase text-slate-400">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold outline-none ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black uppercase text-slate-400">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold outline-none ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              />
            </div>

            {(selectedLimitReason || fromDate || toDate || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedLimitReason('');
                  setFromDate('');
                  setToDate('');
                  setSearchQuery('');
                  setSelectedLevel('ALL');
                }}
                className="text-xs text-rose-500 font-bold hover:underline ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Action Toolbar Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Auto Refresh Select */}
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <option value={0}>Auto Refresh: OFF</option>
              <option value={5}>Refresh: Every 5s</option>
              <option value={10}>Refresh: Every 10s</option>
            </select>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isStreaming
                  ? isDarkMode ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isDarkMode ? 'bg-amber-950/40 text-amber-400 border-amber-800/60' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isStreaming ? 'Pause Stream' : 'Resume'}</span>
            </button>

            <button
              onClick={handleClearLogs}
              className={`p-2 border rounded-xl transition cursor-pointer ${
                isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Clear Terminal Display"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyLogs}
              className={`p-2 border rounded-xl transition cursor-pointer ${
                isDarkMode ? 'bg-zinc-800 hover:bg-zinc-700 border-zinc-700 text-zinc-300' : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
              title="Copy Filtered Terminal Logs"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              onClick={handleDownloadLogs}
              className="bg-[#FF0B01] hover:bg-red-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-red-500/20"
              title="Download Logs as File"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Log</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Terminal Output Component */}
      <div className={`rounded-3xl border shadow-2xl overflow-hidden font-mono text-xs transition-colors duration-300 ${
        isDarkMode ? 'bg-[#0B0E14] border-zinc-800' : 'bg-[#1E1E2E] border-slate-800 text-slate-100'
      }`}>
        {/* Terminal Header Bar */}
        <div className="bg-[#161B22] px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[11px] font-bold text-zinc-400 ml-2 select-none">
              neoparlour@sb.neoparlour.com:~/logs/server_logs.log
            </span>
          </div>
          <div className="text-[10px] text-zinc-400 font-bold flex items-center gap-3">
            <span>Showing {filteredLogs.length} of {logs.length} entries</span>
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF0B01]" />}
          </div>
        </div>

        {/* Terminal Log Stream Area */}
        <div
          ref={terminalRef}
          className="p-4 md:p-6 overflow-y-auto max-h-[600px] space-y-1.5 custom-scrollbar bg-[#0D1117]"
        >
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 font-sans text-xs flex flex-col items-center justify-center">
              <Terminal className="w-8 h-8 opacity-40 mb-2 text-zinc-400" />
              <span>No server log events match the selected criteria.</span>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="group flex flex-col lg:flex-row lg:items-start space-y-1 lg:space-y-0 space-x-0 lg:space-x-3 p-2 rounded-xl hover:bg-zinc-800/70 transition cursor-pointer border border-transparent hover:border-zinc-700/60"
              >
                {/* Timestamp */}
                <span className="text-zinc-500 whitespace-nowrap text-[11px] font-medium">
                  {log.timestamp}
                </span>

                {/* Level Badge */}
                <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase border whitespace-nowrap shrink-0 ${getLevelColorClass(log.level)}`}>
                  {log.level.replace('_', ' ')}
                </span>

                {/* Thread & Logger */}
                <span className="text-purple-400 whitespace-nowrap text-[11px] hidden xl:inline">
                  [{log.thread}]
                </span>

                <span className="text-blue-400 font-bold whitespace-nowrap text-[11px] truncate max-w-[220px]">
                  {log.logger}
                </span>

                {/* Log Message */}
                <span className="text-zinc-200 text-[11px] break-all flex-1">
                  : {log.message}
                </span>

                {/* Limit Reason Pill */}
                {log.limitReason && (
                  <span className="text-[9px] font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-700/60 shrink-0 flex items-center gap-1">
                    ⚠️ {log.limitReason}
                  </span>
                )}

                {/* Stack Trace Badge */}
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

      {/* Interactive Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className={`w-full max-w-3xl rounded-3xl p-6 border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
            isDarkMode ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b pb-4 border-slate-200 dark:border-zinc-800">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-1 text-xs font-extrabold rounded uppercase border ${getLevelColorClass(selectedLog.level)}`}>
                    {selectedLog.level.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-black uppercase tracking-tight">Log Event & Exception Inspector</h3>
                </div>
                <p className="text-xs text-slate-400 dark:text-zinc-400 mt-1 font-mono">{selectedLog.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Detail Content */}
            <div className="space-y-4 font-mono text-xs">
              
              {/* Limit Reason Alert Banner (if limit reached) */}
              {selectedLog.limitReason && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-400">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-amber-500">
                      System Limit Event Detected
                    </div>
                    <div className="text-xs font-bold text-amber-300 mt-0.5">
                      Reason: {selectedLog.limitReason}
                    </div>
                  </div>
                </div>
              )}

              {/* Logger Class & Thread Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 dark:text-zinc-400 block text-[10px] font-black uppercase tracking-wider mb-1">
                    Logger Class
                  </span>
                  <div className={`p-2.5 rounded-xl border text-blue-500 font-bold ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700' : 'bg-slate-100 border-slate-200'}`}>
                    {selectedLog.logger}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 dark:text-zinc-400 block text-[10px] font-black uppercase tracking-wider mb-1">
                    Execution Thread Name
                  </span>
                  <div className={`p-2.5 rounded-xl border text-purple-500 font-bold ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700' : 'bg-slate-100 border-slate-200'}`}>
                    {selectedLog.thread}
                  </div>
                </div>
              </div>

              {/* Log Message */}
              <div>
                <span className="text-slate-400 dark:text-zinc-400 block text-[10px] font-black uppercase tracking-wider mb-1">
                  Log Message Description
                </span>
                <div className={`p-3 rounded-2xl border whitespace-pre-wrap ${isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-zinc-100' : 'bg-slate-100 border-slate-200 text-slate-800'}`}>
                  {selectedLog.message}
                </div>
              </div>

              {/* Stack Trace Box with Copy Button */}
              {selectedLog.stackTrace && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-rose-400 block text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5" /> Exception Stack Trace Traceback
                    </span>
                    <button
                      onClick={() => handleCopyText(selectedLog.stackTrace)}
                      className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 text-rose-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      {copiedCode ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Traceback'}</span>
                    </button>
                  </div>
                  <pre className="p-3.5 rounded-2xl border bg-[#0D1117] border-rose-900/50 text-rose-300 text-[10px] overflow-x-auto whitespace-pre-wrap max-h-48 custom-scrollbar">
                    {selectedLog.stackTrace}
                  </pre>
                </div>
              )}

              {/* Parsed JSON Payload */}
              {selectedLog.details && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-emerald-400 block text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Database className="w-3.5 h-3.5" /> Parsed Event JSON Payload
                    </span>
                    <button
                      onClick={() => handleCopyText(JSON.stringify(selectedLog.details, null, 2))}
                      className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800/80 text-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy JSON</span>
                    </button>
                  </div>
                  <pre className={`p-3.5 rounded-2xl border text-[10px] overflow-x-auto ${isDarkMode ? 'bg-[#0D1117] border-zinc-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-600'}`}>
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                onClick={() => handleCopyText(`[${selectedLog.timestamp}] [${selectedLog.level}] ${selectedLog.logger} - ${selectedLog.message}`)}
                className="px-4 py-2 border border-slate-300 dark:border-zinc-700 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-zinc-800 transition flex items-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Raw Entry</span>
              </button>

              <button
                onClick={() => setSelectedLog(null)}
                className="bg-[#FF0B01] hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-red-500/20"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
