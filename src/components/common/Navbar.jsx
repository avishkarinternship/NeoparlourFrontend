import React from 'react';

import logoIcon from '../../assets/Owner/logo_icon.svg';
import profileIcon from '../../assets/Owner/profile.jpg';

const Navbar = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between sticky top-0 z-50">

      {/* Left Logo Area */}
      <div className="w-20 md:w-44 lg:w-64 h-full flex items-center px-3 sm:px-4 md:px-6 border-r border-gray-200 flex-shrink-0">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar} 
            className="mr-3 p-1 text-gray-500 hover:text-gray-900 lg:hidden focus:outline-none flex-shrink-0 cursor-pointer"
            aria-label="Toggle Sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        )}
        <div className="flex items-center space-x-2.5 cursor-pointer">
          <img
            src={logoIcon}
            alt="NeoParlour Logo"
            className="w-7 h-7 object-contain flex-shrink-0"
          />
          <span className="text-gray-900 text-base font-bold tracking-tight hidden md:inline">
            NeoParlour
          </span>
        </div>
      </div>

      {/* Right Container Elements */}
      <div className="flex items-center justify-end flex-1 px-3 sm:px-6 space-x-2.5 sm:space-x-6 min-w-0">

        {/* Pill-Shaped Inline Search Field */}
        <div className="relative flex-1 max-w-[140px] sm:max-w-xs md:max-w-md transition-all duration-300">
          <div className="border border-gray-300 rounded-full p-1 pl-3 sm:pl-4 flex items-center bg-white focus-within:ring-1 focus-within:ring-red-500 focus-within:border-red-500 transition-all duration-200">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent text-[11px] sm:text-xs text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            <button className="hidden sm:block bg-red-600 text-white px-5 py-1.5 text-xs font-bold rounded-full hover:bg-red-700 uppercase tracking-wider transition-colors duration-150 flex-shrink-0">
              Search
            </button>
          </div>
        </div>

        {/* Notification Bell with Badge */}
        <button className="text-gray-400 hover:text-gray-600 relative transition-colors">
          <svg className="w-[22px] h-[22px]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1-1.5-1s-1.5.17-1.5 1v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white">
            1
          </span>
        </button>

        {/* User Identity Profile Block */}
        <div className="flex items-center space-x-2 cursor-pointer group">
          {/* Circular image frame container */}
          <div className="h-8 w-8 rounded-full border border-gray-900 flex items-center justify-center overflow-hidden">
            <img
              src={profileIcon}
              alt="Prowin Wadkar Profile"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <span className="text-xs font-bold text-gray-800 tracking-tight hidden sm:inline group-hover:text-gray-600 transition-colors">
            Prowin Wadkar
          </span>
        </div>

      </div>
    </header>
  );
}

export default Navbar;