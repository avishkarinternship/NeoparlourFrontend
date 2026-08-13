import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

export const LanguageSwitcher = ({ className = "" }) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLang = (i18n.language || localStorage.getItem('i18nextLng') || 'en').substring(0, 2);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    document.documentElement.lang = lng;
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी', short: 'HI' },
    { code: 'mr', label: 'मराठी', short: 'MR' }
  ];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Globe Icon Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('labels.select_language', 'Select Language')}
        className="p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-white/90 dark:bg-gray-900 hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 shadow-2xs hover:scale-105 active:scale-95"
        title="Change Language"
      >
        <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF0B01]" />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-2xl shadow-xl z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-gray-800 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500">
            Select Language
          </div>
          <div className="p-1 space-y-0.5">
            {languages.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer ${
                    isActive
                      ? 'bg-red-50 dark:bg-red-950/40 text-[#FF0B01] font-black'
                      : 'text-slate-700 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-gray-800 text-[10px] font-black text-slate-600 dark:text-gray-400">
                      {lang.short}
                    </span>
                    <span>{lang.label}</span>
                  </span>
                  {isActive && <Check className="w-4 h-4 text-[#FF0B01]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
