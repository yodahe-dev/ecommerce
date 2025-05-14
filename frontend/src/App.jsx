import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Nav from "./components/Nav";
import { FaSpinner } from "react-icons/fa";
import { getProfile } from "./api";
import CreateProduct from "./pages/seller/CreateProduct";
import SellerProfile from "./pages/seller/SellerProfile";
import Home from "./pages/users/Home";

function App() {
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedEmail = localStorage.getItem("email");
      const theme = localStorage.getItem("theme");

      if (storedToken) {
        setToken(storedToken);
        fetchAndSaveUserId(storedToken);
      }

      if (storedEmail) setEmail(storedEmail);
      setDarkMode(theme === "dark");
    } catch (err) {
      console.error("App init failed", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const fetchAndSaveUserId = async (token) => {
    try {
      const user = await getProfile(token);
      if (user?.id) {
        localStorage.setItem("user_id", user.id);
      }
    } catch (err) {
      console.error("Failed to fetch user ID", err);
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      setToken("");
      navigate("/login");
    }
  };

  const handleLogin = (newToken, newEmail) => {
    try {
      localStorage.setItem("token", newToken);
      localStorage.setItem("email", newEmail);
      setToken(newToken);
      setEmail(newEmail);
      fetchAndSaveUserId(newToken);
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
    setEmail("");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
        <p>Something went wrong. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="">
        <Nav
          isAuthenticated={!!token}
          userEmail={email}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <Routes>
            <Route
              path="/signup"
              element={
                <PublicOnlyRoute isAuthenticated={!!token}>
                  <Signup />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/login"
              element={
                <PublicOnlyRoute isAuthenticated={!!token}>
                  <Login onLogin={handleLogin} />
                </PublicOnlyRoute>
              }
            />

            <Route
              path="/upload"
              element={
                <ProtectedRoute isAuthenticated={!!token}>
                  <CreateProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={!!token}>
                  <SellerProfile />
                </ProtectedRoute>
              }
            />

             <Route
              path="/"
              element={
                <ProtectedRoute isAuthenticated={!!token}>
                  <Home/>
                </ProtectedRoute>
              }
            />

            

            <Route
              path="/account"
              element={
                <ProtectedRoute isAuthenticated={!!token}>
                  <Profile
                    token={token}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                  />
                </ProtectedRoute>
              }
            />

            {/* 404 fallback */}
            <Route
              path="*"
              element={
                <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
                  <p>404 - Page Not Found</p>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
