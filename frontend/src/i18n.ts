import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from './locales/en/translation.json';
import ruTranslation from './locales/ru/translation.json';

i18n
  .use(LanguageDetector) // Определяет язык пользователя
  .use(initReactI18next) // Передает i18n экземпляр в react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      ru: {
        translation: ruTranslation,
      },
    },
    fallbackLng: 'ru', // Язык по умолчанию, если язык браузера не найден
    interpolation: {
      escapeValue: false, // React уже защищает от XSS
    },
  });

export default i18n;