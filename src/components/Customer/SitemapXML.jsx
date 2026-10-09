import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FileCode, Globe, Copy, Check, Download, ExternalLink, Search, 
  RefreshCw, CheckCircle2, Sparkles, Filter, ChevronRight, Layers,
  Calendar, ArrowUpRight, Bot, ShieldCheck
} from 'lucide-react';
import axiosInstance from '../../api/axiosInstance';
import blogService from '../../services/blogService';
import toast from 'react-hot-toast';
import SEOFooter from '../common/SEOFooter';

const SEO_SERVICES_LIST = [
  'Hair Cut', 'Hair Styling', 'Hair Wash', 'Blow Dry', 'Hair Coloring',
  'Highlights / Streaks', 'Hair Spa', 'Hair Treatment', 'Keratin Treatment',
  'Hair Smoothening', 'Hair Straightening', 'Perming / Curling', 'Hair Extensions',
  'Facial', 'Cleanup', 'Skin Polishing', 'Bleaching', 'De-Tan Treatment',
  'Face Treatment', 'Anti-Aging Treatment', 'Acne Treatment', 'Skin Brightening Treatment',
  'Chemical Peel', 'Waxing', 'Threading', 'Eyebrow Shaping', 'Upper Lip',
  'Forehead', 'Full Face Waxing', 'Full Body Waxing', 'Manicure', 'Pedicure',
  'Nail Cutting', 'Nail Shaping', 'Nail Art', 'Nail Extensions', 'Gel Polish',
  'Party Makeup', 'Bridal Makeup', 'Engagement Makeup', 'Reception Makeup',
  'HD Makeup', 'Basic Makeup', 'Beard Trim', 'Beard Styling', 'Shaving',
  'Moustache Styling', 'Eyebrow Styling', 'Eyelash Services', 'Head Massage',
  'Body Massage', 'Relaxation Massage', 'Aroma Therapy', 'Body Scrub', 'Body Wrap',
  'Bridal Hair', 'Bridal Facial', 'Bridal Manicure/Pedicure', 'Pre-Bridal Package',
  'Hair Fall Treatment', 'Dandruff Treatment', 'Scalp Treatment', 'Damage Repair',
  'Protein Treatment'
];

export default function SitemapXML() {
  const navigate = useNavigate();
  const location = useLocation();
  const isInsideAdmin = location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner');
  const [loading, setLoading] = useState(true);
  const [urlList, setUrlList] = useState([]);
  const [xmlContent, setXmlContent] = useState('');
  const [activeTab, setActiveTab] = useState('visual'); // 'visual' | 'raw'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateSitemapData();
  }, []);

  const generateSitemapData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const items = [];

      // 1. Core Platform Pages
      const corePages = [
        { loc: 'https://neoparlour.com/', changefreq: 'daily', priority: '1.0', category: 'Core Platform', lastmod: today },
        { loc: 'https://neoparlour.com/blogs', changefreq: 'daily', priority: '0.9', category: 'Blogs', lastmod: today },
        { loc: 'https://neoparlour.com/seo-salons', changefreq: 'daily', priority: '0.9', category: 'Directory', lastmod: today },
        { loc: 'https://neoparlour.com/client-testimonials', changefreq: 'weekly', priority: '0.8', category: 'Core Platform', lastmod: today },
        { loc: 'https://neoparlour.com/about', changefreq: 'monthly', priority: '0.7', category: 'Core Platform', lastmod: today },
        { loc: 'https://neoparlour.com/features', changefreq: 'weekly', priority: '0.8', category: 'Core Platform', lastmod: today },
        { loc: 'https://neoparlour.com/support', changefreq: 'monthly', priority: '0.6', category: 'Core Platform', lastmod: today },
        { loc: 'https://neoparlour.com/security', changefreq: 'monthly', priority: '0.6', category: 'Core Platform', lastmod: today },
        { loc: 'https://neoparlour.com/partner-with-us', changefreq: 'weekly', priority: '0.8', category: 'Core Platform', lastmod: today },
        { loc: 'https://neoparlour.com/sitemap', changefreq: 'daily', priority: '0.7', category: 'Core Platform', lastmod: today },
      ];
      items.push(...corePages);

      // 2. Dynamic Cities & Salons
      let cities = ['Pune', 'Mumbai', 'Bangalore', 'Chennai', 'Delhi'];
      try {
        const citiesRes = await axiosInstance.get('/salons/search/cities');
        if (citiesRes.data && citiesRes.data.length > 0) {
          cities = citiesRes.data;
        }
      } catch (e) {
        console.warn("Cities API fallback used:", e.message);
      }

      let allSalons = [];
      for (const city of cities) {
        const cityLower = city.toLowerCase();
        items.push({
          loc: `https://neoparlour.com/salons/${cityLower}`,
          changefreq: 'daily',
          priority: '0.8',
          category: 'Cities & Areas',
          lastmod: today
        });

        try {
          const res = await axiosInstance.get('/salons/by-city', { params: { cityName: city } });
          const salons = res.data?.content || res.data || [];
          allSalons.push(...salons);
        } catch (e) {
          console.warn(`Salons for ${city} skipped:`, e.message);
        }
      }

      // Add Areas for each city
      for (const city of cities) {
        const cityLower = city.toLowerCase();
        const citySalons = allSalons.filter(s => (s.cityName || '').toLowerCase() === cityLower);
        const areas = [...new Set(citySalons.map(s => s.areaName).filter(Boolean))];
        for (const area of areas) {
          items.push({
            loc: `https://neoparlour.com/salons/${cityLower}/${area.toLowerCase()}`,
            changefreq: 'weekly',
            priority: '0.7',
            category: 'Cities & Areas',
            lastmod: today
          });
        }
      }

      // Add Individual Salons
      const generateSlug = (name, city) => {
        const cleanName = (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const cleanCity = (city || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return `${cleanName}-${cleanCity}`;
      };

      for (const salon of allSalons) {
        const salonName = salon.salonName || salon.name;
        if (!salonName) continue;
        const slug = generateSlug(salonName, salon.cityName);
        items.push({
          loc: `https://neoparlour.com/salon/${slug}`,
          changefreq: 'daily',
          priority: '0.8',
          category: 'Salons',
          lastmod: salon.updatedAt ? salon.updatedAt.split('T')[0] : today
        });
      }

      // 3. Dynamic Blogs (Published articles from SEO Admin)
      try {
        const blogsRes = await blogService.getAllBlogs();
        const blogs = blogsRes.data?.content || blogsRes.data || [];
        if (Array.isArray(blogs)) {
          blogs.filter(b => b.isPublished !== false).forEach(blog => {
            const slug = blog.slug || blog.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            if (slug) {
              items.push({
                loc: `https://neoparlour.com/blog/${slug}`,
                changefreq: 'weekly',
                priority: '0.8',
                category: 'Blogs',
                lastmod: blog.updatedAt ? blog.updatedAt.split('T')[0] : (blog.createdAt ? blog.createdAt.split('T')[0] : today)
              });
            }
          });
        }
      } catch (err) {
        console.warn("Could not load dynamic blogs for sitemap:", err.message);
      }

      // 4. Curated SEO Directory combinations
      const cleanParam = (p) => encodeURIComponent(p || '').replace(/&/g, '&amp;');
      const featuredAreas = [
        { city: 'pune', area: 'kothrud', service: 'Hair-Cut' },
        { city: 'pune', area: 'viman-nagar', service: 'Hair-Spa' },
        { city: 'pune', area: 'baner', service: 'Bridal-Makeup' },
        { city: 'mumbai', area: 'bandra', service: 'Keratin-Treatment' },
        { city: 'mumbai', area: 'andheri', service: 'Facial' },
        { city: 'bangalore', area: 'indiranagar', service: 'Hair-Coloring' },
        { city: 'bangalore', area: 'koramangala', service: 'Pedicure' }
      ];

      featuredAreas.forEach(item => {
        items.push({
          loc: `https://neoparlour.com/${item.city}/Best-${item.service}-in-${item.area}`,
          changefreq: 'daily',
          priority: '0.7',
          category: 'SEO Directory',
          lastmod: today
        });
      });

      setUrlList(items);

      // Build XML string
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      items.forEach(u => {
        xml += `  <url>\n`;
        xml += `    <loc>${u.loc}</loc>\n`;
        xml += `    <lastmod>${u.lastmod}</lastmod>\n`;
        xml += `    <changefreq>${u.changefreq}</changefreq>\n`;
        xml += `    <priority>${u.priority}</priority>\n`;
        xml += `  </url>\n`;
      });
      xml += `</urlset>`;

      setXmlContent(xml);

    } catch (error) {
      console.error("Failed to generate sitemap data:", error);
      toast.error("Failed to compile complete sitemap URLs");
    } finally {
      setLoading(false);
    }
  };

  // Filtered list
  const filteredUrls = useMemo(() => {
    return urlList.filter(item => {
      const matchCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchSearch = !searchQuery.trim() || 
        item.loc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [urlList, selectedCategory, searchQuery]);

  const handleCopyXML = () => {
    if (!xmlContent) return;
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    toast.success('XML Sitemap copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadXML = () => {
    if (!xmlContent) return;
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Downloaded sitemap.xml 🚀');
  };

  const handleOpenRawWindow = () => {
    if (!xmlContent) return;
    const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Metrics
  const salonCount = urlList.filter(u => u.category === 'Salons').length;
  const blogCount = urlList.filter(u => u.category === 'Blogs').length;
  const dirCount = urlList.filter(u => u.category === 'SEO Directory' || u.category === 'Cities & Areas').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 antialiased flex flex-col justify-between">

      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/20">
                    Sitemaps.org Protocol 0.9
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
                    XML Sitemap Explorer
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 max-w-2xl">
                Dynamic XML index generated for search engines (Google, Bing) and SEO crawlers. Automatically catalogs verified salons, published editorial blogs, city hubs, and service landing pages.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleCopyXML}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 shadow-2xs transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-500" />}
                <span>{copied ? 'Copied' : 'Copy XML'}</span>
              </button>

              <button
                onClick={handleDownloadXML}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 shadow-2xs transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download .xml</span>
              </button>

              <button
                onClick={handleOpenRawWindow}
                disabled={loading}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                title="Open raw XML in browser tab"
              >
                <ExternalLink className="w-4 h-4 text-slate-500" />
                <span>Raw Feed</span>
              </button>

              <button
                onClick={() => navigate(isInsideAdmin ? '/admin/robots' : '/robots.txt')}
                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 to-[#FF0B01] hover:from-red-700 hover:to-red-600 text-white shadow-md shadow-red-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>robots.txt</span>
              </button>
            </div>
          </div>

          {/* Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Indexed URLs</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <span>{loading ? '...' : urlList.length}</span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">Active</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Salons & Branches</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {loading ? '...' : salonCount} Verified
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Editorial Blogs</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {loading ? '...' : blogCount} Articles
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">Directory & Cities</div>
              <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                {loading ? '...' : dirCount} Landings
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {/* View Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('visual')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'visual'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Visual Explorer ({filteredUrls.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('raw')}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'raw'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Raw XML Source</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-auto sm:min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search indexed URL or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-semibold focus:border-red-500 outline-none transition"
            />
          </div>

        </div>

        {/* Category Filters */}
        {activeTab === 'visual' && (
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {['ALL', 'Core Platform', 'Salons', 'Blogs', 'Cities & Areas', 'SEO Directory'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Tab 1: Visual Explorer Table */}
        {activeTab === 'visual' ? (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 shadow-sm overflow-hidden">
            
            {loading ? (
              <div className="p-16 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-bold text-slate-400">Compiling dynamic sitemap URLs from live database...</p>
              </div>
            ) : filteredUrls.length === 0 ? (
              <div className="p-16 text-center space-y-2">
                <p className="text-sm font-bold text-slate-600 dark:text-zinc-300">No URLs match your search filter</p>
                <p className="text-xs text-slate-400">Try clearing the search query or selecting a different category.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-zinc-800/50 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-zinc-800">
                    <tr>
                      <th className="py-3.5 px-3 sm:px-5">URL Location (loc)</th>
                      <th className="py-3.5 px-3 sm:px-4">Category</th>
                      <th className="py-3.5 px-3 sm:px-4 hidden sm:table-cell">Frequency</th>
                      <th className="py-3.5 px-3 sm:px-4 text-center">Priority</th>
                      <th className="py-3.5 px-3 sm:px-4 text-right hidden md:table-cell">Last Modified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {filteredUrls.map((item, idx) => (
                      <tr 
                        key={idx}
                        className="hover:bg-slate-50/70 dark:hover:bg-zinc-800/40 transition group"
                      >
                        {/* URL Location */}
                        <td className="py-3 px-5 max-w-md">
                          <div className="flex items-center gap-2">
                            <a
                              href={item.loc}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition"
                            >
                              {item.loc}
                            </a>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(item.loc);
                                toast.success('URL copied!');
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded transition cursor-pointer"
                              title="Copy URL"
                            >
                              <Copy className="w-3 h-3 text-slate-400" />
                            </button>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.category === 'Core Platform' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400' :
                            item.category === 'Salons' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                            item.category === 'Blogs' ? 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400' :
                            item.category === 'Cities & Areas' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                            'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                          }`}>
                            {item.category}
                          </span>
                        </td>

                        {/* Frequency */}
                        <td className="py-3 px-3 sm:px-4 font-semibold text-slate-600 dark:text-zinc-300 capitalize hidden sm:table-cell">
                          {item.changefreq}
                        </td>

                        {/* Priority */}
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <span className={`inline-flex items-center justify-center font-black px-2 py-0.5 rounded-md text-[11px] ${
                            parseFloat(item.priority) >= 0.9 ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                            parseFloat(item.priority) >= 0.7 ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                            'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}>
                            {item.priority}
                          </span>
                        </td>

                        {/* Lastmod */}
                        <td className="py-3 px-3 sm:px-4 text-right font-mono text-[11px] text-slate-400 hidden md:table-cell">
                          {item.lastmod}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Footer Summary */}
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/30 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Showing {filteredUrls.length} of {urlList.length} indexed URLs</span>
              <button
                onClick={generateSitemapData}
                className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-sync Live URLs</span>
              </button>
            </div>

          </div>
        ) : (
          /* Tab 2: Raw XML View */
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  Generated XML Markup
                </h3>
                <p className="text-xs text-slate-400">
                  Standard Sitemaps schema output with XML declaration and urlset envelope.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyXML}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <pre className="p-5 rounded-2xl bg-slate-900 text-amber-400 font-mono text-xs overflow-x-auto leading-relaxed max-h-[600px] custom-scrollbar selection:bg-amber-500 selection:text-black">
              {xmlContent}
            </pre>
          </div>
        )}

      </div>

      {/* Footer - only render SEOFooter when viewed as standalone public customer page, not inside OwnerLayout dashboard */}
      {!isInsideAdmin && (
        <div className="w-full bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 mt-12">
          <SEOFooter />
        </div>
      )}

    </div>
  );
}
