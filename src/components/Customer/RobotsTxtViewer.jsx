import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bot, ShieldCheck, ShieldAlert, CheckCircle2, XCircle, Copy, Check, 
  Download, ExternalLink, Search, RefreshCw, FileText, ArrowRight,
  Globe, Sparkles, Layers, Sliders, Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEOFooter from '../common/SEOFooter';

const RAW_ROBOTS_TXT = `# ==============================================================================
# NeoParlour Official Robots Exclusion Protocol (robots.txt)
# Website: https://neoparlour.com
# Maintained by: NeoParlour SEO & Engineering Team
# Last Updated: October 2026
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Global Crawler Directives
# ------------------------------------------------------------------------------
User-agent: *
Allow: /
Allow: /assets/
Allow: /locales/
Allow: /salons/
Allow: /salon/
Allow: /blogs
Allow: /blog/
Allow: /seo-salons
Allow: /client-testimonials
Allow: /about
Allow: /support
Allow: /security
Allow: /partner-with-us
Allow: /features
Allow: /sitemap
Allow: /sitemap.xml
Allow: /robots.txt

# Disallow Internal & Administrative Dashboards
Disallow: /admin/
Disallow: /owner/
Disallow: /staff/
Disallow: /api/
Disallow: /owner-login
Disallow: /customer-login
Disallow: /login

# Disallow Sensitive Customer Sessions & Checkout Funnel
Disallow: /customer/login
Disallow: /customer/select-salon
Disallow: /customer/appointments
Disallow: /customer/my-orders
Disallow: /customer/cart
Disallow: /customer/checkout
Disallow: /customer/profile

# ------------------------------------------------------------------------------
# 2. Targeted Search Engine Rules
# ------------------------------------------------------------------------------
User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /owner/
Disallow: /staff/
Disallow: /api/
Disallow: /customer/select-salon
Disallow: /customer/appointments
Disallow: /customer/my-orders
Disallow: /customer/cart

User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /owner/
Disallow: /staff/
Disallow: /api/
Disallow: /customer/select-salon
Disallow: /customer/appointments
Disallow: /customer/my-orders
Disallow: /customer/cart
Crawl-delay: 1

# ------------------------------------------------------------------------------
# 3. AI & LLM Assistants (Curated Indexing)
# ------------------------------------------------------------------------------
User-agent: GPTBot
Allow: /blogs
Allow: /blog/
Allow: /salons
Allow: /seo-salons
Disallow: /admin/
Disallow: /owner/
Disallow: /customer/

User-agent: ChatGPT-User
Allow: /
Disallow: /admin/
Disallow: /owner/
Disallow: /customer/

# ------------------------------------------------------------------------------
# 4. XML Sitemap Location
# ------------------------------------------------------------------------------
Sitemap: https://neoparlour.com/sitemap.xml`;

const DISALLOWED_PATTERNS = [
  '/admin/',
  '/owner/',
  '/staff/',
  '/api/',
  '/owner-login',
  '/customer-login',
  '/login',
  '/customer/login',
  '/customer/select-salon',
  '/customer/appointments',
  '/customer/my-orders',
  '/customer/cart',
  '/customer/checkout',
  '/customer/profile'
];

const ALLOWED_SECTIONS = [
  { path: '/', label: 'Homepage & Landing', freq: 'Daily crawl', desc: 'Main brand showcase and dynamic salon locator' },
  { path: '/salons/', label: 'City & Area Directory', freq: 'Daily crawl', desc: 'Crawlable city and suburb hubs' },
  { path: '/salon/', label: 'Salon Business Profiles', freq: 'Daily crawl', desc: 'Direct booking & service menus for verified salons' },
  { path: '/blogs', label: 'SEO Blog Content Hub', freq: 'Daily crawl', desc: 'Curated beauty, haircut & grooming lifestyle guides' },
  { path: '/blog/:slug', label: 'Individual Blog Articles', freq: 'Weekly crawl', desc: 'Deep-dive hair care & styling editorial pieces' },
  { path: '/seo-salons', label: 'Geo-Targeted Services Directory', freq: 'Daily crawl', desc: 'Hyper-local keyword landing combinations' },
  { path: '/client-testimonials', label: 'Customer Reviews & Social Proof', freq: 'Weekly crawl', desc: 'Authentic consumer ratings and feedback' },
  { path: '/about', label: 'Company Profile & Story', freq: 'Monthly crawl', desc: 'Corporate mission, leadership & brand information' },
  { path: '/support', label: 'Customer Help Center & FAQ', freq: 'Weekly crawl', desc: 'Contact assistance and user FAQs' },
  { path: '/features', label: 'SaaS Platform Features', freq: 'Weekly crawl', desc: 'Comprehensive salon management capabilities' },
  { path: '/partner-with-us', label: 'Salon Partner Registration', freq: 'Weekly crawl', desc: 'B2B onboarding hub for salon owners' },
  { path: '/sitemap', label: 'HTML Human Sitemap', freq: 'Daily crawl', desc: 'Navigational index for end-users' },
  { path: '/sitemap.xml', label: 'XML Machine Sitemap Index', freq: 'Daily crawl', desc: 'Structured machine index for search bots' },
];

const BLOCKED_SECTIONS = [
  { path: '/admin/*', label: 'Super Admin Management Portal', reason: 'Confidential platform-wide governance' },
  { path: '/owner/*', label: 'Salon Owner Financial Portal', reason: 'Private revenue, payouts & staff payroll' },
  { path: '/staff/*', label: 'Staff Workspace & Rosters', reason: 'Internal appointments, commissions & leaves' },
  { path: '/api/*', label: 'Backend REST API Endpoints', reason: 'JSON data endpoints protected by Bearer JWT' },
  { path: '/customer/appointments', label: 'Personal Customer Bookings', reason: 'User private appointment schedule & status' },
  { path: '/customer/cart & checkout', label: 'Order Processing & Checkout', reason: 'Transactional payment gateway & cart state' },
  { path: '/customer/my-orders', label: 'Customer Purchase History', reason: 'Confidential order invoices & product history' },
  { path: '/owner-login & customer-login', label: 'Authentication Portals', reason: 'Login screens do not produce organic ranking' },
];

export default function RobotsTxtViewer() {
  const navigate = useNavigate();
  const location = useLocation();
  const isInsideAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner');
  const [activeTab, setActiveTab] = useState('inspector'); // 'inspector' | 'raw'
  const [testUrl, setTestUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Live URL Simulator evaluation
  const simulationResult = useMemo(() => {
    if (!testUrl.trim()) return null;
    let clean = testUrl.trim();
    if (!clean.startsWith('/')) clean = '/' + clean;

    const isBlocked = DISALLOWED_PATTERNS.some(pattern => clean.startsWith(pattern));
    return {
      path: clean,
      allowed: !isBlocked,
      matchedRule: isBlocked 
        ? DISALLOWED_PATTERNS.find(pattern => clean.startsWith(pattern))
        : 'Allow: /'
    };
  }, [testUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(RAW_ROBOTS_TXT);
    setCopied(true);
    toast.success('robots.txt copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([RAW_ROBOTS_TXT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded robots.txt file 🚀');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 antialiased flex flex-col justify-between">
      
      {/* Top Banner / Hero */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-red-500/10 text-[#FF0B01] border border-red-500/20">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#FF0B01] bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-500/20">
                    Robots Exclusion Protocol
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
                    robots.txt Inspector & Validator
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 max-w-2xl">
                Crawl budget optimization directives for Googlebot, Bingbot, and AI crawlers. Restricts private administration while ensuring maximum search visibility for salons, services, and blogs.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleCopy}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 shadow-2xs transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy Directives'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 shadow-2xs transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download .txt</span>
              </button>

              <button
                onClick={() => navigate(isInsideAdmin ? '/admin/sitemap' : '/sitemap.xml')}
                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-[#FF0B01] hover:from-red-700 hover:to-red-600 text-white shadow-md shadow-red-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>XML Sitemap</span>
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Server Status</div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4" /> HTTP 200 OK
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Allowed Categories</div>
              <div className="text-sm font-black text-slate-800 dark:text-zinc-100 mt-0.5">
                {ALLOWED_SECTIONS.length} Public Hubs
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Protected Paths</div>
              <div className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5">
                {DISALLOWED_PATTERNS.length} Disallow Rules
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Targeted Crawlers</div>
              <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                Google, Bing, GPTBot
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {/* Live URL Crawler Sandbox / Simulator */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FF0B01]" /> Real-Time URL Crawler Simulator
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Test any URL path to verify if Googlebot, Bingbot, or Web Crawlers are permitted or blocked by robots.txt.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-slate-400">
              <span>Quick test:</span>
              <button 
                onClick={() => setTestUrl('/blogs')} 
                className="hover:text-[#FF0B01] underline cursor-pointer"
              >
                /blogs
              </button>
              <span>•</span>
              <button 
                onClick={() => setTestUrl('/admin/salons')} 
                className="hover:text-[#FF0B01] underline cursor-pointer"
              >
                /admin/salons
              </button>
              <span>•</span>
              <button 
                onClick={() => setTestUrl('/customer/cart')} 
                className="hover:text-[#FF0B01] underline cursor-pointer"
              >
                /customer/cart
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter path to test, e.g. /blogs/best-hair-cuts or /admin/dashboard..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-[#FF0B01] text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none transition"
            />
          </div>

          {simulationResult && (
            <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              simulationResult.allowed
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/30 border-rose-500/30 text-rose-900 dark:text-rose-200'
            }`}>
              <div className="flex items-center gap-3">
                {simulationResult.allowed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                    <span>{simulationResult.allowed ? 'CRAWL PERMITTED (Allowed)' : 'CRAWL BLOCKED (Disallowed)'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/70 dark:bg-zinc-900/60">
                      Rule: {simulationResult.matchedRule}
                    </span>
                  </div>
                  <p className="text-xs font-medium opacity-90 mt-0.5">
                    Path <code className="font-mono font-bold bg-white/50 dark:bg-zinc-900/50 px-1.5 py-0.5 rounded">{simulationResult.path}</code> is {simulationResult.allowed ? 'indexable by search engines and will appear in search results.' : 'strictly blocked from search engines to safeguard private data.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'inspector'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Interactive Rule Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'raw'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Raw robots.txt</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'inspector' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Allowed Indexable Hubs */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      Allowed Public Pages
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">
                      Open to search engine bots for maximum organic indexation
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {ALLOWED_SECTIONS.length} Directives
                </span>
              </div>

              <div className="space-y-2.5">
                {ALLOWED_SECTIONS.map((sec, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 dark:border-zinc-800 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {sec.path}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 dark:bg-zinc-700/60 px-2 py-0.5 rounded-md">
                          {sec.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-6">
                        {sec.desc}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded shrink-0">
                      {sec.freq}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blocked Private Hubs */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                      Disallowed & Protected Paths
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">
                      Excluded from crawlers to protect sensitive credentials & transactions
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-full border border-rose-500/20">
                  {BLOCKED_SECTIONS.length} Restrictions
                </span>
              </div>

              <div className="space-y-2.5">
                {BLOCKED_SECTIONS.map((sec, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-2xl bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                          {sec.path}
                        </span>
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-100/60 dark:bg-rose-900/40 px-2 py-0.5 rounded-md">
                          {sec.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 pl-6">
                        {sec.reason}
                      </p>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded shrink-0">
                      Blocked
                    </span>
                  </div>
                ))}
              </div>

              {/* Bot Specific Directives Notice */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/50 dark:border-indigo-900/40 text-xs text-indigo-900 dark:text-indigo-300 space-y-2">
                <div className="font-black uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Bot Crawl-Rate & AI Configuration
                </div>
                <p className="text-[11px] leading-relaxed font-medium">
                  • <strong>Bingbot:</strong> Configured with a gentle <code>Crawl-delay: 1</code> second interval to protect server CPU while indexing all active salons.<br/>
                  • <strong>GPTBot & AI Assistants:</strong> Curated permission granted strictly to organic <code>/blogs</code>, <code>/salon/</code>, and <code>/seo-salons</code>.
                </p>
              </div>

            </div>

          </div>
        ) : (
          /* Raw View */
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  robots.txt Source Code
                </h3>
                <p className="text-xs text-slate-400">
                  Exact content served at <code className="font-mono text-red-500">https://neoparlour.com/robots.txt</code>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <pre className="p-5 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed selection:bg-emerald-500 selection:text-black">
              {RAW_ROBOTS_TXT}
            </pre>
          </div>
        )}

      </div>

      {/* SEO Footer - only render SEOFooter when viewed as standalone public customer page, not inside OwnerLayout dashboard */}
      {!isInsideAdmin && (
        <div className="w-full bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 mt-12">
          <SEOFooter />
        </div>
      )}

    </div>
  );
}
