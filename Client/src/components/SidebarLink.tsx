import React from 'react';
import { NavLink } from 'react-router-dom';


interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onClick?: () => void; // Ajout d'un prop onClick optionnel
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, expanded, onClick }) => {
  return (
    <li className="relative group">
      <NavLink
        to={to}
        className={({ isActive }) => `
          flex items-center px-4 py-3 rounded-lg transition-colors
          ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'}
        `}
        onClick={onClick} // Utilisation du prop onClick
      >
        <div className={expanded ? 'mr-3' : 'mx-auto'}>
          {icon}
        </div>
        {expanded && <span>{label}</span>}
      </NavLink>
      
      {/* Tooltip for collapsed state */}
      {!expanded && (
        <div className="absolute left-20 top-0 w-auto p-2 min-w-max scale-0 rounded-md 
          bg-gray-700 text-xs text-white group-hover:scale-100 transition-all duration-100 z-50">
          {label}
        </div>
      )}
    </li>
  );
};

export default SidebarLink;