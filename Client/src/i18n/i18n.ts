import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import it from './locales/it.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      de: { translation: de },
      it: { translation: it }
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

// // ✅ Initialiser immédiatement
// initI18n();

// // ✅ Ajouter à window pour debug
// if (typeof window !== 'undefined') {
//   (window as any).i18n = i18n;
// }

export default i18n;