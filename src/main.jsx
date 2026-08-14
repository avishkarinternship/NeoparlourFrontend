import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import store from './redux/store'
import { routes } from './router/NeoParlourRouter'
import './index.css'
import i18n from './i18n' // Import i18n configuration
import { I18nextProvider } from 'react-i18next'

const RootFallback = () => (
  <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
    <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #ff0b01', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={<RootFallback />}>
          <RouterProvider router={routes} />
        </Suspense>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
)
