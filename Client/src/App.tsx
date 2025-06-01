// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import frFlag from './assets/flags/fr.png';
import deFlag from './assets/flags/de.png';
import itFlag from './assets/flags/it.png';

import {
  AuthProvider,
  useAuth,
  CountryCode
} from "./contexts/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Countries from "./pages/Countries";
import CountryDetail from "./pages/CountryDetail";
import Analytics from "./pages/Analytics";
import PredictionPage from "./pages/prediction";
import DataManagement from "./pages/DataManagement";

const AppContent: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("usa");
  const { user, switchCountry } = useAuth();
  const { i18n } = useTranslation();

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as CountryCode;
    setSelectedCountry(selected);
    switchCountry(selected);

    if (selected === "fr") i18n.changeLanguage("fr");
    else if (selected === "ch") i18n.changeLanguage("fr"); // par défaut français
    else i18n.changeLanguage("en");
  };

  const handleLanguageSwitch = (lang: "fr" | "de" | "it") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sélecteur de pays + langues (drapeaux) */}
      <div className="fixed top-4 right-4 z-50 bg-white border rounded p-2 text-sm shadow-md">
        <label className="mr-2 font-medium">Country :</label>
        <select
          value={user.country}
          onChange={handleCountryChange}
          className="border rounded px-2 py-1"
        >
          <option value="usa">USA</option>
          <option value="fr">France</option>
          <option value="ch">Suisse</option>
        </select>

    {selectedCountry === "ch" && (
  <div className="flex justify-center mt-2 space-x-2">
    <button
      onClick={() => handleLanguageSwitch("fr")}
      title="Français"
      className="hover:scale-110 transition"
    >
      <img src={frFlag} alt="FR" className="w-6 h-4 rounded shadow" />
    </button>
    <button
      onClick={() => handleLanguageSwitch("de")}
      title="Deutsch"
      className="hover:scale-110 transition"
    >
      <img src={deFlag} alt="DE" className="w-6 h-4 rounded shadow" />
    </button>
    <button
      onClick={() => handleLanguageSwitch("it")}
      title="Italiano"
      className="hover:scale-110 transition"
    >
      <img src={itFlag} alt="IT" className="w-6 h-4 rounded shadow" />
    </button>
  </div>
)}


      </div>

      {/* Sidebar */}
      <Sidebar
        expanded={sidebarExpanded}
        onToggle={(v) => setSidebarExpanded(v)}
      />

      {/* Contenu principal */}
      <main className="flex-1 overflow-x-hidden p-6">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute routeKey="dashboard">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/countries"
            element={
              <ProtectedRoute routeKey="countries">
                <Countries />
              </ProtectedRoute>
            }
          />
          <Route
            path="/countries/:countryId"
            element={
              <ProtectedRoute routeKey="country-detail">
                <CountryDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute routeKey="analytics">
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prediction"
            element={
              <ProtectedRoute routeKey="prediction">
                <PredictionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/data-management"
            element={
              <ProtectedRoute routeKey="data-management">
                <DataManagement />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
