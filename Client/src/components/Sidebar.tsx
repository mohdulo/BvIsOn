// src/components/Sidebar.tsx
import React, { JSX } from "react";
import { useTranslation } from "react-i18next";
import SidebarLink from "./SidebarLink";
import {
  LayoutDashboard,
  Globe,
  BarChart,
  Database,
  LogOut,
  Menu,
  X,
  PercentDiamondIcon,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";
import { canAccess, RouteKey } from "../permissions";

interface SidebarProps {
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle }) => {
  const { user } = useAuth();
  const toggleSidebar = () => onToggle(!expanded);
  const { t } = useTranslation();

  /** Configuration centralisée du menu */
  const links: {
    to: string;
    icon: JSX.Element;
    labelKey: string; // ← ici on met la clé de traduction
    key: RouteKey;
  }[] = [
    {
      to: "/",
      icon: <LayoutDashboard size={20} />,
      labelKey: "sidebar.dashboard",
      key: "dashboard",
    },
    {
      to: "/countries",
      icon: <Globe size={20} />,
      labelKey: "sidebar.countries",
      key: "countries",
    },
    {
      to: "/analytics",
      icon: <BarChart size={20} />,
      labelKey: "sidebar.analytics",
      key: "analytics",
    },
    {
      to: "/data-management",
      icon: <Database size={20} />,
      labelKey: "sidebar.dataManagement",
      key: "data-management",
    },
    {
      to: "/prediction",
      icon: <PercentDiamondIcon size={20} />,
      labelKey: "sidebar.prediction",
      key: "prediction",
    },
  ];

  const visibleLinks = links.filter((link) =>
    canAccess(user.country, link.key)
  );

  return (
    <aside
      className={`${
        expanded ? "w-64" : "w-20"
      } min-h-screen bg-white text-black shadow-lg transition-all duration-300 flex flex-col flex-shrink-0`}
    >
      {/* ---------- header ---------- */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {expanded && (
          <h1 className="text-xl font-semibold whitespace-nowrap">
            Covid&nbsp;App
          </h1>
        )}
        <button onClick={toggleSidebar} className="text-gray-400">
          {expanded ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ---------- nav ---------- */}
      <nav className="py-4 flex-1 overflow-y-auto">
        {expanded && (
          <div className="px-4 py-2 text-xs uppercase text-gray-500 font-semibold">
            {t("sidebar.navigation")}
          </div>
        )}

        <ul className="space-y-2 px-2">
          {visibleLinks.map(({ to, icon, labelKey }) => (
            <SidebarLink
              key={to}
              to={to}
              icon={icon}
              label={t(labelKey)} // 👈 traduit dynamiquement
              expanded={expanded}
            />
          ))}
        </ul>
      </nav>

      {/* ---------- logout (collé en bas) ---------- */}
      <div className="px-2 py-4 border-t border-gray-200">
        <button
          className={`flex items-center w-full ${
            expanded ? "justify-start px-4" : "justify-center px-2"
          } py-3 text-gray-600 hover:bg-gray-100 hover:text-blue-600 rounded-lg transition-colors group`}
        >
          <LogOut size={20} className={expanded ? "mr-3" : ""} />
          {expanded && <span>{t("sidebar.logout")}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
