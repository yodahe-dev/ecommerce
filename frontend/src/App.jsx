// App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Nav from './components/Nav';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Profile from './pages/Profile';
import { FaSpinner } from 'react-icons/fa';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute'; // new component

function App() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('email');

    if (savedToken) setToken(savedToken);
    if (savedEmail) setEmail(savedEmail);
    setIsLoading(false);
  }, []);

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
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <Nav token={token} isAuthenticated={!!token} userEmail={email} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Navigate to="/account" />} />

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
    </div>
  );
}

export default App;
