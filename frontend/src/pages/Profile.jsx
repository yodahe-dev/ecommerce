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
              onClick={toggleFollow}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                following ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {following ? 'Unfollow' : 'Follow'}
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              {darkMode ? <MdLightMode /> : <MdDarkMode />}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-8">
          {[
            ['Posts', 12],
            ['Followers', 20],
            ['Following', 10],
            ['Rooms', 3],
          ].map(([label, value]) => (
            <div key={label} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-xl font-semibold text-indigo-600">{value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
          {['posts', 'rooms', 'collabs', 'followers'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm font-medium ${
                tab === t
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {tab === 'posts' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[{ title: 'First Post', content: 'Post content here', createdAt: '2025-05-01' }].map((post) => (
                <div key={post.title} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition-transform transform hover:scale-105">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">{post.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">{post.content}</p>
                  <p className="text-xs text-gray-400 mt-4">{new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'rooms' && <div>No joined rooms yet.</div>}

          {tab === 'collabs' && <p>Collaboration feature coming soon.</p>}

          {tab === 'followers' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[{ username: 'follower1', email: 'follower1@example.com' }].map((follower) => (
                <div key={follower.username} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                  <h5 className="font-medium text-gray-800 dark:text-white">{follower.username}</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{follower.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
