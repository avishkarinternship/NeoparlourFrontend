import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';
import ServerMaintenance from './components/common/ServerMaintenance';
import { isThemeAllowedOnPath, removeSalonTheme, initSalonTheme } from './utils/whiteLabelHelper';
import DiwaliTheme from './components/diwali';

const App = () => {
  const location = useLocation();
  const [maintenanceError, setMaintenanceError] = useState(null);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-in-out',
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isThemeAllowedOnPath(location.pathname)) {
      removeSalonTheme();
    } else {
      initSalonTheme(location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleMaintenanceEvent = (event) => {
      setMaintenanceError(event.detail || { status: 503 });
    };

    window.addEventListener('server-under-maintenance', handleMaintenanceEvent);
    return () => {
      window.removeEventListener('server-under-maintenance', handleMaintenanceEvent);
    };
  }, []);

  const handleRetryConnection = useCallback(async () => {
    try {
      setMaintenanceError(null);
      window.location.reload();
    } catch {
      setMaintenanceError({ status: 503 });
    }
  }, []);

  return (
    <div className="app-container overflow-x-hidden font-sans">
      <Toaster position="top-right" />
      {/* Festive Diwali Firecrackers Background (Revertible: toggle in diwaliConfig.js or remove line below) */}
      <DiwaliTheme />
      {maintenanceError && (
        <ServerMaintenance
          isOverlay={true}
          status={maintenanceError.status}
          code={maintenanceError.code}
          message={maintenanceError.message}
          onRetry={handleRetryConnection}
        />
      )}
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#ff0b01] rounded-full animate-spin" />
        </div>
      }>
        <Outlet />
      </Suspense>
    </div>
  );
};

export default App;
