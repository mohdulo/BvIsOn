// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useTranslation } from "react-i18next";
import frFlag from "./assets/flags/fr.png";
import deFlag from "./assets/flags/de.png";
import itFlag from "./assets/flags/it.png";

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
  const { user, switchCountry } = useAuth();
  const { i18n, t } = useTranslation();

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as CountryCode;
    switchCountry(selected);

    // Définit la langue par défaut en fonction du pays sélectionné
    if (selected === "fr" || selected === "ch") {
      i18n.changeLanguage("fr");
    } else {
      i18n.changeLanguage("en");
    }
  };

  const handleLanguageSwitch = (lang: "fr" | "de" | "it") => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="flex min-h-screen">
      {/* Sélecteur de pays + langues */}
      <div className="sticky top-4 right-4 z-50 bg-white border rounded p-2 text-sm shadow-md max-w-[90vw]">
        <label htmlFor="country-selector" className="mr-2 font-medium">
          {t("Country")} :
        </label>
        <select
          id="country-selector"
          name="country"
          aria-label={t("Country selector")}
          value={user.country}
          onChange={handleCountryChange}
          className="border rounded px-2 py-1"
        >
          <option value="usa">USA</option>
          <option value="fr">France</option>
          <option value="ch">Suisse</option>
        </select>

        {user.country === "ch" && (
          <div className="flex justify-center mt-2 space-x-2">
            <button
              onClick={() => handleLanguageSwitch("fr")}
              aria-label="Français"
              className="hover:scale-110 transition"
            >
              <img src={frFlag} alt="" className="w-6 h-4 rounded shadow" />
            </button>
            <button
              onClick={() => handleLanguageSwitch("de")}
              aria-label="Deutsch"
              className="hover:scale-110 transition"
            >
              <img src={deFlag} alt="" className="w-6 h-4 rounded shadow" />
            </button>
            <button
              onClick={() => handleLanguageSwitch("it")}
              aria-label="Italiano"
              className="hover:scale-110 transition"
            >
              <img src={itFlag} alt="" className="w-6 h-4 rounded shadow" />
            </button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <Sidebar expanded={sidebarExpanded} onToggle={setSidebarExpanded} />

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

const App: React.FC = () => (
  <AuthProvider>
    <Router>
      <AppContent />
    </Router>
  </AuthProvider>
);

export default App;
