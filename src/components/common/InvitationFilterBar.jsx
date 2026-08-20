import React from 'react';
import { Search, Filter, RotateCcw, Calendar, User, Gift, X } from 'lucide-react';

const STATUS_OPTIONS = [
  { label: 'All', value: 'ALL' },
  { label: '🟡 Sent', value: 'SENT' },
  { label: '🔵 Clicked', value: 'CLICKED' },
  { label: '🟣 Installed', value: 'INSTALLED' },
  { label: '🟢 Registered', value: 'REGISTERED' },
  { label: '❇️ Booked', value: 'BOOKED' }
];

const InvitationFilterBar = ({
  filters,
  updateFilter,
  resetFilters,
  staffList = [],
  isDarkMode = false
}) => {
  return (
    <div className={`p-4 sm:p-5 rounded-3xl border shadow-2xs space-y-4 transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-slate-100 text-slate-800'
    }`}>
      
      {/* Top Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, mobile, or invite code..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs font-bold border focus:outline-none focus:border-[#FF0B01] transition-all ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Staff & Reward Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          
          {/* Staff Filter Dropdown (Owner View) */}
          {staffList.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-2xl">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filters.staffId || ''}
                onChange={(e) => updateFilter('staffId', e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none cursor-pointer"
              >
                <option value="">All Staff Members</option>
                {staffList.map(s => (
                  <option key={s.id} value={s.id} className="dark:bg-zinc-900 text-slate-900 dark:text-white">
                    {s.name || s.staffName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reward Status Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-3 py-1.5 rounded-2xl">
            <Gift className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filters.rewardGiven ?? ''}
              onChange={(e) => updateFilter('rewardGiven', e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none cursor-pointer"
            >
              <option value="">All Rewards</option>
              <option value="true" className="dark:bg-zinc-900">Reward Disbursed</option>
              <option value="false" className="dark:bg-zinc-900">Reward Pending</option>
            </select>
          </div>

          {/* Date Range Pickers */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 px-2.5 py-1 rounded-2xl text-[11px] font-bold">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => updateFilter('startDate', e.target.value)}
              className="bg-transparent text-slate-800 dark:text-zinc-100 focus:outline-none cursor-pointer text-[11px]"
              title="Start Date"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => updateFilter('endDate', e.target.value)}
              className="bg-transparent text-slate-800 dark:text-zinc-100 focus:outline-none cursor-pointer text-[11px]"
              title="End Date"
            />
          </div>

          {/* Reset Filters */}
          <button
            type="button"
            onClick={resetFilters}
            className="p-2 rounded-2xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Status Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none">
        {STATUS_OPTIONS.map((st) => {
          const isActive = (filters.status || 'ALL') === st.value;
          return (
            <button
              key={st.value}
              type="button"
              onClick={() => updateFilter('status', st.value)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#FF0B01] text-white shadow-xs'
                  : isDarkMode
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default InvitationFilterBar;
