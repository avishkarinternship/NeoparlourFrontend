import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpApi) // Loads JSON translation files from /locales/{{lng}}/translation.json
  .use(LanguageDetector) // Detects browser language & restores saved language from localStorage
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'hi', 'mr'],
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: {
      escapeValue: false, // React already escapes XSS
    },
  });

i18n.on('languageChanged', (lng) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = (lng || 'en').substring(0, 2);
  }
});

// Set initial document lang attribute
if (typeof document !== 'undefined') {
  document.documentElement.lang = (i18n.language || localStorage.getItem('i18nextLng') || 'en').substring(0, 2);
}

export default i18n;
