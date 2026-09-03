import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './SideBar';
import Footer from './Footer';
import SalonBanBanner from './SalonBanBanner';
import axiosInstance from '../../../api/axiosInstance';

export default function OwnerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [salon, setSalon] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('owner_dark_mode') === 'true';
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('owner_dark_mode', String(next));
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const activeSalonId = localStorage.getItem('activeSalonId') || localStorage.getItem('salon_id');
    if (activeSalonId && activeSalonId !== 'SYSTEM' && activeSalonId !== 'null' && !isNaN(Number(activeSalonId))) {
      axiosInstance.get(`/salons/${activeSalonId}`)
        .then(res => setSalon(res.data))
        .catch(err => console.warn('Could not fetch active salon info for ban check:', err.message));
    }
  }, []);

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between antialiased transition-colors duration-300 ${
      isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-[#FAFAFA] text-gray-800'
    }`}>
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isDarkMode={isDarkMode} />
        <div className="flex-1 flex flex-col min-w-0 p-0">
          <SalonBanBanner salon={salon} isDarkMode={isDarkMode} />
          <Outlet context={{ isDarkMode, salon }} />
        </div>
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
