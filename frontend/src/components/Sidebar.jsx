import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaUser, FaUsers, FaPlusCircle, FaDoorOpen } from 'react-icons/fa';
import { MdMessage, MdGroupAdd } from 'react-icons/md';
import { Braces, HandshakeIcon, Network, PencilRuler } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, darkMode, setDarkMode }) => {
  const links = [
    { to: '/', label: 'Home', icon: <FaHome /> },
    { to: '/network', label: 'Network', icon: <FaUsers /> },
    { to: '/create', label: 'Create Project', icon: <FaPlusCircle /> },
    { to: '/rooms', label: 'Rooms', icon: <HandshakeIcon /> },
  ];

  return (
    <div
      className={`fixed z-40 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-transform transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="h-full flex flex-col p-4">
        {/* Sidebar Header with Dark Mode Toggle */}
        <div className="text-2xl font-semibold text-indigo-600 mb-6 flex items-center justify-between">
          <span>CollabHub</span>
          {/* Dark Mode Toggle Button */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full"
          >
            {darkMode ? '🌙' : '🌞'}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {links.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                  isActive
                    ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-600 dark:text-indigo-300'
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
