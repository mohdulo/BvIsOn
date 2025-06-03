// src/components/LanguageSelector.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import frFlag from '../assets/flags/fr.png';
import deFlag from '../assets/flags/de.png';
import itFlag from '../assets/flags/it.png';

const languages = [
  { code: 'fr', label: 'Français', flag: frFlag },
  { code: 'de', label: 'Deutsch', flag: deFlag },
  { code: 'it', label: 'Italiano', flag: itFlag },
];

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  if (!user || user.country !== 'ch') return null;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('ch_language', lang);
  };

  return (
    <div className="flex items-center gap-3 mt-2">
      {languages.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => changeLanguage(code)}
          className={`w-7 h-7 rounded-full border transition ${
            i18n.language === code ? 'ring-2 ring-indigo-500' : ''
          }`}
          title={label}
        >
          <img src={flag} alt={label} className="w-full h-full rounded-full" />
        </button>
      ))}
    </div>
  );
};

export default LanguageSelector;
