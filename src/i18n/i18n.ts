import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';
import fr from './locales/fr.json';

export const LANGUAGES = ['es', 'en', 'fr'] as const;
export type Language = (typeof LANGUAGES)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { es: { translation: es }, en: { translation: en }, fr: { translation: fr } },
    supportedLngs: LANGUAGES,
    nonExplicitSupportedLngs: true, // "es-MX" → "es"
    load: 'languageOnly',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      // 1) elección manual guardada, 2) idioma del navegador
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'qr-studio.lang',
      caches: ['localStorage'],
    },
  });

function syncDocument(): void {
  document.documentElement.lang = i18n.resolvedLanguage ?? 'en';
  document.title = i18n.t('app.title');
}
i18n.on('languageChanged', syncDocument);
syncDocument();

export default i18n;
