import React from 'react';
import { Search, Filter } from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Records' },
  { id: 'PENDING', label: '🟡 Pending Review' },
  { id: 'APPROVED', label: '🟢 Approved' },
  { id: 'REJECTED', label: '🔴 Rejected' }
];

const DOCUMENT_TYPES = [
  { id: '', label: 'All Document Types' },
  { id: 'BUSINESS_LICENSE', label: 'Shop Act / License' },
  { id: 'PAN_CARD', label: 'PAN Card' },
  { id: 'GST_CERTIFICATE', label: 'GST Certificate' },
  { id: 'ID_PROOF', label: 'ID Proof (Aadhaar)' },
  { id: 'OTHERS', label: 'Other Documents' }
];

const KycFilterBar = ({ filters, setFilters, isDarkMode = false }) => {
  return (
    <div className={`p-4 sm:p-5 rounded-3xl border space-y-4 ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-150'
    }`}>
      
      {/* Top Status Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = (filters.status || 'ALL') === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilters(prev => ({ ...prev, status: tab.id, page: 0 }))}
              className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#FF2A14] text-white shadow-md shadow-red-500/20'
                  : isDarkMode
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Document Type Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 0 }))}
            placeholder="Search by Salon Name, Owner Name or Phone..."
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold border focus:outline-none focus:border-[#FF2A14] transition ${
              isDarkMode
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Document Type Dropdown */}
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={filters.documentType || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, documentType: e.target.value, page: 0 }))}
            className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold border focus:outline-none focus:border-[#FF2A14] transition appearance-none cursor-pointer ${
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
