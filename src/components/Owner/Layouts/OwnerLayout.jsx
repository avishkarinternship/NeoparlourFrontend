import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './SideBar';
import Footer from './Footer';
import SalonBanBanner from './SalonBanBanner';
import axiosInstance from '../../../api/axiosInstance';

export default function OwnerLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('owner_sidebar_desktop_open');
    return saved !== null ? saved === 'true' : true;
  });

  const [salon, setSalon] = useState(null);
  // Detect SEO Admin role
  const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
  const userRole = String(ownerUser?.role || ownerUser?.userRole || (Array.isArray(ownerUser?.roles) ? ownerUser.roles[0] : ownerUser?.roles) || '').toUpperCase();
  const isSeoAdmin = userRole === 'SEO_ADMIN' || userRole.includes('SEO');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('owner_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    // Default to dark mode for SEO admin initially, but allow toggle
    if (isSeoAdmin) return true;
    return false;
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('owner_dark_mode', String(next));
      localStorage.setItem('theme', next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileSidebarOpen(prev => !prev);
    } else {
      setIsDesktopSidebarOpen(prev => {
        const next = !prev;
        localStorage.setItem('owner_sidebar_desktop_open', String(next));
        return next;
      });
    }
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
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
    <div className={`min-h-screen font-sans flex flex-col justify-between antialiased transition-colors duration-300 relative ${
      isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-[#FAFAFA] text-gray-800'
    }`}>
      <Navbar 
        onToggleSidebar={toggleSidebar} 
        isSidebarOpen={isDesktopSidebarOpen}
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      
      <div className="flex flex-1 relative min-h-0">
        <Sidebar 
          isOpen={isMobileSidebarOpen} 
          isDesktopOpen={isDesktopSidebarOpen}
          onToggleDesktop={toggleSidebar}
          onClose={() => setIsMobileSidebarOpen(false)} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode} 
        />

        <div className="flex-1 flex flex-col min-w-0 p-0 transition-all duration-300 ease-in-out relative z-0">
          <SalonBanBanner salon={salon} isDarkMode={isDarkMode} />
          <Outlet context={{ isDarkMode, salon }} />
        </div>
      </div>
      
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
