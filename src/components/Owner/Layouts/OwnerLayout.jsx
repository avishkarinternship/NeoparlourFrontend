import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './SideBar';
import Footer from './Footer';

export default function OwnerLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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

  return (
    <div className={`min-h-screen font-sans flex flex-col justify-between antialiased transition-colors duration-300 ${
      isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-[#FAFAFA] text-gray-800'
    }`}>
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} isDarkMode={isDarkMode} />
        <Outlet context={{ isDarkMode }} />
      </div>
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}
