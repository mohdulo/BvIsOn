// src/components/LanguageSelector.tsx - NOUVEAU COMPOSANT
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  // Afficher seulement si l'utilisateur est en Suisse
  if (!user || user.country !== 'ch') {
    return null;
  }

  const handleLanguageChange = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('ch_language', language);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-600">Langue:</span>
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="border rounded px-2 py-1 text-sm bg-white"
      >
        <option value="fr">Français</option>
        <option value="de">Deutsch</option>
        <option value="it">Italiano</option>
      </select>
    </div>
  );
};

export default LanguageSelector;