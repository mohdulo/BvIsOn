// src/components/Sidebar.tsx
import React, { useState } from "react";
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
  User,
  PercentDiamond,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { canAccess, RouteKey } from "../permissions";

interface SidebarProps {
  expanded: boolean;
  onToggle: (expanded: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  // State pour mobile sidebar (drawer)
  const [mobileOpen, setMobileOpen] = useState(false);

  // Links de navigation
  const links: {
    to: string;
    icon: React.ReactNode;
    labelKey: string;
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
      icon: <PercentDiamond size={20} />,
      labelKey: "sidebar.prediction",
      key: "prediction",
    },
  ];

  const visibleLinks = links.filter((link) =>
    user ? canAccess(user.country, link.key) : false
  );

  // ---- SIDEBAR CORE ----
  // Sous-composant pour éviter de répéter le code
  const SidebarCore = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col min-h-full h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {expanded && (
          <h1 className="text-xl font-semibold whitespace-nowrap">
            COVID Analytics
          </h1>
        )}
        {/* Cross pour fermer sur mobile */}
        {onClose ? (
          <button onClick={onClose} className="text-gray-400 md:hidden">
            <X size={24} />
          </button>
        ) : (
          <button onClick={() => onToggle(!expanded)} className="text-gray-400 hidden md:block">
            {expanded ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
      </div>

      {/* User Info */}
      {expanded && user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 uppercase">
                {user.role} - {user.country.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
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
              label={t(labelKey)}
              expanded={expanded}
              onClick={onClose} // Ferme la sidebar sur mobile après clic
            />
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-2 py-4 border-t border-gray-200">
        <button
          onClick={() => {
            logout();
            if (onClose) onClose();
          }}
          className={`flex items-center w-full ${
            expanded ? "justify-start px-4" : "justify-center px-2"
          } py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group`}
        >
          <LogOut size={20} className={expanded ? "mr-3" : ""} />
          {expanded ? (
            <span>{t("sidebar.logout")}</span>
          ) : (
            <div className="absolute left-20 w-auto p-2 min-w-max scale-0 rounded-md 
              bg-gray-700 text-xs text-white group-hover:scale-100 transition-all duration-100 z-50">
              {t("sidebar.logout")}
            </div>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Bouton menu burger mobile */}
      <button
        className="fixed top-4 left-4 z-50 bg-white p-2 rounded shadow md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Desktop */}
      <aside
        className={`
          ${expanded ? "w-64" : "w-20"}
          min-h-screen bg-white text-black shadow-lg transition-all duration-300 flex flex-col flex-shrink-0
          hidden md:flex
        `}
      >
        <SidebarCore />
      </aside>

      {/* Sidebar Mobile (drawer) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg z-50 p-0"
            onClick={e => e.stopPropagation()} // Empêche la fermeture si on clique dans le drawer
          >
            <SidebarCore onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;










// // src/components/Sidebar.tsx
// import React, { JSX } from "react";
// import { useTranslation } from "react-i18next";
// import SidebarLink from "./SidebarLink";
// import { PercentDiamond } from "lucide-react";

// import {
//   LayoutDashboard,
//   Globe,
//   BarChart,
//   Database,
//   LogOut,
//   Menu,
//   X,
//   User,
// } from "lucide-react";

// import { useAuth } from "../contexts/AuthContext";
// import { canAccess, RouteKey } from "../permissions";

// interface SidebarProps {
//   expanded: boolean;
//   onToggle: (expanded: boolean) => void;
// }

// const Sidebar: React.FC<SidebarProps> = ({ expanded, onToggle }) => {
//   const { user, logout } = useAuth();
//   const toggleSidebar = () => onToggle(!expanded);
//   const { t } = useTranslation();

//   const links: {
//     to: string;
//     icon: JSX.Element;
//     labelKey: string;
//     key: RouteKey;
//   }[] = [
//     {
//       to: "/",
//       icon: <LayoutDashboard size={20} />,
//       labelKey: "sidebar.dashboard",
//       key: "dashboard",
//     },
//     {
//       to: "/countries",
//       icon: <Globe size={20} />,
//       labelKey: "sidebar.countries",
//       key: "countries",
//     },
//     {
//       to: "/analytics",
//       icon: <BarChart size={20} />,
//       labelKey: "sidebar.analytics",
//       key: "analytics",
//     },
//     {
//       to: "/data-management",
//       icon: <Database size={20} />,
//       labelKey: "sidebar.dataManagement",
//       key: "data-management",
//     },
//     {
//       to: "/prediction",
//       icon: <PercentDiamond size={20} />, // ✅ correct icon
//       labelKey: "sidebar.prediction",
//       key: "prediction",
//     },
//   ];

//   const visibleLinks = links.filter((link) =>
//     user ? canAccess(user.country, link.key) : false
//   );

//   return (
//     <aside
//       className={`${
//         expanded ? "w-64" : "w-20"
//       } min-h-screen bg-white text-black shadow-lg transition-all duration-300 flex flex-col flex-shrink-0`}
//     >
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 border-b border-gray-200">
//         {expanded && (
//           <h1 className="text-xl font-semibold whitespace-nowrap">
//             COVID Analytics
//           </h1>
//         )}
//         <button onClick={toggleSidebar} className="text-gray-400">
//           {expanded ? <X size={20} /> : <Menu size={20} />}
//         </button>
//       </div>

//       {/* User Info */}
//       {expanded && user && (
//         <div className="p-4 border-b border-gray-200">
//           <div className="flex items-center gap-3">
//             <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
//               <User className="w-4 h-4 text-indigo-600" />
//             </div>
//             <div className="min-w-0">
//               <p className="text-sm font-medium text-gray-900 truncate">
//                 {user.username}
//               </p>
//               <p className="text-xs text-gray-500 uppercase">
//                 {user.role} - {user.country.toUpperCase()}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Navigation */}
//       <nav className="py-4 flex-1 overflow-y-auto">
//         {expanded && (
//           <div className="px-4 py-2 text-xs uppercase text-gray-500 font-semibold">
//             {t("sidebar.navigation")}
//           </div>
//         )}
//         <ul className="space-y-2 px-2">
//           {visibleLinks.map(({ to, icon, labelKey }) => (
//             <SidebarLink
//               key={to}
//               to={to}
//               icon={icon}
//               label={t(labelKey)}
//               expanded={expanded}
//             />
//           ))}
//         </ul>
//       </nav>

//       {/* Logout */}
//       <div className="px-2 py-4 border-t border-gray-200">
//         <button
//           onClick={logout}
//           className={`flex items-center w-full ${
//             expanded ? "justify-start px-4" : "justify-center px-2"
//           } py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors group`}
//         >
//           <LogOut size={20} className={expanded ? "mr-3" : ""} />

//           {expanded ? (
//             <span>{t("sidebar.logout")}</span>
//           ) : (
//             <div className="absolute left-20 w-auto p-2 min-w-max scale-0 rounded-md 
//               bg-gray-700 text-xs text-white group-hover:scale-100 transition-all duration-100 z-50">
//               {t("sidebar.logout")}
//             </div>
//           )}
//         </button>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;



