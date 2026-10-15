import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './NavBar';
import SearchNavBar from './SearchNavBar';
import Footer from './Footer';
import { DarkModeProvider, useDarkMode } from '../../../context/DarkModeContext';

function CustomerLayoutInner() {
  const location = useLocation();
  const { isDark } = useDarkMode();

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
        {isSearchRoute ? <SearchNavBar /> : <Navbar />}
      </div>
      <main className="flex-1 w-full overflow-x-clip">
        <Outlet />
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
