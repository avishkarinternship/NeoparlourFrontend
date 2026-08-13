import React, { useState } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';

// Icons
import scheduleIcon from '../../../assets/Owner/Dashboard/SideBar/home_icon.svg';
import serviceIcon from '../../../assets/Owner/Dashboard/SideBar/manage_icon.svg';
import inventoryIcon from '../../../assets/Owner/Dashboard/SideBar/analytics_icon.svg';
import staffIcon from '../../../assets/Owner/Dashboard/SideBar/team_icon.svg';

const ManageSideBar = () => {
  const outletContext = useOutletContext() || {};
  const isDarkMode = outletContext.isDarkMode || document.documentElement.classList.contains('dark');

  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('manageSidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const toggleSidebar = () => {
    setIsOpen(prev => {
      const next = !prev;
      localStorage.setItem('manageSidebarOpen', JSON.stringify(next));
      window.dispatchEvent(new Event('manageSidebarToggle'));
      return next;
    });
  };

  const subMenu = [
    {
      label: 'Schedule',
      icon: scheduleIcon,
      path: '/owner/manage/schedule'
    },
    {
      label: 'Walk-in Booking',
      icon: scheduleIcon,
      path: '/owner/manage/walk-in'
    },
    {
      label: 'Service',
      icon: serviceIcon,
      path: '/owner/manage/services'
    },
    {
      label: 'Inventory',
      icon: inventoryIcon,
      path: '/owner/manage/inventory'
    },
    {
      label: 'Staff',
      icon: staffIcon,
      path: '/owner/manage/staff'
    },
    {
      label: 'Feedback',
      icon: serviceIcon,
      path: '/owner/manage/feedback'
    },
    {
      label: 'Home Services',
      icon: scheduleIcon,
      path: '/owner/manage/home-services'
    },
    {
      label: 'Subscription',
      icon: inventoryIcon,
      path: '/owner/manage/subscription'
    },
    {
      label: 'Add Offers',
      icon: serviceIcon,
      path: '/owner/manage/add-offers'
    },
    {
      label: 'Add Products',
      icon: inventoryIcon,
      path: '/owner/manage/add-products'
    },
    {
      label: 'Add Packages',
      icon: serviceIcon,
      path: '/owner/manage/add-package'
    },
  ];

  return (
    <div 
      className={`min-h-full py-6 flex flex-col justify-between hidden md:flex flex-shrink-0 relative transition-all duration-300 ease-in-out z-30
        ${isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white text-gray-800'}
        ${isOpen ? 'w-56 border-r border-gray-200 dark:border-zinc-700' : 'w-0 border-r-0'}`}
    >

      {/* Navigation Links */}
      <div 
        className={`space-y-1 transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'px-3 w-56 opacity-100' : 'px-0 w-0 opacity-0 pointer-events-none'}`}
      >

        {subMenu.map((item, idx) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-150 relative sidebar-btn cursor-pointer
              
              ${isActive
                  ? isDarkMode ? 'bg-white/[0.07] text-[#FF0B01] font-black' : 'bg-red-50/80 text-[#FF0B01] font-black'
                  : isDarkMode
                    ? 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >

              {/* Active Left Border */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF0B01] rounded-r-md"></span>
              )}

              <img
                src={item.icon}
                alt={item.label}
                className={`w-[18px] h-[18px] object-contain transition-opacity sidebar-icon
                ${isActive ? 'active-icon-glow opacity-100' : 'opacity-60'}`}
              />

              <span>{item.label}</span>

            </button>
          );
        })}
      </div>

      {/* Toggle Button */}
      <button 
        onClick={toggleSidebar}
        className={`absolute top-4 -right-3.5 border rounded-full w-7 h-7 flex items-center justify-center transition-all z-40 cursor-pointer
          ${isOpen 
            ? isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700' : 'bg-white border-gray-200 shadow-sm hover:bg-gray-50' 
            : 'bg-[#FF0B01] border-[#FF0B01] shadow-[0_0_6px_rgba(255,11,1,0.35)]'}`}
      >
        <svg
          className={`w-3.5 h-3.5 transition-all duration-300
            ${isOpen ? (isDarkMode ? 'text-zinc-300' : 'text-gray-400') : 'text-white rotate-180'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

    </div>
  );
};

export default ManageSideBar;