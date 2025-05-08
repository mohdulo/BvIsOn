import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Countries from './pages/Countries';
import CountryDetail from './pages/CountryDetail';
import Analytics from './pages/Analytics';
import DataManagement from './pages/DataManagement';

const App: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  const handleSidebarToggle = (expanded: boolean) => {
    setSidebarExpanded(expanded);
  };

  return (
    <Router>
      <div className="flex">
        <Sidebar onToggle={handleSidebarToggle} />
        <div className={`flex-1 ${sidebarExpanded ? 'ml-64' : 'ml-20'} transition-all duration-300 bg-gray-50 min-h-screen`}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/countries/:countryId" element={<CountryDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/data-management" element={<DataManagement />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;