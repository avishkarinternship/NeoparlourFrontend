import React from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import ManageSideBar from './ManageSideBar';

export default function OwnerManageLayout() {
  const context = useOutletContext() || {};
  const isDarkMode = context.isDarkMode || document.documentElement.classList.contains('dark');

  return (
    <div className={`flex flex-1 min-w-0 transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-[#FAFAFA] text-gray-800'
    }`}>
      <ManageSideBar />
      <div className="flex-1 min-w-0">
        <Outlet context={{ ...context, isDarkMode }} />
      </div>
    </div>
  );
}

