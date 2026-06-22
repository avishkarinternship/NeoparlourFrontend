import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './NavBar';
import SearchNavBar from './SearchNavBar';
import Footer from './Footer';

export default function CustomerLayout() {
  const location = useLocation();
  const searchRoutes = [
    '/customer/product-search',
    '/customer/product-details',
    '/customer/product-payment',
    '/customer/salon',
    '/customer/book-service',
    '/customer/appointment-success',
    '/customer/order-success',
    '/customer/my-orders'
  ];

  const isSearchRoute = searchRoutes.some(route => location.pathname.startsWith(route));

  return (
    <div className="w-full min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden antialiased flex flex-col justify-between">
      <div>
        {isSearchRoute ? <SearchNavBar /> : <Navbar />}
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
