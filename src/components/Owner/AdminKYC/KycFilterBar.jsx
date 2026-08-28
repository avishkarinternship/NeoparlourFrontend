import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Records' },
  { id: 'PENDING', label: '🟡 Pending Review' },
  { id: 'APPROVED', label: '🟢 Approved' },
  { id: 'REJECTED', label: '🔴 Rejected' }
];

const DOCUMENT_TYPES = [
  { id: '', label: 'All Document Types' },
  { id: 'AADHAAR_OR_GOVERNMENT_ID', label: 'Aadhaar / Government ID' },
  { id: 'PAN_CARD', label: 'PAN Card' },
  { id: 'SHOP_ESTABLISHMENT_LICENSE', label: 'Shop / Establishment License' },
  { id: 'BANK_ACCOUNT_PROOF', label: 'Bank Account Proof' }
];

const getIsDarkMode = (prop) => {
  if (prop !== undefined) return prop;
  if (typeof document === 'undefined' || !document || !document.documentElement) return false;
  try {
    return document.documentElement.classList.contains('dark') || (typeof localStorage !== 'undefined' && localStorage.getItem('theme') === 'dark');
  } catch (e) {
    return false;
  }
};

const KycFilterBar = ({ filters, setFilters, isDarkMode: isDarkModeProp }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => getIsDarkMode(isDarkModeProp));

  useEffect(() => {
    const checkDark = () => {
      setIsDarkMode(getIsDarkMode(isDarkModeProp));
    };

    checkDark();

    let observer = null;
    if (typeof document !== 'undefined' && document && document.documentElement && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => checkDark());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', checkDark);
    }

    return () => {
      if (observer) observer.disconnect();
      if (typeof window !== 'undefined') window.removeEventListener('storage', checkDark);
    };
  }, [isDarkModeProp]);

  return (
    <div className={`p-4 rounded-2xl border transition-all duration-300 space-y-3.5 ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200 shadow-2xs'
    }`}>
      
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = (filters.status || 'ALL') === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilters(prev => ({ ...prev, status: tab.id, page: 0 }))}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#FF2A14] text-white shadow-2xs'
                  : isDarkMode
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-750'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Document Category Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 0 }))}
            placeholder="Search by Salon Name, Owner Name or Phone..."
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
              isDarkMode
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Document Category Dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filters.documentType || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value, page: 0 }))}
            className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition appearance-none cursor-pointer ${
              isDarkMode
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            {DOCUMENT_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>
        </div>

      </div>

    </div>
  );
};

export default KycFilterBar;
