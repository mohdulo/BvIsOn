// src/App.tsx
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { AuthProvider, useAuth, CountryCode } from "./contexts/AuthContext";
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

  return (
    <div className="flex min-h-screen">
      {/* Sélecteur de pays pour tester */}
      <div className="fixed top-4 right-4 z-50 bg-white border rounded p-2 text-sm">
        <label className="mr-2 font-medium">Country :</label>
        <select
          value={user.country}
          onChange={(e) => switchCountry(e.target.value as CountryCode)}
          className="border rounded px-2 py-1"
        >
          <option value="usa">USA</option>
          <option value="fr">France</option>
          <option value="ch">Suisse</option>
        </select>
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
