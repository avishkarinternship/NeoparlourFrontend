import React from 'react';
import { Search, Filter, Calendar } from 'lucide-react';

const STATUS_TABS = [
  { id: 'ALL', label: 'All Requests' },
  { id: 'PENDING', label: '🟡 Pending Review' },
  { id: 'COMPLETED', label: '🟢 Paid & Completed' },
  { id: 'REJECTED', label: '🔴 Rejected' }
];

const PAYOUT_METHODS = [
  { id: '', label: 'All Payout Methods' },
  { id: 'UPI', label: 'UPI Transfer' },
  { id: 'BANK_TRANSFER', label: 'Bank Account Transfer' }
];

const AdminPayoutFilterBar = ({ filters, setFilters, isDarkMode = false }) => {
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

      {/* Filter Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        
        {/* Search Input (Staff Name / UPI / UTR) */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 0 }))}
            placeholder="Search Staff Name, UPI ID or UTR..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
              isDarkMode
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        {/* Payout Method Select */}
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filters.payoutMethod || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, payoutMethod: e.target.value, page: 0 }))}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition appearance-none cursor-pointer ${
              isDarkMode
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            {PAYOUT_METHODS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Date Range - From Date */}
        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 0 }))}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
              isDarkMode
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
            title="Start Date"
          />
        </div>

        {/* Date Range - To Date */}
        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 0 }))}
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium border focus:outline-none focus:border-[#FF2A14] transition ${
              isDarkMode
                ? 'bg-zinc-800 border-zinc-700 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
            title="End Date"
          />
        </div>

      </div>

    </div>
  );
};

export default AdminPayoutFilterBar;
