import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import scheduleIcon from '../../../assets/Owner/Dashboard/SideBar/home_icon.svg';
import serviceIcon from '../../../assets/Owner/Dashboard/SideBar/manage_icon.svg';
import inventoryIcon from '../../../assets/Owner/Dashboard/SideBar/analytics_icon.svg';
import staffIcon from '../../../assets/Owner/Dashboard/SideBar/team_icon.svg';

const ManageSideBar = () => {

  const navigate = useNavigate();
  const location = useLocation();

  const subMenu = [
    {
      label: 'Schedule',
      icon: scheduleIcon,
      path: '/owner/manage/schedule'
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
    <div className="w-56 bg-white border-r border-gray-200 min-h-full py-6 flex flex-col justify-between hidden md:flex flex-shrink-0 relative">

      {/* Navigation Links */}
      <div className="space-y-1 px-3">

        {subMenu.map((item, idx) => {

          const isActive = location.pathname === item.path;

          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-150 relative sidebar-btn
              
              ${isActive
                  ? 'bg-red-50 text-red-600 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >

              {/* Active Left Border */}
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
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
      <button className="absolute top-4 -right-3.5 bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-20">
        <svg
          className="w-3.5 h-3.5 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
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