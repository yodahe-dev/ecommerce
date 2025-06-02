import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaSpinner, FaRedo } from "react-icons/fa";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Nav from "./components/Nav";
import { getProfile } from "./api";
import Home from "./pages/users/Home";
import Catagory from "./pages/users/Catagory";
import About from "./pages/users/About";
import Contact from "./pages/users/contact";
import ProductDetail from "./pages/users/details";
import Checkout from "./pages/users/Checkout";
import Search from "./pages/users/Search";
import CreateProduct from "./components/CreateProduct";
import PaymentSuccess from "./pages/payment-success";

function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        
        const storedToken = localStorage.getItem("token");
        const theme = localStorage.getItem("theme");

        if (storedToken) {
          setToken(storedToken);
          const profile = await getProfile(storedToken);
          if (profile?.id) {
            setUser(profile);
            localStorage.setItem("user_id", profile.id);
          } else {
            throw new Error("Invalid profile");
          }
        }

        setDarkMode(theme ? theme === "dark" : true);
      } catch (err) {
        console.error("App init failed", err);
        setHasError(true);
        localStorage.removeItem("token");
        localStorage.removeItem("user_id");
        setToken("");
        setUser(null);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [navigate]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      document.body.style.backgroundColor = "#111827";
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      document.body.style.backgroundColor = "#f9fafb";
    }
  }, [darkMode]);

  const handleLogin = async (newToken, newEmail) => {
    try {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      const profile = await getProfile(newToken);
      if (profile?.id) {
        setUser(profile);
        localStorage.setItem("user_id", profile.id);
      }
      navigate("/");
    } catch (err) {
      console.error("Login failed", err);
      setHasError(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    setToken("");
    setUser(null);
    navigate("/login");
  };

  const handleRetry = () => {
    setIsLoading(true);
    setHasError(false);
    const init = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          const profile = await getProfile(storedToken);
          if (profile?.id) {
            setUser(profile);
            localStorage.setItem("user_id", profile.id);
            setToken(storedToken);
          } else {
            throw new Error("Invalid profile");
          }
        }
      } catch (err) {
        console.error("Retry failed", err);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border-8 border-indigo-500 border-t-transparent"
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-2xl font-bold text-gray-800 dark:text-white"
          >
            Loading AfroHive
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2 text-gray-600 dark:text-gray-300"
          >
            Preparing your experience...
          </motion.p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900/20">
        <div className="max-w-md p-8 rounded-3xl bg-white dark:bg-gray-800 shadow-2xl text-center">
          <div className="w-32 h-32 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-16 h-16 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            We encountered an issue while loading your data. Please try again.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRetry}
            className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full shadow-lg flex items-center gap-3 mx-auto"
          >
            <FaRedo className="text-xl" />
            <span>Retry Now</span>
          </motion.button>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 text-orange-500 dark:text-amber-400 font-medium hover:underline"
          >
            Or return to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen transition-colors duration-300 ${darkMode ? "dark" : ""}`}>
      <Nav
        isAuthenticated={!!token}
        userEmail={user?.email || ""}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white"
      >
        <AnimatePresence mode="wait">
          <Routes>
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute isAuthenticated={!!token}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Signup />
                  </motion.div>
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute isAuthenticated={!!token}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Login onLogin={handleLogin} />
                  </motion.div>
                </PublicOnlyRoute>
              }
            />
            
            <Route 
              path="/" 
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Home />
                </motion.div>
              } 
            />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<Catagory />} />
            <Route path="/about" element={<About />} />
            <Route path="/search" element={<Search />} />
            <Route path="/payment-success" element={<PaymentSuccess/>} />


            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/upload" element={<CreateProduct/>} />

            <Route
              path="/checkout/:id"
              element={
                <ProtectedRoute
                  isAuthenticated={!!token}
                  userRole={user?.role?.name}
                >
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <ProtectedRoute
                  isAuthenticated={!!token}
                  userRole={user?.role?.name}
                >
                  <Profile
                    token={token}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={
                <div className="flex flex-col justify-center text-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8"
                  >
                    <div className="w-48 h-48 mx-auto bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6">
                      <span className="text-9xl text-white">404</span>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
                      Page Not Found
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                      The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/")}
                      className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-full shadow-lg"
                    >
                      Return to Home
                    </motion.button>
                  </motion.div>
                </div>
              }
            />
          </Routes>
        </AnimatePresence>
      </motion.main>

      
    </div>
  );
}

export default App;