import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { AuthProvider, useAuth, CountryCode } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Countries from "./pages/Countries";
import CountryDetail from "./pages/CountryDetail";
import Analytics from "./pages/Analytics";
import PredictionPage from "./pages/prediction";
import DataManagement from "./pages/DataManagement";
import Login from "./pages/Login";
import LanguageSelector from "./components/LanguageSelector"; // ← Assure-toi de l'importer si tu l'utilises



const AppContent: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { user, switchCountry } = useAuth();
  const { i18n, t } = useTranslation();

  useEffect(() => {
    if (!user) return;

    const savedLang = localStorage.getItem('ch_language');

    if (user.country === 'ch') {
      i18n.changeLanguage(savedLang || 'fr');
    } else if (user.country === 'fr') {
      i18n.changeLanguage('fr');
    } else if (user.country === 'usa') {
      i18n.changeLanguage('en');
    }
  }, [user?.country, i18n]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sélecteur de pays + langue (si CH) */}
      <div className="fixed top-4 right-4 z-50 bg-white border rounded p-2 text-sm">
        <label className="mr-2 font-medium">{t("sidebar.country")}:</label>
        <select
          value={user.country}
          onChange={(e) => switchCountry(e.target.value as CountryCode)}
          className="border rounded px-2 py-1"
        >
          <option value="usa">USA</option>
          <option value="fr">France</option>
          <option value="ch">Suisse</option>
        </select>

        <LanguageSelector />
      </div>

      <Sidebar expanded={sidebarExpanded} onToggle={setSidebarExpanded} />

      <main className="flex-1 overflow-x-hidden p-6">
        <Routes>
          <Route path="/" element={<ProtectedRoute routeKey="dashboard"><Dashboard /></ProtectedRoute>} />
          <Route path="/countries" element={<ProtectedRoute routeKey="countries"><Countries /></ProtectedRoute>} />
          <Route path="/countries/:countryId" element={<ProtectedRoute routeKey="country-detail"><CountryDetail /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute routeKey="analytics"><Analytics /></ProtectedRoute>} />
          <Route path="/prediction" element={<ProtectedRoute routeKey="prediction"><PredictionPage /></ProtectedRoute>} />
          <Route path="/data-management" element={<ProtectedRoute routeKey="data-management"><DataManagement /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
