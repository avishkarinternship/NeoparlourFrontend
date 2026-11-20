import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './SideBar';
import Footer from './Footer';
import SalonBanBanner from './SalonBanBanner';
import axiosInstance from '../../../api/axiosInstance';
import { extractPaletteFromImage, applySalonTheme } from '../../../utils/whiteLabelHelper';

export default function OwnerLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('owner_sidebar_desktop_open');
    return saved !== null ? saved === 'true' : true;
  });

  const navigate = useNavigate();
  const [salon, setSalon] = useState(null);
  // Detect SEO Admin role
  const ownerUser = JSON.parse(localStorage.getItem('ownerStaffUser') || '{}');
  const userRole = String(ownerUser?.role || ownerUser?.userRole || (Array.isArray(ownerUser?.roles) ? ownerUser.roles[0] : ownerUser?.roles) || '').toUpperCase();
  const isAdmin = userRole === 'ADMIN';
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
        .then(res => {
          setSalon(res.data);
          const logo = res.data?.imageUrl || res.data?.logo || res.data?.logoUrl || (res.data?.images && res.data.images[0]);
          if (logo) {
            localStorage.setItem('salon_logo', logo);
            localStorage.setItem('activeSalonLogo', logo);
            extractPaletteFromImage(logo).then(palette => {
              if (palette) {
                localStorage.setItem('activeSalonTheme', JSON.stringify(palette));
                applySalonTheme(palette);
              }
            });
          }
        })
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

        <div className="flex-1 flex flex-col min-w-0 p-0 transition-all duration-300 ease-in-out relative z-10">
          <SalonBanBanner salon={salon} isDarkMode={isDarkMode} />
          <Suspense fallback={
            <div className="min-h-[50vh] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-[#ff0b01] rounded-full animate-spin" />
            </div>
          }>
            <Outlet context={{ isDarkMode, salon }} />
          </Suspense>
        </div>
      </div>
      
      {isAdmin ? (
        <footer className={`py-3.5 px-6 md:px-8 border-t text-xs transition-colors duration-200 ${
          isDarkMode ? 'bg-zinc-950 border-zinc-900 text-zinc-500' : 'bg-white border-gray-200 text-gray-500'
        }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`font-black tracking-tight text-[11px] uppercase ${isDarkMode ? 'text-zinc-300' : 'text-gray-700'}`}>NeoParlour Admin Engine</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">ALL SYSTEMS LIVE</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span>Confidential • Internal Portal</span>
              <span>•</span>
              <button onClick={() => navigate('/owner/privacy-policy')} className="hover:underline cursor-pointer">Privacy Policy</button>
              <span>•</span>
              <button onClick={() => navigate('/owner/terms-and-conditions')} className="hover:underline cursor-pointer">Terms</button>
            </div>
          </div>
        </footer>
      ) : (
        <Footer isDarkMode={isDarkMode} />
      )}
    </div>
  );
}
