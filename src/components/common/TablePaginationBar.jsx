import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TablePaginationBar = ({
  page = 0,
  totalPages = 1,
  totalElements = 0,
  size = 10,
  onPageChange,
  onSizeChange,
  isDarkMode = false
}) => {
  if (totalPages <= 0) return null;

  const startRecord = totalElements > 0 ? page * size + 1 : 0;
  const endRecord = Math.min((page + 1) * size, totalElements);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl border shadow-2xs transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-300' : 'bg-white border-slate-100 text-slate-600'
    }`}>
      
      {/* Total Count Indicator */}
      <div className="text-xs font-semibold">
        {totalElements > 0 ? (
          <>
            Showing <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{startRecord}-{endRecord}</span> of <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalElements.toLocaleString()}</span> invitations
          </>
        ) : (
          <span>No invitations</span>
        )}
      </div>

      {/* Page Selector & Size Selector */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-400">Rows:</span>
          <select
            value={size}
            onChange={(e) => onSizeChange && onSizeChange(Number(e.target.value))}
            className={`px-2.5 py-1 rounded-xl border text-xs font-bold focus:outline-none cursor-pointer ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Page Navigation Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange && onPageChange(page - 1)}
            disabled={page === 0}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              page === 0
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-zinc-800 text-slate-400'
                : isDarkMode
                  ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
            }`}
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-bold px-2">
            Page {page + 1} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange && onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              page >= totalPages - 1
                ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-zinc-800 text-slate-400'
                : isDarkMode
                  ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
            }`}
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default TablePaginationBar;
