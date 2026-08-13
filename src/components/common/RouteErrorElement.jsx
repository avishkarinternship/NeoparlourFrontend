import React from 'react';
import { useRouteError } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function RouteErrorElement() {
  const error = useRouteError();
  console.error("Route Rendering Error Caught by Error Element:", error);

  const errorMessage =
    error?.statusText || error?.message || "An unexpected application error occurred.";

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-zinc-950 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-900/40">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-gray-900 dark:text-zinc-100 tracking-tight mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-6 leading-relaxed">
          We encountered an unexpected application error while loading this page. Don't worry, your data is safe.
        </p>

        <div className="bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-700/60 rounded-xl p-3.5 mb-6 text-left">
          <p className="text-[11px] font-mono text-red-600 dark:text-red-400 break-words font-medium">
            {errorMessage}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#FF2A14] hover:bg-[#E01E0A] text-white rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-md shadow-red-500/10 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Page</span>
          </button>
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 rounded-xl font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
