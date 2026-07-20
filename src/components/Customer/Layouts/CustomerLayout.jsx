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
    '/customer/salon',
    '/customer/book-service',
    '/customer/appointment-success',
    '/customer/order-success',
    '/customer/my-orders',
    '/customer/cart'
  ];

  const isSearchRoute = searchRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  return (
    <div className={`w-full min-h-screen font-sans overflow-x-hidden antialiased flex flex-col justify-between transition-colors duration-300 ${isDark ? 'dark-mode bg-black text-white' : 'bg-white text-gray-900'}`}>
      <div>
        {isSearchRoute ? <SearchNavBar /> : <Navbar />}
        <Outlet />
      </div>
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
