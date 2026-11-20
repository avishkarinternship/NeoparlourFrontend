import React, { Suspense } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';

export default function OwnerManageLayout() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || document.documentElement.classList.contains('dark');

  return (
    <div className={`flex flex-1 min-w-0 transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#FAFAFA] text-gray-800'
    }`}>
      <div className="flex-1 min-w-0">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#ff0b01] rounded-full animate-spin" />
          </div>
        }>
          <Outlet context={{ ...context, isDarkMode }} />
        </Suspense>
      </div>
    </div>
  );
}
