import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import en from '../locales/en.json';
import si from '../locales/si.json';
import ta from '../locales/ta.json';

const deviceLang = Localization.getLocales()[0]?.languageCode ?? 'si';
const initial = ['si', 'en', 'ta'].includes(deviceLang) ? deviceLang : 'si';

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, si: { translation: si }, ta: { translation: ta } },
  lng: initial,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
