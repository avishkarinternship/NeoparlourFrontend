import React, { useState, useMemo } from 'react';
import { 
  Globe, Search, ExternalLink, Copy, Check, Filter, Layers, 
  MapPin, Sparkles, RefreshCw, ArrowUpRight, BarChart3, Database,
  Eye, CheckCircle2, SlidersHorizontal, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { CITY_METRO_CLUSTERS } from '../../services/searchService';

// Standard high-intent SEO service keywords
export const SEO_SERVICE_CATEGORIES = {
  'Hair Services': [
    'Hair Cut', 'Hair Styling', 'Hair Wash', 'Blow Dry', 'Hair Coloring', 
    'Highlights Streaks', 'Hair Spa', 'Keratin Treatment', 'Hair Smoothening', 
    'Hair Straightening', 'Hair Fall Treatment', 'Dandruff Treatment'
  ],
  'Skin & Facials': [
    'Facial', 'Cleanup', 'Skin Polishing', 'De-Tan Treatment', 
    'Face Treatment', 'Anti-Aging Treatment', 'Acne Treatment', 'Skin Brightening Treatment'
  ],
  'Spa & Wellness': [
    'Head Massage', 'Body Massage', 'Relaxation Massage', 'Aroma Therapy', 
    'Body Scrub', 'Body Wrap'
  ],
  'Bridal & Makeup': [
    'Party Makeup', 'Bridal Makeup', 'Engagement Makeup', 'Pre-Bridal Package', 
    'Bridal Hair', 'HD Makeup'
  ],
  'Waxing & Threading': [
    'Full Body Waxing', 'Full Face Waxing', 'Eyebrow Shaping', 'Threading', 'Waxing'
  ],
  'Nails & Grooming': [
    'Manicure', 'Pedicure', 'Nail Art', 'Nail Extensions', 'Beard Trim', 'Shaving'
  ]
};

const ALL_SERVICES = Object.values(SEO_SERVICE_CATEGORIES).flat();

const METRO_CITIES = [
  'Pune', 'Mumbai', 'Bengaluru', 'Delhi', 'Hyderabad', 
  'Kolkata', 'Chennai', 'Ahmedabad', 'Chandigarh', 'Jaipur', 
  'Lucknow', 'Kochi', 'Indore', 'Surat', 'Coimbatore', 'Nagpur'
];

export default function AdminSeoDirectory() {
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 15;

  // Derive all active areas for the selected city
  const cityAreas = useMemo(() => {
    const key = selectedCity.toLowerCase();
    const clusters = CITY_METRO_CLUSTERS[key] || [];
    // Filter and format areas (capitalize first letter)
    return clusters
      .filter(area => area.length > 2 && area.toLowerCase() !== key)
      .map(area => area.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
  }, [selectedCity]);

  // Filter services by category
  const activeServices = useMemo(() => {
    if (selectedCategory === 'ALL') return ALL_SERVICES;
    return SEO_SERVICE_CATEGORIES[selectedCategory] || ALL_SERVICES;
  }, [selectedCategory]);

  // Generate dynamic directory list
  const generatedDirectory = useMemo(() => {
    const items = [];
    const searchLower = searchQuery.toLowerCase().trim();

    for (const area of cityAreas) {
      for (const service of activeServices) {
        const matchesSearch = !searchLower || 
          area.toLowerCase().includes(searchLower) || 
          service.toLowerCase().includes(searchLower) ||
          selectedCity.toLowerCase().includes(searchLower);

        if (matchesSearch) {
          const path = `/seo-salons/${encodeURIComponent(selectedCity)}/${encodeURIComponent(area)}/${encodeURIComponent(service)}`;
          const metaTitle = `Best ${service} in ${area}, ${selectedCity} - Verified Salons & Reviews | NeoParlour`;
          items.push({
            id: `${selectedCity}-${area}-${service}`,
            city: selectedCity,
            area,
            service,
            path,
            metaTitle,
            priority: '0.80',
            changeFreq: 'Daily',
            inSitemap: true
          });
        }
      }
    }
    return items;
  }, [selectedCity, cityAreas, activeServices, searchQuery]);

  // Paginated directory items
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return generatedDirectory.slice(start, start + itemsPerPage);
  }, [generatedDirectory, page]);

  const totalPages = Math.ceil(generatedDirectory.length / itemsPerPage) || 1;

  const handleCopyUrl = (item) => {
    const fullUrl = `https://neoparlour.com${item.path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedUrl(item.id);
    toast.success('SEO Landing Page URL copied to clipboard!');
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleOpenLive = (item) => {
    window.open(item.path, '_blank', 'noopener,noreferrer');
  };

  const handleExportCsv = () => {
    const headers = ['City', 'Area', 'Service', 'SEO Landing Path', 'Google Priority', 'Crawl Frequency'];
    const rows = generatedDirectory.slice(0, 1000).map(i => [
      `"${i.city}"`,
      `"${i.area}"`,
      `"${i.service}"`,
      `"https://neoparlour.com${i.path}"`,
      i.priority,
      i.changeFreq
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `neoparlour_seo_directory_${selectedCity.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${Math.min(generatedDirectory.length, 1000)} SEO URLs to CSV!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5 sm:space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20 flex items-center gap-1">
              <Globe className="w-3 h-3" /> Directory Indexer
            </span>
            <span className="text-xs font-semibold text-slate-400">Programmatic SEO Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            SEO Salons Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
            Browse and audit high-intent city & area landing pages generated for Google indexing and sitemap crawler feeds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> View Live Sitemap
          </a>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Metros Tracked</span>
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {METRO_CITIES.length}
          </div>
          <span className="text-[10px] text-slate-400">Major metropolitan hubs</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">{selectedCity} Clusters</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {cityAreas.length}
          </div>
          <span className="text-[10px] text-slate-400">Active localities in {selectedCity}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Target Services</span>
            <Database className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {ALL_SERVICES.length}
          </div>
          <span className="text-[10px] text-slate-400">High-intent keyword slugs</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 dark:text-zinc-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Matching URLs</span>
            <BarChart3 className="w-4 h-4 text-[#FF2A14]" />
          </div>
          <div className="text-2xl font-black text-[#FF2A14]">
            {generatedDirectory.length.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400">Available SEO directory URLs</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          
          {/* City Selector */}
          <div className="w-full lg:w-48">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
              Select City
            </label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
            >
              {METRO_CITIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="w-full lg:w-56">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
            >
              <option value="ALL">All Categories ({ALL_SERVICES.length})</option>
              {Object.keys(SEO_SERVICE_CATEGORIES).map(cat => (
                <option key={cat} value={cat}>
                  {cat} ({SEO_SERVICE_CATEGORIES[cat].length})
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="flex-1">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">
              Search Area or Service
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Filter by locality (e.g. Kothrud, Baner) or service (e.g. Keratin, Facial)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#FF2A14]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              <tr>
                <th className="px-3 sm:px-5 py-3.5">Target Locality & Service</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Meta Title Preview</th>
                <th className="px-3 sm:px-5 py-3.5 text-center hidden sm:table-cell">Google Priority</th>
                <th className="px-3 sm:px-5 py-3.5 text-center hidden sm:table-cell">Sitemap Status</th>
                <th className="px-3 sm:px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800 font-medium">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-400 dark:text-zinc-500">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-bold text-slate-700 dark:text-zinc-300">No matching SEO Directory URLs found</p>
                    <p className="text-[11px] mt-0.5">Try choosing a different city or clearing the search query.</p>
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-3 sm:px-5 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className="font-black text-slate-900 dark:text-white">
                          {item.service}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300">
                          {item.area}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                          {item.city}
                        </span>
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5 truncate max-w-[200px] sm:max-w-sm">
                        {item.path}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell max-w-md">
                      <p className="text-slate-600 dark:text-zinc-300 text-[11px] line-clamp-1">
                        {item.metaTitle}
                      </p>
                    </td>

                    <td className="px-3 sm:px-5 py-3.5 text-center hidden sm:table-cell">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px]">
                        {item.priority}
                      </span>
                    </td>

                    <td className="px-3 sm:px-5 py-3.5 text-center hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" /> Indexed
                      </span>
                    </td>

                    <td className="px-3 sm:px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition cursor-pointer"
                          title="Copy Full SEO URL"
                        >
                          {copiedUrl === item.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenLive(item)}
                          className="p-1.5 rounded-lg bg-[#FF2A14] hover:bg-red-700 text-white transition cursor-pointer flex items-center gap-1"
                          title="Open Live Customer Landing Page in New Tab"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-4 sm:px-5 py-3 border-t border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs font-semibold">
            <span className="text-slate-400 text-[11px] sm:text-xs">
              Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, generatedDirectory.length)} of {generatedDirectory.length.toLocaleString()} URLs
            </span>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer text-xs"
              >
                Previous
              </button>
              <span className="px-2 text-slate-600 dark:text-zinc-300 text-xs">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer text-xs"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
