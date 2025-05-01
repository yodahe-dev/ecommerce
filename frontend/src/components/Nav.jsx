import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserAlt, FaSignOutAlt, FaCog, FaChevronDown, FaPlus, FaMoon, FaSun } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile } from '../api';

const Nav = ({ isAuthenticated, onLogout, userEmail, token, darkMode, setDarkMode }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then((res) => setUser(res))
      .catch(() => {
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [token, navigate]);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 hidden sm:flex">CollabClub</Link>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/create" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
              <FaPlus />
              Create
            </Link>


            <button onClick={toggleDarkMode} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600">
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {!isAuthenticated ? (
              <Link to="/login" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg">
                Sign In
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(prev => !prev)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                    <FaUserAlt className="text-white text-sm" />
                  </div>
                  <FaChevronDown className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>



                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50"
                    >
                      <div className="text-sm">
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <p className="text-gray-500 dark:text-gray-400">Signed in as</p>
                          <p className="font-medium truncate text-gray-800 dark:text-white">{user?.email || userEmail}</p>
                        </div>
                        <Link to="/account" className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <FaCog className="mr-2" />
                          Profile
                        </Link>
                        <button onClick={onLogout} className="flex items-center w-full text-left px-4 py-3 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <FaSignOutAlt className="mr-2" />
                          Log Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dark Mode Button */}
      <div className="absolute top-4 right-4 z-50 md:hidden flex items-center gap-2">
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

      </div>
    </nav>
  );
};

export default Nav;
