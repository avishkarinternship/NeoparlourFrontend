import React, { useEffect, useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './App.css';
import ServerMaintenance from './components/common/ServerMaintenance';

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
      {maintenanceError && (
        <ServerMaintenance
          isOverlay={true}
          status={maintenanceError.status}
          code={maintenanceError.code}
          message={maintenanceError.message}
          onRetry={handleRetryConnection}
        />
      )}
      <Outlet />
    </div>
  );
};

export default App;
