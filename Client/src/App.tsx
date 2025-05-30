import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Countries from './pages/Countries';
import CountryDetail from './pages/CountryDetail';
import Analytics from './pages/Analytics';
import Prediction from './pages/prediction';
import MetricsTable from './components/MetricsTable';
import CountrySelector from './pages/countrySelector'; // À créer
import { CountryContext, countryList } from './contexts/CountryContext';

const AppContent: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const handleSidebarToggle = (expanded: boolean) => setSidebarExpanded(expanded);

  const countryCode = localStorage.getItem("country") as keyof typeof countryList | null;

  if (!countryCode || !countryList[countryCode]) {
    return <Navigate to="/select-country" replace />;
  }

  const country = countryList[countryCode];

  return (
    <CountryContext.Provider value={country}>
      <Sidebar expanded={sidebarExpanded} onToggle={handleSidebarToggle} />
      <div className={`main-content ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/countries" element={<Countries />} />
          <Route path="/countries/:countryId" element={<CountryDetail />} />
          {country.features.analytics && <Route path="/analytics" element={<Analytics />} />}
          <Route path="/prediction" element={<Prediction />} />
          <Route path="/metrics-table" element={<MetricsTable />} />
        </Routes>
      </div>
    </CountryContext.Provider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/select-country" element={<CountrySelector />} />
        <Route path="/*" element={<AppContent />} />
      </Routes>
    </Router>
  );
};

export default App;
