import React from 'react';

// FIXING DIRECTORY PATHS: Stepping back 3 levels out of components/Owner/Layouts to reach src/assets
import scheduleIcon from '../../../assets/Owner/Dashboard/SideBar/home_icon.svg'; // Defaulting fallback anchors
import serviceIcon from '../../../assets/Owner/Dashboard/SideBar/manage_icon.svg'; 
import inventoryIcon from '../../../assets/Owner/Dashboard/SideBar/analytics_icon.svg'; 
import staffIcon from '../../../assets/Owner/Dashboard/SideBar/team_icon.svg';

const ManageSideBar = () => {
  const subMenu = [
    { label: 'Schedule', icon: scheduleIcon, active: true },
    { label: 'Service', icon: serviceIcon },
    { label: 'Inventory', icon: inventoryIcon },
    { label: 'Staff', icon: staffIcon },
    { label: 'Feedback', icon: serviceIcon },
    { label: 'Home Services', icon: scheduleIcon },
    { label: 'Subscription', icon: inventoryIcon },
    { label: 'Add Offers', icon: serviceIcon },
    { label: 'Add Products', icon: inventoryIcon },
    { label: 'Add Packages', icon: serviceIcon },
  ];

  return (
    <div className="w-56 bg-white border-r border-gray-200 min-h-full py-6 flex flex-col justify-between hidden md:flex flex-shrink-0 relative">
      
      {/* Navigation Links Cluster */}
      <div className="space-y-1 px-3">
        {subMenu.map((item, idx) => (
          <button
            key={idx}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-[13px] font-bold tracking-tight transition-all duration-150 ${
              item.active 
                ? 'bg-red-50 text-red-600 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <img 
              src={item.icon} 
              alt={item.label} 
              className={`w-[18px] h-[18px] object-contain transition-opacity ${item.active ? 'opacity-100' : 'opacity-60'}`} 
            />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Decorative Sidebar Toggle Arrow Pinned to Edge */}
      <button className="absolute top-4 -right-3.5 bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-20">
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

    </div>
  );
}

export default ManageSideBar;