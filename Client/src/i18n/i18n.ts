import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import fr from "./locales/fr.json";
import de from "./locales/de.json";
import it from "./locales/it.json";
// import en from "./locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { fr, de, it },
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

export default i18n;
