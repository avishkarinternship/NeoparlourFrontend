import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FileCode, Bot, Search, ExternalLink, Globe, Sparkles, MapPin, 
  Layers, ArrowRight, ShieldCheck, BookOpen 
} from "lucide-react";
import SEOFooter from "../common/SEOFooter";

const SITEMAP_SECTIONS = [
  {
    title: "Core Platform & Discovery",
    icon: Globe,
    description: "Main customer navigation and foundational company portals",
    items: [
      { name: "Home", path: "/" },
      { name: "Salons Directory", path: "/salons" },
      { name: "SEO Salons by Service", path: "/seo-salons" },
      { name: "Client Testimonials", path: "/client-testimonials" },
      { name: "Partner With Us", path: "/partner-with-us" },
      { name: "About Us", path: "/about" },
      { name: "Security & Compliance", path: "/security" },
      { name: "Support & Help Centre", path: "/support" },
      { name: "Customer Offers", path: "/customer/offers" },
    ],
  },
  {
    title: "City Salon Directories",
    icon: MapPin,
    description: "Explore top verified salons in major metropolitan areas",
    items: [
      { name: "Pune Salons", path: "/salons/pune" },
      { name: "Mumbai Salons", path: "/salons/mumbai" },
      { name: "Bangalore Salons", path: "/salons/bangalore" },
      { name: "Chennai Salons", path: "/salons/chennai" },
      { name: "Delhi Salons", path: "/salons/delhi" },
      { name: "Kothrud, Pune", path: "/salons/pune/kothrud" },
      { name: "Viman Nagar, Pune", path: "/salons/pune/viman-nagar" },
      { name: "Bandra, Mumbai", path: "/salons/mumbai/bandra" },
      { name: "Indiranagar, Bangalore", path: "/salons/bangalore/indiranagar" },
    ],
  },
  {
    title: "SaaS Platform Features",
    icon: Layers,
    description: "Salon management tools, workflows and owner automation",
    items: [
      { name: "Appointment Management", path: "/features" },
      { name: "Customer Membership", path: "/features" },
      { name: "Staff & Attendance Rosters", path: "/features" },
      { name: "Service & Package Builder", path: "/features" },
      { name: "Customer CRM", path: "/features" },
      { name: "Reports & Financial Analytics", path: "/features" },
      { name: "Salon Inventory Control", path: "/features" },
      { name: "Automated GST Invoicing", path: "/features" },
    ],
  },
  {
    title: "Resources & Editorial",
    icon: BookOpen,
    description: "Beauty tips, haircut styling guides and case studies",
    items: [
      { name: "NeoParlour Blog", path: "/blogs" },
      { name: "Customer Case Studies", path: "/case-studies" },
      { name: "Video Walkthroughs", path: "/videos" },
      { name: "Influencer Program", path: "/influencer-program" },
      { name: "Product Updates", path: "/updates" },
    ],
  },
  {
    title: "SEO Engine & Search Crawler Specs",
    icon: Sparkles,
    description: "Machine-readable indexes and crawl budget directives",
    items: [
      { name: "XML Machine Sitemap (sitemap.xml)", path: "/sitemap.xml", badge: "XML 0.9" },
      { name: "Robots Exclusion Protocol (robots.txt)", path: "/robots.txt", badge: "Directives" },
      { name: "SEO Hyper-Local Directory", path: "/seo-salons", badge: "Targeted" },
    ],
  },
];

export default function Sitemap() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const handleNavigate = (path, name, e) => {
    e.preventDefault();
    setSelectedItem(name);
    if (path) {
      setTimeout(() => {
        navigate(path);
      }, 150);
    }
  };

  const filteredSections = SITEMAP_SECTIONS.map(section => {
    const matchingItems = section.items.filter(item => 
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...section, items: matchingItems };
  }).filter(sec => sec.items.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans text-slate-900 dark:text-zinc-100 antialiased flex flex-col justify-between">
      
      {/* Hero Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-md border border-red-500/20">
                Site Architecture & Navigation
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                NeoParlour Sitemap
              </h1>
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 max-w-2xl">
                A structured overview of all customer, salon partner, and editorial pages across the NeoParlour beauty ecosystem.
              </p>
            </div>

            {/* Quick SEO Links */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => navigate('/sitemap.xml')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FileCode className="w-4 h-4" />
                <span>XML Machine Sitemap</span>
              </button>

              <button
                onClick={() => navigate('/robots.txt')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>robots.txt</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-8 relative max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all pages, city guides, features, and blog links..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 focus:border-red-500 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none transition"
            />
          </div>

        </div>
      </div>

      {/* Main Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        
        {filteredSections.map((section, sIdx) => {
          const IconComp = section.icon || Globe;
          return (
            <div 
              key={sIdx}
              className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-zinc-800">
                <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-600 border border-red-500/20">
                  <IconComp className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    {section.title}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {section.description}
                  </p>
                </div>
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {section.items.map((item, iIdx) => {
                  const isActive = selectedItem === item.name;
                  return (
                    <button
                      key={iIdx}
                      onClick={(e) => handleNavigate(item.path, item.name, e)}
                      className={`p-3.5 rounded-2xl text-left transition flex items-center justify-between group cursor-pointer border ${
                        isActive
                          ? 'bg-red-600 text-white border-red-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-zinc-800/40 hover:bg-slate-100 dark:hover:bg-zinc-800 border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-200'
                      }`}
                    >
                      <span className="text-xs font-bold truncate group-hover:text-red-600 dark:group-hover:text-red-400 transition">
                        {item.name}
                      </span>
                      
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {item.badge && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                            {item.badge}
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition" />
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          );
        })}

      </div>

      {/* Footer */}
      <div className="w-full bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-zinc-800 mt-12">
        <SEOFooter />
      </div>

    </div>
  );
}