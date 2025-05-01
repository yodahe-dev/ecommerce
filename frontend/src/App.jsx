import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Nav from './components/Nav';
import Sidebar from './components/Sidebar';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { FaSpinner, FaBars } from 'react-icons/fa';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import RightSidebar from './components/RightSidebar';

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('email');
    const theme = localStorage.getItem('theme');

    if (savedToken) setToken(savedToken);
    if (savedEmail) setEmail(savedEmail);
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

  const handleLogin = (token, email) => {
    localStorage.setItem('token', token);
    localStorage.setItem('email', email);
    setToken(token);
    setEmail(email);
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

      {/* Sidebar */}
      <Sidebar
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <div className="flex-1 flex flex-col lg:ml-64 transition-all">
        {/* Nav */}
        <Nav
          token={token}
          isAuthenticated={!!token}
          userEmail={email}
          onLogout={handleLogout}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <Routes>
            <Route path="/" element={<Home />} />

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

      <RightSidebar darkMode={darkMode} setDarkMode={setDarkMode} onLogout={handleLogout} />

    </div>
  );
}

export default App;
