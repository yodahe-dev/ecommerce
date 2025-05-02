import {
  FaGlobe, FaLock, FaUserCircle, FaCopy, FaPaperPlane, FaImage, FaUserFriends, FaStar
} from 'react-icons/fa';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/for.jpg'; // replace with your image

const RoomProfile = ({ darkMode }) => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [tab, setTab] = useState('posts');
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [suspects, setSuspects] = useState([]);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const mockRoom = {
    id: 1,
    name: 'Startup Hub',
    username: '@startuphub',
    description: 'A room for business, ideas, and growth',
    members: 42,
    followers: 120,
    rating: 4.5,
    coFounders: ['john.doe', 'jane.smith'],
    posts: [
      {
        id: 1,
        description: 'Launching our MVP today!',
        image: logo,
        createdAt: '2024-04-01'
      }
    ],
    createdAt: '2024-03-01',
    type: 'public',
    users: [
      {
        username: 'john.doe',
        email: 'john@example.com',
        followers: 3200,
        rating: 4.8,
        role: 'co-founder',
      },
      {
        username: 'jane.smith',
        email: 'jane@example.com',
        followers: 2900,
        rating: 4.6,
        role: 'co-founder',
      },
      {
        username: 'marketer.tom',
        email: 'tom@ads.com',
        followers: 1800,
        rating: 4.2,
        role: 'marketer',
      },
      {
        username: 'idea.maria',
        email: 'maria@ideas.com',
        followers: 1200,
        rating: 4.0,
        role: 'idea generator',
      },
      {
        username: 'ceo.alex',
        email: 'alex@startup.com',
        followers: 5100,
        rating: 4.9,
        role: 'business man',
      },
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      setRoom(mockRoom);
      setLoading(false);
    }, 500);
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleTabChange = (t) => setTab(t);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatMessages(prev => [...prev, { sender: 'You', text: message, timestamp: new Date() }]);
    setMessage('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setChatMessages(prev => [
      ...prev,
      { sender: 'You', file: URL.createObjectURL(file), timestamp: new Date(), type: 'file' }
    ]);
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const toggleSuspect = (username) => {
    setSuspects((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaUserCircle className="animate-pulse text-4xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="p-4 bg-indigo-100 dark:bg-indigo-900 rounded-full shadow-md">
          <img src={logo} alt="Logo" className="w-12 h-12 object-cover rounded-full" />
        </div>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {room.name}
            {room.type === 'private' ? <FaLock className="text-red-500 text-sm" /> : <FaGlobe className="text-green-500 text-sm" />}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">{room.description}</p>
          <div className="flex gap-2 text-sm mt-1">
            <span>Created {new Date(room.createdAt).toLocaleDateString()}</span>
            <button onClick={copyRoomLink} className="text-gray-500 hover:text-indigo-600 dark:hover:text-white">
              <FaCopy />
            </button>
            {copySuccess && <span className="text-green-500">{copySuccess}</span>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-6">
        <div className="flex items-center gap-2">
          <FaUserFriends className="text-indigo-600" />
          <span>{room.members} Members</span>
        </div>
        <div className="flex items-center gap-2">
          <FaUserFriends className="text-indigo-600" />
          <span>{room.followers} Followers</span>
        </div>
        <div className="flex items-center gap-2">
          <FaStar className="text-yellow-500" />
          <span>{room.rating} Rating</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-gray-200 dark:border-gray-700 mb-6">
        {['posts', 'chat', 'members', 'settings'].map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`pb-2 text-sm font-semibold capitalize ${tab === t ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          {tab === 'posts' && (
            <div className="grid gap-8">
              {room.posts.map((post) => (
                <div key={post.id} className="p-6 border rounded-xl">
                  {post.image && <img src={post.image} alt="Post" className="w-full h-64 object-cover rounded-lg mb-4" />}
                  <p className="text-lg font-medium">{post.description}</p>
                  <p className="text-sm text-gray-500">Posted on {new Date(post.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}

          {tab === 'chat' && (
            <div className="flex flex-col gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg h-[300px] overflow-y-auto">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'You' ? 'bg-indigo-600 text-white' : 'bg-gray-300 dark:bg-gray-700'}`}>
                      {msg.file ? <a href={msg.file} target="_blank" rel="noopener noreferrer">File</a> : <span>{msg.text}</span>}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef}></div>
              </div>
              <div className="flex items-center gap-2">
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} className="flex-1 px-4 py-2 border rounded-lg" placeholder="Type a message..." />
                <button onClick={handleSendMessage} className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"><FaPaperPlane /></button>
                <input ref={fileInputRef} type="file" onChange={handleFileUpload} className="hidden" />
                <button onClick={() => fileInputRef.current.click()} className="p-2 hover:text-indigo-600"><FaImage /></button>
              </div>
            </div>
          )}

          {tab === 'members' && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {room.users.map((user, idx) => {
                const isCoFounder = room.coFounders.includes(user.username);
                return (
                  <div key={idx} className={`p-4 rounded-xl border ${isCoFounder ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-white dark:bg-gray-800'}`}>
                    <h4 className="font-bold text-lg">{user.username}</h4>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm mt-1">Role: {user.role}</p>
                    <p className="text-sm">Followers: {user.followers}</p>
                    <p className="text-sm mb-2">Rating: {user.rating}</p>
                    {!isCoFounder && (
                      <button
                        onClick={() => toggleSuspect(user.username)}
                        className={`text-xs px-3 py-1 rounded-md ${suspects.includes(user.username) ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-black dark:text-white'}`}
                      >
                        {suspects.includes(user.username) ? 'Unpin Suspect' : 'Pin as Suspect'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'settings' && (
            <div className="text-gray-600 dark:text-gray-300">
              <p>Settings content coming soon...</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RoomProfile;
