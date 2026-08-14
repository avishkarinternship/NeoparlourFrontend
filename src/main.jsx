import React, { Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import store from './redux/store'
import { routes } from './router/NeoParlourRouter'
import './index.css'
import i18n from './i18n' // Import i18n configuration
import { I18nextProvider } from 'react-i18next'

const GlobalSkeletonFallback = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-black font-sans flex flex-col p-6 space-y-8">
    <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-2xl border border-slate-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl yt-skeleton shrink-0"></div>
        <div className="h-6 w-32 rounded-lg yt-skeleton"></div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-9 w-24 rounded-xl yt-skeleton"></div>
        <div className="w-9 h-9 rounded-full yt-skeleton"></div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto w-full space-y-6">
      <div className="h-48 rounded-3xl yt-skeleton w-full"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-slate-100 dark:border-gray-800 space-y-4">
            <div className="h-40 rounded-2xl yt-skeleton"></div>
            <div className="space-y-2">
              <div className="h-5 rounded-lg yt-skeleton w-3/4"></div>
              <div className="h-4 rounded-lg yt-skeleton w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18n}>
        <Suspense fallback={<GlobalSkeletonFallback />}>
          <RouterProvider router={routes} />
        </Suspense>
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
)
