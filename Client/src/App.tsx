import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Countries from './pages/Countries';
import CountryDetail from './pages/CountryDetail';
import Analytics from './pages/Analytics';
import Prediction from './pages/prediction';
// import DataManagement from './pages/DataManagement';
// import PredictionForm from "./components/PredictionForm";
import MetricsTable from "./components/MetricsTable";

const App: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  return (
    <>
      <Router>
        <Sidebar expanded={sidebarExpanded} onToggle={handleSidebarToggle} />
        <div className={`main-content ${sidebarExpanded ? 'expanded' : 'collapsed'}`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/countries/:countryId" element={<CountryDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            {/* <Route path="/data-management" element={<DataManagement />} /> */}
            <Route path="/prediction" element={<Prediction />} /> {/* ✅ ajout ici */}
            <Route path="/metrics-table" element={<MetricsTable />} /> 
          </Routes>
        </div>
      </Router>
    </>
  );
};

export default App;