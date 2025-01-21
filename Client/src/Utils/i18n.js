import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';


const primaryLanguage = 'en';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    fallbackLng: primaryLanguage,
    debug: import.meta.env.MODE === 'development',
    backend: {
      loadPath: '/locales/{{lng}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;
