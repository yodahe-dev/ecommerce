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
import Catagory from "./pages/users/Catagory";
import About from "./pages/users/About";
import Search from "./pages/users/Search";
import ProductDetail from "./pages/users/details";
import Checkout from "./pages/users/Checkout";

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
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
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
    <div className={darkMode ? "dark" : ""}>
      <Nav
        isAuthenticated={!!token}
        userEmail={user?.email || ""}
        onLogout={handleLogout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <main className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        <Routes>
          {/* Public routes */}
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

          {/* Seller only routes */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute
                isAuthenticated={!!token}
                userRole={user?.role?.name}
                requiredRoles={["seller"]}
              >
                <CreateProduct />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute
                isAuthenticated={!!token}
                userRole={user?.role?.name}
                requiredRoles={["seller"]}
              >
                <SellerProfile />
              </ProtectedRoute>
            }
          />

          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/products" element={<Catagory />} />
          <Route path="/about" element={<About />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          {/* Checkout for any logged-in user */}
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

          {/* Auth-only user profile */}
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

          {/* Admin-only route example */}
          {/* You can add other admin or manager routes with requiredRoles */}

          {/* Fallback 404 */}
          <Route
            path="*"
            element={
              <div className="flex flex-col justify-center text-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
                <p className="text-3xl">404 - Page Not Found</p>
                <p className="font-extrabold text-9xl">😒</p>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
