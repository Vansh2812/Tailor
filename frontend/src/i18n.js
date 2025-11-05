import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import gu from './locales/gu.json';

i18n.use(initReactI18next).init({
  resources: {
    english: { translation: en },
    gujarati: { translation: gu }
  },
  lng: 'english', // default language
  fallbackLng: 'english',
  interpolation: { escapeValue: false }
});

export default i18n;
