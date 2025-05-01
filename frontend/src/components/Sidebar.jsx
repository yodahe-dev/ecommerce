import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUser, FaPlusCircle, FaUsers, FaDoorOpen } from 'react-icons/fa';
import { MessageCircle , Network } from 'lucide-react';

const Sidebar = ({ onLogout, isOpen, onClose, darkMode, setDarkMode }) => {
  const links = [
    { to: '/', label: 'Home', icon: <FaHome /> },
    { to: '/network', label: 'Network', icon: <Network /> },
    { to: '/chat', label: 'Chat', icon: <MessageCircle/> },
    { to: '/create', label: 'New Project', icon: <FaPlusCircle /> },
    { to: '/collabs', label: 'Collabs', icon: <FaUsers /> },
    { to: '/rooms', label: 'Rooms', icon: <FaDoorOpen /> },
  ];

  return (
    <div
      className={`fixed z-40 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="h-full flex flex-col p-4">
        <div className="text-2xl font-bold text-indigo-600 mb-6">CollabClub</div>

        <nav className="flex-1 space-y-2">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                  isActive
                    ? 'bg-gray-100 dark:bg-gray-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`
              }
              onClick={onClose}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
