import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend) // Load translations from files
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Bind i18next to React
  .init({
    fallbackLng: 'en', // Default language
    supportedLngs: ['en', 'ar', 'fr', 'bn'], // Supported languages
    debug: true,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    backend: {
      loadPath: '/locales/{{lng}}/translation.json', // Path to translation files
    },
  });

export default i18n;