import React, { useState, useEffect } from 'react';
import SidebarLink from './SidebarLink';
import {
  LayoutDashboard,
  Globe,
  BarChart,
  Database,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { useCountry } from '../contexts/CountryContext'; // ✅ ajout

interface SidebarProps {
  expanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

const handleLogout = () => {
  localStorage.removeItem("country");
  window.location.href = "/select-country";
};

const Sidebar: React.FC<SidebarProps> = ({ onToggle }) => {
  const [expanded, setExpanded] = useState(true);
  const country = useCountry(); // ✅ récupération du pays sélectionné

  const toggleSidebar = () => {
    const newExpanded = !expanded;
    setExpanded(newExpanded);
    if (onToggle) {
      onToggle(newExpanded);
    }
  };

  useEffect(() => {
    if (onToggle) {
      onToggle(expanded);
    }
  }, []);

  return (
    <div className={`${
      expanded ? 'w-64' : 'w-20'
    } h-screen bg-white text-black transition-all duration-300 fixed left-0 top-0 z-50 shadow-lg`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {expanded && (
          <h1 className="text-xl font-semibold">Covid App</h1>
        )}
        <button onClick={toggleSidebar} className="text-gray-300">
          {expanded ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="py-4">
        {expanded && (
          <div className="px-4 py-2 text-xs uppercase text-gray-500 font-semibold">
            Navigation
          </div>
        )}
        <nav>
          <ul className="space-y-2 px-2">
            {/* 🇺🇸 et 🇫🇷 → dashboard visible */}
            {(country.code === "us" || country.code === "fr") && (
              <SidebarLink
                to="/"
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
                expanded={expanded}
              />
            )}

            {/* 🇺🇸 et 🇫🇷 → countries visible */}
            {(country.code === "us" || country.code === "fr") && (
              <SidebarLink
                to="/countries"
                icon={<Globe size={20} />}
                label="Countries"
                expanded={expanded}
              />
            )}

            {/* 🇺🇸 et 🇫🇷 → analytics */}
            {(country.code === "us" || country.code === "fr") && (
              <SidebarLink
                to="/analytics"
                icon={<BarChart size={20} />}
                label="Analytics"
                expanded={expanded}
              />
            )}

            {/* 🇺🇸 seulement → data management */}
            {country.code === "us" && (
              <SidebarLink
                to="/data-management"
                icon={<Database size={20} />}
                label="Data Management"
                expanded={expanded}
              />
            )}

            {/* 🌍 tous → prediction */}
            <SidebarLink
              to="/prediction"
              icon={<Activity size={20} />}
              label="Prediction"
              expanded={expanded}
            />
          </ul>
        </nav>

        {expanded && (
          <div className="px-4 py-2 mt-8 text-xs uppercase text-gray-500 font-semibold">
            Management
          </div>
        )}

        <div className="px-2 mt-2">
          {expanded ? (
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors group"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-2 py-3 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors group"
            >
              <LogOut size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
