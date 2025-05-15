import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUserAlt,
  FaSignOutAlt,
  FaCog,
  FaChevronDown,
  FaShoppingCart,
  FaMoon,
  FaSun,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { getProfile } from "../api";

export default function Nav({
  isAuthenticated,
  onLogout,
  token,
  darkMode,
  setDarkMode,
  cartCount = 0,
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const closeDropdown = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  useEffect(() => {
    if (!token) return;
    getProfile(token)
      .then((res) => setUser(res))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/login");
      });
  }, [token, navigate]);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 shadow-sm w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            Pickup
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" label="Home" />
            <NavLink to="/search" label="Search" />
            <NavLink to="/category" label="Category" />
            <NavLink to="/about" label="About" />

            {/* Cart */}
            <Link to="/cart" className="relative group">
              <FaShoppingCart className="text-lg text-gray-700 dark:text-white group-hover:text-orange-500 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-1.5 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
              title="Toggle theme"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-gray-600 dark:text-gray-300"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative">
              <FaShoppingCart className="text-lg text-gray-700 dark:text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 text-xs bg-red-500 text-white px-1.5 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="text-gray-700 dark:text-white"
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Profile Always Visible */}
          {isAuthenticated && (
            <div className="ml-4 relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <FaUserAlt className="text-white text-sm" />
                </div>
                <FaChevronDown
                  className={`text-gray-700 dark:text-white transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                  >
                    <Link
                      to="/account"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FaCog /> Profile
                    </Link>
                    <button
                      onClick={onLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      <FaSignOutAlt /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Nav Links */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="flex flex-col gap-2 py-4">
                <NavLink to="/" label="Home" />
                <NavLink to="/search" label="Search" />
                <NavLink to="/category" label="Category" />
                <NavLink to="/about" label="About" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function NavLink({ to, label }) {
  return (
    <Link
      to={to}
      className="block text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 transition px-2"
    >
      {label}
    </Link>
  );
}
