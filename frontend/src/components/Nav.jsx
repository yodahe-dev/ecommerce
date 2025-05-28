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
  FaSearch,
  FaHeart
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function Nav({
  isAuthenticated,
  onLogout,
  token,
  darkMode,
  setDarkMode,
  cartCount = 0
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Sample search suggestions
  const products = [
    "Smartphones", "Laptops", "Headphones", "Smart Watches", 
    "Cameras", "Gaming Consoles", "Tablets", "Speakers"
  ];

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
    if (searchTerm) {
      const filtered = products.filter(product => 
        product.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setSearchSuggestions(filtered);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowSearch(false);
    }
  };

  return (
    <nav 
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-500 ${
        darkMode 
          ? "bg-gray-900/80 border-gray-800" 
          : "bg-white/90 border-gray-200"
      } border-b shadow-xl`}
      style={{
        background: darkMode 
          ? "linear-gradient(135deg, rgba(17,24,39,0.9) 0%, rgba(31,41,55,0.9) 100%)" 
          : "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.9) 100%)"
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center"
                whileHover={{ rotate: 10 }}
              >
                <span className="text-white font-bold text-xl">AH</span>
              </motion.div>
              <motion.div 
                className="absolute -inset-1 rounded-xl bg-gradient-to-r from-orange-400 to-amber-500 opacity-0 group-hover:opacity-30 blur-sm transition-opacity duration-300 -z-10"
                initial={{ opacity: 0 }}
              />
            </div>
            <motion.span 
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500"
              whileHover={{ scale: 1.05 }}
            >
              AfroHive
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative" ref={searchRef}>

              
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute top-full right-0 mt-3 w-80 rounded-xl shadow-lg z-50 ${
                      darkMode ? "bg-gray-800" : "bg-white"
                    }`}
                  >
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <NavLink to="/" label="Home" darkMode={darkMode} />
            <NavLink to="/search" label="search" darkMode={darkMode} />
            <NavLink to="/products" label="Products" darkMode={darkMode} />
            <NavLink to="/about" label="About" darkMode={darkMode} />
            <NavLink to="/contact" label="Contact" darkMode={darkMode} />
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full relative overflow-hidden ${
                darkMode 
                  ? "bg-orange-400 text-gray-900" 
                  : "bg-orange-500 text-white"
              }`}
            >
              <motion.div
                animate={{ rotate: darkMode ? 0 : 360 }}
                transition={{ duration: 0.5 }}
              >
                {darkMode ? <FaSun /> : <FaMoon />}
              </motion.div>
            </button>
            
            <Link 
              to="/wishlist" 
              className={`p-2 rounded-full relative ${
                darkMode 
                  ? "text-gray-300 hover:text-white" 
                  : "text-gray-600 hover:text-orange-500"
              }`}
            >
              <FaHeart />
              <div className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-orange-500 text-white text-xs rounded-full">
                3
              </div>
            </Link>
            
           
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-4">
        
            
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${
                darkMode 
                  ? "bg-orange-400 text-gray-900" 
                  : "bg-orange-500 text-white"
              }`}
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
            
            <button
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className={`p-2 rounded-full ${
                darkMode 
                  ? "bg-gray-800 text-gray-300" 
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Profile or Sign In (Desktop) */}
          <div className="ml-4 relative hidden md:block" ref={dropdownRef}>
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 group"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center">
                      <FaUserAlt className="text-white text-sm" />
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 opacity-0 group-hover:opacity-30 -z-10 transition-opacity" />
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
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 z-10 overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-amber-500 flex items-center justify-center">
                            <FaUserAlt className="text-white text-sm" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">John Doe</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">john@afrohive.com</p>
                          </div>
                        </div>
                      </div>
                      
                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <FaUserAlt className="text-orange-500 dark:text-orange-400" />
                        </div>
                        <span>Profile</span>
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <FaCog className="text-orange-500 dark:text-orange-400" />
                        </div>
                        <span>Settings</span>
                      </Link>
                      
                      <button
                        onClick={onLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          <FaSignOutAlt className="text-red-500" />
                        </div>
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 text-white font-medium hover:from-orange-500 hover:to-amber-600 transition-all shadow-md hover:shadow-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`md:hidden overflow-hidden ${
                darkMode ? "bg-gray-800" : "bg-gray-50"
              } rounded-lg mb-2`}
            >
              <form onSubmit={handleSearch} className="p-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search products..."
                    className={`w-full py-3 pl-10 pr-4 rounded-lg ${
                      darkMode 
                        ? "bg-gray-700 text-white border-gray-600" 
                        : "bg-white text-gray-900 border-gray-200"
                    } border focus:outline-none focus:ring-2 focus:ring-orange-400`}
                    autoFocus
                  />
                  <FaSearch 
                    className={`absolute left-3 top-3.5 ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`} 
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Nav Links */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`md:hidden overflow-hidden rounded-xl ${
                darkMode ? "bg-gray-800" : "bg-gray-50"
              } shadow-lg mb-4`}
            >
              <div className="flex flex-col py-4">
                <MobileNavLink to="/" label="Home" darkMode={darkMode} />
                <MobileNavLink to="/search" label="search" darkMode={darkMode} />
                <MobileNavLink to="/products" label="Products" darkMode={darkMode} />
                <MobileNavLink to="/about" label="About" darkMode={darkMode} />
                <MobileNavLink to="/contact" label="Contact Us" darkMode={darkMode} />
                <MobileNavLink to="/wishlist" label="Wishlist" darkMode={darkMode} />
                
                
                <div className="px-4 py-3 mt-2">
                  {isAuthenticated ? (
                    <div className="flex flex-col gap-3">
                      <MobileNavLink to="/account" label="Profile" darkMode={darkMode} />
                      <MobileNavLink to="/settings" label="Settings" darkMode={darkMode} />
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      >
                        <FaSignOutAlt className="text-red-500" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full block text-center px-4 py-3 rounded-lg bg-gradient-to-r from-orange-400 to-amber-500 text-white font-medium"
                    >
                      Sign In
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function NavLink({ to, label, darkMode }) {
  return (
    <Link
      to={to}
      className="relative px-3 py-1.5 font-medium transition-colors group"
    >
      <span className={`relative z-10 ${
        darkMode ? "text-gray-300 group-hover:text-white" : "text-gray-700 group-hover:text-gray-900"
      }`}>
        {label}
      </span>
      <motion.div 
        className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full group-hover:w-full transition-all"
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
      />
    </Link>
  );
}


function MobileNavLink({ to, label, darkMode }) {
  return (
    <Link
      to={to}
      className={`px-6 py-3 text-lg font-medium ${
        darkMode 
          ? "text-gray-300 hover:bg-gray-700 hover:text-white" 
          : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
      } transition-colors`}
    >
      {label}
    </Link>
  );

}