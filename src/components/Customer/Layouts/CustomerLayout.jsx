import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './NavBar';
import SearchNavBar from './SearchNavBar';
import Footer from './Footer';
import OwnerNavbar from '../../Owner/Layouts/Navbar';
import { DarkModeProvider, useDarkMode } from '../../../context/DarkModeContext';
import { isOwnerLoggedIn } from '../../../utils/auth';

function CustomerLayoutInner() {
  const location = useLocation();
  const { isDark, toggleDark } = useDarkMode();
  const [isOwner, setIsOwner] = useState(isOwnerLoggedIn);

  useEffect(() => {
    setIsOwner(isOwnerLoggedIn());
  }, [location.pathname]);

  const searchRoutes = [
    '/customer/product-search',
    '/customer/product-details',
    '/customer/product-payment',
    '/salon',
    '/book-service',
    '/customer/appointment-success',
    '/customer/order-success'
  ];

  const isSearchRoute = searchRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  return (
    <div className={`w-full min-h-screen font-sans antialiased flex flex-col justify-between transition-colors duration-300 ${isDark ? 'dark dark-mode bg-black text-white' : 'bg-white text-gray-900'}`}>
      <div className="sticky top-0 z-50 w-full">
        {isOwner ? (
          <OwnerNavbar isDarkMode={isDark} toggleDarkMode={toggleDark} isSidebarOpen={true} />
        ) : isSearchRoute ? (
          <SearchNavBar />
        ) : (
          <Navbar />
        )}
      </div>
      <main className="flex-1 w-full overflow-x-clip">
        <Suspense fallback={
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-[#ff0b01] rounded-full animate-spin" />
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function CustomerLayout() {
  return (
    <DarkModeProvider>
      <CustomerLayoutInner />
    </DarkModeProvider>
  );
}
