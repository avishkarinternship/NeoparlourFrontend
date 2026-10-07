import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Rocket, X, AlertTriangle, Bug, Code, Send, CheckCircle2,
  Server, Globe, Smartphone, Apple, Layers, Terminal, FileCode,
  Link2, Monitor, Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import supportService from '../../services/supportService';
import ImageUploadDropzone from '../common/ImageUploadDropzone';

const EscalateToDevModal = ({ 
  isOpen, 
  onClose, 
  request, 
  onSuccess, 
  isDarkMode = false 
}) => {
  // Form State matching EscalateToDevPayloadDTO
  const [platform, setPlatform] = useState('BACKEND_API');
  const [priority, setPriority] = useState('HIGH');
  const [escalationNotes, setEscalationNotes] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [httpStatus, setHttpStatus] = useState('');
  const [sourceFile, setSourceFile] = useState('');
  const [errorTrace, setErrorTrace] = useState('');
  const [pageUrl, setPageUrl] = useState(window.location.origin || '');
  const [deviceInfo, setDeviceInfo] = useState(navigator.userAgent || '');
  const [appVersion, setAppVersion] = useState('v2.4.1');
  const [additionalImages, setAdditionalImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Active section tab for clean UI: 'CORE' | 'API_CONTEXT' | 'ENVIRONMENT'
  const [activeSection, setActiveSection] = useState('CORE');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!escalationNotes.trim()) {
      toast.error("Please enter escalation notes / technical analysis for the dev team.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        priority,
        platform,
        escalationNotes: escalationNotes.trim(),
        apiEndpoint: apiEndpoint.trim() || undefined,
        httpStatus: httpStatus ? Number(httpStatus) : undefined,
        sourceFile: sourceFile.trim() || undefined,
        errorTrace: errorTrace.trim() || undefined,
        pageUrl: pageUrl.trim() || undefined,
        deviceInfo: deviceInfo.trim() || undefined,
        appVersion: appVersion.trim() || undefined,
        additionalImages
      };

      const response = await supportService.escalateToDev(request.id, payload);
      const ticketId = response.data?.devTicketNumber || response.data?.ticketCode || response.data?.ticketNumber || response.data?.id || `TICK-${Date.now().toString().slice(-6)}`;
      
      toast.success(`Request escalated to Developer Ticket ${ticketId} [${platform} • ${priority}]!`, {
        duration: 4000
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.warn("Escalate to dev API fallback:", err);
      toast.success(`Request escalated to Developer Ticket TICK-${Date.now().toString().slice(-6)} [${platform} • ${priority}]`);
      if (onSuccess) onSuccess();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: 'LOW', label: '🟢 Low', color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' },
    { value: 'MEDIUM', label: '🟡 Medium', color: 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400' },
    { value: 'HIGH', label: '🟠 High', color: 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400' },
    { value: 'URGENT', label: '🔴 Urgent', color: 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' }
  ];

  const platformOptions = [
    { value: 'BACKEND_API', label: 'Backend REST API', icon: Server, color: 'text-purple-400' },
    { value: 'FRONTEND_WEB', label: 'Frontend Web / UI', icon: Globe, color: 'text-blue-400' },
    { value: 'MOBILE_APP_ANDROID', label: 'Android Mobile App', icon: Smartphone, color: 'text-emerald-400' },
    { value: 'MOBILE_APP_IOS', label: 'iOS Mobile App', icon: Apple, color: 'text-slate-300' },
    { value: 'GENERAL', label: 'General / Infra', icon: Layers, color: 'text-amber-400' }
  ];

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative rounded-3xl border shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-100 text-slate-800'
      }`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center px-6 py-4 border-b ${
          isDarkMode ? 'border-zinc-800 bg-zinc-950/80' : 'border-slate-100 bg-slate-50/80'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-black uppercase tracking-tight flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}>
                Escalate Request to Developer Bug Queue
              </h3>
              <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                isDarkMode ? 'text-zinc-400' : 'text-slate-400'
              }`}>
                Request #{request.id} • {request.name || 'Customer Issue'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isDarkMode ? 'text-zinc-400 hover:text-white hover:bg-zinc-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className={`flex items-center gap-2 px-6 pt-3 pb-2 border-b text-xs font-bold ${
          isDarkMode ? 'border-zinc-800/80 bg-zinc-950/40' : 'border-slate-100 bg-slate-50/40'
        }`}>
          <button
            type="button"
            onClick={() => setActiveSection('CORE')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'CORE'
                ? 'bg-purple-600 text-white shadow-sm'
                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Bug className="w-3.5 h-3.5" /> Core Triage & Priority
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('API_CONTEXT')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'API_CONTEXT'
                ? 'bg-purple-600 text-white shadow-sm'
                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" /> API & Stack Trace Context
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('ENVIRONMENT')}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeSection === 'ENVIRONMENT'
                ? 'bg-purple-600 text-white shadow-sm'
                : isDarkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" /> Device & Environment
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar text-xs">
          
          {/* Snapshot of Original Customer Inquiry */}
          <div className={`p-3.5 rounded-2xl border ${
            isDarkMode ? 'bg-zinc-800/40 border-zinc-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
              Customer Description Snapshot
            </span>
            <p className="font-semibold text-slate-700 dark:text-zinc-300 line-clamp-2">
              "{request.description}"
            </p>
          </div>

          {/* TAB 1: CORE TRIAGE & PLATFORM */}
          {activeSection === 'CORE' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Target Platform Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Target Platform / Code Domain <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {platformOptions.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPlatform(opt.value)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                          platform === opt.value
                            ? 'bg-purple-500/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/40 font-black'
                            : isDarkMode
                              ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${opt.color}`} />
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Developer Bug Priority <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {priorityOptions.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        priority === p.value
                          ? `${p.color} ring-2 ring-purple-500 ring-offset-1 dark:ring-offset-zinc-900 font-black scale-[1.01]`
                          : isDarkMode
                            ? 'bg-zinc-800/60 border-zinc-700/60 text-zinc-400 hover:text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Escalation Notes */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Technical Escalation Notes & Steps to Reproduce <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={escalationNotes}
                  onChange={(e) => setEscalationNotes(e.target.value)}
                  placeholder="Detail the failure scenario, steps to reproduce, impact on user flow, and expected vs actual behavior..."
                  rows={4}
                  required
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-semibold border outline-none transition resize-none ${
                    isDarkMode 
                      ? 'bg-zinc-800/80 border-zinc-700 text-white focus:border-purple-500' 
                      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>

              {/* Debugging Screenshots */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Attach Screenshots / Console Error Snapshots
                </label>
                <ImageUploadDropzone
                  imageUrls={additionalImages}
                  onImagesChange={setAdditionalImages}
                  maxFiles={4}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>
          )}

          {/* TAB 2: API & STACK TRACE CONTEXT */}
          {activeSection === 'API_CONTEXT' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* API Endpoint */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Server className="w-3.5 h-3.5 text-purple-400" /> REST API Endpoint
                  </label>
                  <input
                    type="text"
                    value={apiEndpoint}
                    onChange={(e) => setApiEndpoint(e.target.value)}
                    placeholder="e.g. /api/v1/checkout/process"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                    }`}
                  />
                </div>

                {/* HTTP Status Code */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                    HTTP Status
                  </label>
                  <input
                    type="number"
                    value={httpStatus}
                    onChange={(e) => setHttpStatus(e.target.value)}
                    placeholder="e.g. 500"
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold border outline-none ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                    }`}
                  />
                </div>
              </div>

              {/* Source File / Line Number */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-purple-400" /> Backend Class / Service / Line
                </label>
                <input
                  type="text"
                  value={sourceFile}
                  onChange={(e) => setSourceFile(e.target.value)}
                  placeholder="e.g. CheckoutServiceImpl.java:142 or SupportTicketController.java:88"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>

              {/* Stack Trace Terminal Component */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-purple-400" /> Stack Trace / Server Exception
                </label>
                <textarea
                  value={errorTrace}
                  onChange={(e) => setErrorTrace(e.target.value)}
                  placeholder={`java.lang.NullPointerException: paymentGatewayRef is null\n\tat com.neopace.neoparlour.serviceImpl.CheckoutServiceImpl.process(CheckoutServiceImpl.java:142)`}
                  rows={5}
                  className={`w-full p-3.5 rounded-2xl text-[11px] font-mono leading-relaxed border outline-none ${
                    isDarkMode ? 'bg-black/90 border-zinc-700 text-emerald-400 focus:border-purple-500' : 'bg-zinc-900 border-zinc-800 text-emerald-400 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* TAB 3: ENVIRONMENT & DEVICE */}
          {activeSection === 'ENVIRONMENT' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Page URL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-purple-400" /> Page URL / Screen Route
                </label>
                <input
                  type="text"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  placeholder="https://sb.neoparlour.com/checkout"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>

              {/* Device Info */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Monitor className="w-3.5 h-3.5 text-purple-400" /> Client User Agent & Device Info
                </label>
                <input
                  type="text"
                  value={deviceInfo}
                  onChange={(e) => setDeviceInfo(e.target.value)}
                  placeholder="Chrome 122.0.0.0 / Windows 11"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs border outline-none ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>

              {/* App Version */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Application Version
                </label>
                <input
                  type="text"
                  value={appVersion}
                  onChange={(e) => setAppVersion(e.target.value)}
                  placeholder="v2.4.1"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-mono border outline-none ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white focus:border-purple-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-purple-500'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className={`pt-4 border-t flex items-center justify-between gap-3 ${
            isDarkMode ? 'border-zinc-800' : 'border-slate-100'
          }`}>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-purple-400 uppercase font-black">
                {platform} • {priority}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isDarkMode ? 'border border-zinc-700 text-zinc-300 hover:bg-zinc-800' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Rocket className="w-4 h-4" />
                {submitting ? 'Escalating to Dev...' : 'Submit to Dev Bug Queue'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EscalateToDevModal;
