// src/App.tsx - SOLUTION DÉFINITIVE
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth, CountryCode } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Countries from "./pages/Countries";
import CountryDetail from "./pages/CountryDetail";
import Analytics from "./pages/Analytics";
import PredictionPage from "./pages/prediction";
import DataManagement from "./pages/DataManagement";

// ✅ Import direct de l'instance i18n
import i18n from "./i18n/i18n";
import { useTranslation } from "react-i18next";

// Import des drapeaux
const frFlag = "https://flagcdn.com/w20/fr.png";
const deFlag = "https://flagcdn.com/w20/de.png";
const itFlag = "https://flagcdn.com/w20/it.png";

const AppContent: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = React.useState(true);
  const { isAuthenticated, isLoading, user, switchCountry } = useAuth();
  const { t } = useTranslation(); // ✅ Utiliser seulement pour les traductions

  // ✅ Fonction pour changer de pays
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as CountryCode;
    switchCountry(selected);

    // ✅ Utiliser l'instance i18n directement
    try {
      if (selected === "fr") {
        i18n.changeLanguage("fr");
      } else if (selected === "ch") {
        const currentLang = i18n.language;
        if (!["fr", "de", "it"].includes(currentLang)) {
          i18n.changeLanguage("fr");
        }
      } else {
        i18n.changeLanguage("fr"); // Fallback français
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // ✅ Fonction pour changer de langue - CORRIGÉE
  const handleLanguageSwitch = async (lang: "fr" | "de" | "it") => {
    console.log(`🔄 Switching to language: ${lang}`);
    
    try {
      // ✅ Utiliser l'instance i18n directement
      await i18n.changeLanguage(lang);
      localStorage.setItem('i18nextLng', lang);
      console.log(`✅ Language changed to: ${lang}`);
    } catch (error) {
      console.error('❌ Error changing language:', error);
      
      // ✅ Fallback manuel si i18n ne fonctionne pas
      localStorage.setItem('i18nextLng', lang);
      window.location.reload(); // Recharger la page en dernier recours
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Sélecteur de pays + langues avec drapeaux */}
      <div className="fixed top-4 right-4 z-50 bg-white border rounded p-2 text-sm shadow-lg">
        <label className="mr-2 font-medium">Pays :</label>
        <select
          value={user?.country || "usa"}
          onChange={handleCountryChange}
          className="border rounded px-2 py-1"
        >
          <option value="usa">USA</option>
          <option value="fr">France</option>
          <option value="ch">Suisse</option>
        </select>

        {/* Sélecteur de langue avec drapeaux (uniquement pour la Suisse) */}
        {user?.country === "ch" && (
          <div className="flex justify-center mt-2 space-x-2">
            <button
              onClick={() => handleLanguageSwitch("fr")}
              title="Français"
              className="hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
            >
              <img 
                src={frFlag} 
                alt="FR" 
                className="w-6 h-4 rounded shadow border border-gray-200" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.backgroundColor = '#002654';
                  target.style.border = '1px solid #fff';
                  target.alt = 'FR';
                }}
              />
            </button>
            <button
              onClick={() => handleLanguageSwitch("de")}
              title="Deutsch"
              className="hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
            >
              <img 
                src={deFlag} 
                alt="DE" 
                className="w-6 h-4 rounded shadow border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.backgroundColor = '#000';
                  target.style.border = '1px solid #fff';
                  target.alt = 'DE';
                }}
              />
            </button>
            <button
              onClick={() => handleLanguageSwitch("it")}
              title="Italiano"
              className="hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 rounded"
            >
              <img 
                src={itFlag} 
                alt="IT" 
                className="w-6 h-4 rounded shadow border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.backgroundColor = '#009246';
                  target.style.border = '1px solid #fff';
                  target.alt = 'IT';
                }}
              />
            </button>
          </div>
        )}
      </div>

      <Sidebar expanded={sidebarExpanded} onToggle={setSidebarExpanded} />

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
          <Route path="/login" element={<Navigate to="/" replace />} />
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
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;