// src/App.js
import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Sidebar from './components/Sidebar';
import RightSidebar from './components/RightSidebar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Network from './pages/network';
import RoomProfile from './pages/Rooms';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { FaSpinner, FaBars } from 'react-icons/fa';
import CreatePage from './pages/create';

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const e = localStorage.getItem('email');
    const theme = localStorage.getItem('theme');
    if (t) setToken(t);
    if (e) setEmail(e);
    if (theme === 'dark') setDarkMode(true);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogin = (t, e) => {
    localStorage.setItem('token', t);
    localStorage.setItem('email', e);
    setToken(t);
    setEmail(e);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setToken('');
    setEmail('');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-2xl p-2 bg-indigo-600 text-white rounded-md"
        >
          <FaBars />
        </button>
      </div>

      {/* Left Sidebar */}
      <Sidebar
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 transition-all">
        <Nav
          token={token}
          isAuthenticated={!!token}
          userEmail={email}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <Routes>
            <Route path="/"       element={<Home />} />
            <Route path="/network" element={<Network />} />
            <Route path="/rooms"   element={<RoomProfile />} />
            <Route path="/create"   element={<CreatePage />} />

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
              path="/account"
              element={
                <ProtectedRoute isAuthenticated={!!token}>
                  <Profile token={token} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>

      {/* Right Sidebar (hidden on small screens) */}
      <RightSidebar
        darkMode={darkMode}
        width="w-96"
        className="hidden lg:flex"
      />
    </div>
  );
}

export default App;
