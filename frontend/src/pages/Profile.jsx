import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSpinner, FaCopy } from 'react-icons/fa';
import { MdDarkMode, MdLightMode } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../api';

export default function Profile({ token, darkMode, setDarkMode }) {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [following, setFollowing] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    getProfile(token)
      .then((res) => {
        if (res.error) {
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setUser(res);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile.');
        setLoading(false);
      });
  }, [token, navigate]);

  const toggleFollow = () => {
    setFollowing(!following);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-10 text-red-500">{error}</div>;
  }

  return (
    <div className={`${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <FaUserCircle className="text-6xl text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
                <button
                  onClick={copyEmail}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                >
                  <FaCopy />
                </button>
                {copySuccess && <span className="text-sm text-green-500">{copySuccess}</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {darkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>
          </div>
        </div>

        


      </div>
    </div>
  );
}
