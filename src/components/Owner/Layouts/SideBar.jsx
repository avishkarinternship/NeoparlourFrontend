import React from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../api/axiosInstance';
import toast from 'react-hot-toast';

import homeIcon from '../../../assets/Owner/Dashboard/SideBar/home_icon.svg';
import manageIcon from '../../../assets/Owner/Dashboard/SideBar/manage_icon.svg';
import analyticsIcon from '../../../assets/Owner/Dashboard/SideBar/analytics_icon.svg';
import teamIcon from '../../../assets/Owner/Dashboard/SideBar/team_icon.svg';
import billingIcon from '../../../assets/Owner/Dashboard/SideBar/billing_icon.svg';
import helpIcon from '../../../assets/Owner/Dashboard/SideBar/help_icon.svg';
import settingIcon from '../../../assets/Owner/Dashboard/SideBar/setting_icon.svg';
import logoutIcon from '../../../assets/Owner/Dashboard/SideBar/logout_icon.svg';


const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/auth/logout', {});
    } catch (err) {
      console.error("Server logout request failed:", err);
    } finally {
      localStorage.removeItem('ownerStaffToken');
      localStorage.removeItem('ownerStaffUser');
      localStorage.removeItem('customerToken');
      localStorage.removeItem('customerUser');

      toast.success('Successfully logged out!', {
        style: {
          background: '#1a1a1a',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: '600'
        }
      });
      navigate('/login');
    }
  };

  return (
    <>
      {/* Mobile Sidebar Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
        />
      )}
      
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between h-screen overflow-y-auto transition-transform duration-300 ease-in-out
        lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:w-64 lg:translate-x-0 lg:z-40
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>

        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden flex-shrink-0">
          <span className="text-gray-900 font-bold text-sm">Navigation</span>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      
      {/* Top Application Feature Controls Group */}
      <div className="pt-4 px-3 flex-1 space-y-1">
        
        {/* Dashboard Navigation Tab (Active Link Option) */}
        <a href="#" className="flex items-center space-x-3.5 px-4 py-3 rounded-md bg-transparent text-red-600 font-bold text-[13px] relative group">
          {/* Active Status Highlight Bar on the absolute edge left */}
          <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-600 rounded-r-md"></span>
          <img src={homeIcon} alt="Dashboard" className="w-[18px] h-[18px] object-contain flex-shrink-0" />
          <span className="hidden md:inline">Dashboard</span>
        </a>
        
        {/* Manage Navigation Tab */}
        <a href="#" className="flex items-center space-x-3.5 px-4 py-3 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-bold text-[13px] transition-colors duration-150">
          <img src={manageIcon} alt="Manage" className="w-[18px] h-[18px] object-contain flex-shrink-0 opacity-70 group-hover:opacity-100" />
          <span className="hidden md:inline">Manage</span>
        </a>
        
        {/* Analytics Navigation Tab */}
        <a href="#" className="flex items-center space-x-3.5 px-4 py-3 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-bold text-[13px] transition-colors duration-150">
          <img src={analyticsIcon} alt="Analytics" className="w-[18px] h-[18px] object-contain flex-shrink-0 opacity-70 group-hover:opacity-100" />
          <span className="hidden md:inline">Analytics</span>
        </a>
        
        {/* Team Navigation Tab */}
        <a href="#" className="flex items-center space-x-3.5 px-4 py-3 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-bold text-[13px] transition-colors duration-150">
          <img src={teamIcon} alt="Team" className="w-[18px] h-[18px] object-contain flex-shrink-0 opacity-70 group-hover:opacity-100" />
          <span className="hidden md:inline">Team</span>
        </a>
        
        {/* Billing Navigation Tab */}
        <a href="#" className="flex items-center space-x-3.5 px-4 py-3 rounded-md text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-bold text-[13px] transition-colors duration-150">
          <img src={billingIcon} alt="Billing" className="w-[18px] h-[18px] object-contain flex-shrink-0 opacity-70 group-hover:opacity-100" />
          <span className="hidden md:inline">Billing</span>
        </a>
      </div>

      {/* Bottom Utility Profile/Config Actions Group */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        
        {/* Help Link Option */}
        <a href="#" className="flex items-center space-x-3.5 px-4 py-2.5 text-gray-500 hover:text-gray-900 text-[13px] font-bold transition-colors duration-150">
          <img src={helpIcon} alt="Help" className="w-[18px] h-[18px] object-contain flex-shrink-0 opacity-70" />
          <span className="hidden md:inline">Help</span>
        </a>
        
        {/* Settings Link Option */}
        <a href="#" className="flex items-center space-x-3.5 px-4 py-2.5 text-gray-500 hover:text-gray-900 text-[13px] font-bold transition-colors duration-150">
          <img src={settingIcon} alt="Settings" className="w-[18px] h-[18px] object-contain flex-shrink-0 opacity-70" />
          <span className="hidden md:inline">Settings</span>
        </a>
        
        {/* Session Termination Area */}
        <div className="pt-2 border-t border-gray-100 mt-2">
          <button 
            onClick={handleLogout} 
            className="w-full flex items-center space-x-3.5 px-4 py-2.5 text-gray-500 hover:text-red-600 text-[13px] font-bold transition-colors duration-150 cursor-pointer"
          >
            <img src={logoutIcon} alt="Logout" className="w-[18px] h-[18px] object-contain flex-shrink-0 opacity-70" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>

    </aside>
    </>
  );
}

export default Sidebar;