// src/i18n/i18n.ts - CONFIGURATION FINALE CORRIGÉE
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";

// ✅ Configuration corrigée avec gestion d'erreurs
const initI18n = async () => {
  try {
    await i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: {
          fr: { translation: fr },
          de: { translation: de },
          it: { translation: it }
        },
        
        fallbackLng: "fr",
        lng: "fr", // Langue par défaut
        
        detection: {
          order: ['localStorage', 'navigator', 'htmlTag'],
          lookupLocalStorage: 'i18nextLng',
          caches: ['localStorage'],
        },
        
        interpolation: {
          escapeValue: false // React échappe déjà
        },
        
        react: {
          useSuspense: false // ✅ Important pour éviter les erreurs
        },
        
        debug: process.env.NODE_ENV === 'development'
      });
      
    console.log('✅ i18n initialized successfully');
    console.log('✅ Available languages:', Object.keys(i18n.options.resources || {}));
    console.log('✅ Current language:', i18n.language);
    
  } catch (error) {
    console.error('❌ i18n initialization failed:', error);
  }
};

// ✅ Initialiser immédiatement
initI18n();

// ✅ Ajouter à window pour debug
if (typeof window !== 'undefined') {
  (window as any).i18n = i18n;
}

export default i18n;