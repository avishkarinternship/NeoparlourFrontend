import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import store from './redux/store'
import { routes } from './router/NeoParlourRouter'
import './index.css'
import i18n from './i18n' // Import i18n configuration
import { I18nextProvider } from 'react-i18next'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4 text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading languages...</div>}>
          <RouterProvider router={routes} />
        </Suspense>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
)
