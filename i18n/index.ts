import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANG_STORAGE_KEY = '@gonext_language';

const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: (callback: (lng: string) => void) => {
    AsyncStorage.getItem(LANG_STORAGE_KEY).then((stored) => {
      callback(stored === 'en' || stored === 'ru' ? stored : 'ru');
    });
  },
  cacheUserLanguage: (lng: string) => {
    AsyncStorage.setItem(LANG_STORAGE_KEY, lng);
  },
};

const ru = require('../locales/ru.json');
const en = require('../locales/en.json');

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'en'],
    resources: {
      ru: { translation: ru },
      en: { translation: en },
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
