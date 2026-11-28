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
  isDarkMode = false,
  onSelectStaff
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
            className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs font-bold border focus:outline-none focus:border-brand-primary transition-all ${
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
                onChange={(e) => {
                  const val = e.target.value;
                  updateFilter('staffId', val);
                  if (onSelectStaff) {
                    onSelectStaff(val === '' || val === 'ALL' ? 'ALL' : Number(val));
                  }
                }}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-zinc-100 focus:outline-none cursor-pointer"
              >
                <option value="">All Staff Members ({staffList.length})</option>
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

          {/* Reset Filters Button */}
          <button
            onClick={() => {
              resetFilters();
              if (onSelectStaff) {
                onSelectStaff('ALL');
              }
            }}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>

      {/* Status Filter Badges */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3 text-brand-primary" style={{ color: 'var(--brand-primary)' }} /> Status:
        </span>
        {STATUS_OPTIONS.map(opt => {
          const isSelected = (filters.status || 'ALL') === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => updateFilter('status', opt.value)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-primary text-white shadow-xs'
                  : isDarkMode
                    ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              style={isSelected ? { backgroundColor: 'var(--brand-primary)', color: '#ffffff' } : {}}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

    </div>
  );
};

export default InvitationFilterBar;
