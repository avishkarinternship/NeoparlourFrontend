import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';
import { useSubscriptionRecovery } from './hooks/useSubscriptionRecovery';
import SubscriptionNoticeModal from './components/SubscriptionNoticeModal';
import MaintenanceOverlay from './components/MaintenanceOverlay';

const App = () => {
  const { modalState, closeModal } = useSubscriptionRecovery();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  return (
    <div className="app-container overflow-x-hidden font-sans">
      <Toaster position="top-right" />
      <MaintenanceOverlay />
      <SubscriptionNoticeModal
        isOpen={modalState.isOpen}
        status={modalState.status}
        orderDetails={modalState.orderDetails}
        onClose={closeModal}
      />
      <Outlet />
    </div>
  );
}

export default App;

