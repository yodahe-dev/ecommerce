import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaUserAlt, FaSignOutAlt, FaCog, FaChevronDown, FaSpinner } from 'react-icons/fa'; // Added FaSpinner for loading state
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile } from '../api'; // Assuming getProfile is the API call to fetch the user profile

const Nav = ({ isAuthenticated, onLogout, userEmail, token }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // For loading state
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user profile when token changes
  useEffect(() => {
    if (token) {
      setLoading(true);
      getProfile(token)
        .then((res) => {
          if (res.error) {
            setError(res.error);
          } else {
            setUser(res);
          }
          setLoading(false);
        })
        .catch((err) => {
          setError('An error occurred while fetching the profile.');
          setLoading(false);
        });
    }
  }, [token]);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 to-gray-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex-shrink-0 flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MyApp
            </span>
          </Link>

          <div className="flex items-center space-x-4">
          <Link
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-700/30"
            >
              Home
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <FaUserAlt className="text-sm" />
                <span className="text-sm font-medium">Sign In</span>
              </Link>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 hover:bg-gray-700/30 px-3 py-2 rounded-lg transition-all duration-200"
                >
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center relative">
                    <FaUserAlt className="text-lg" />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-900"></span>
                  </div>
                  <FaChevronDown className={`text-sm transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 origin-top-right bg-gray-800 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      <div className="py-2">
                        <div className="px-4 py-3 border-b border-gray-700">
                          <p className="text-sm text-gray-200">Signed in as</p>
                          <p className="text-sm font-medium text-white truncate">{user.email}</p>
                        </div>

                        <Link
                          to="/account"
                          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700/50 transition-colors duration-150"
                        >
                          <FaCog className="mr-3 text-gray-400" />
                          Account Settings
                        </Link>

                        <button
                          onClick={onLogout}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:bg-gray-700/50 transition-colors duration-150"
                        >
                          <FaSignOutAlt className="mr-3 text-red-400" />
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
    </nav>
  );
};

export default Nav;
