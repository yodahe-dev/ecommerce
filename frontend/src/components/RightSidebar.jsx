// src/components/RightSidebar.js
import React, { useState, useEffect, useRef } from 'react';
import {
  FaUserFriends, FaUsers, FaLock, FaRobot, FaLayerGroup,
  FaChevronLeft, FaSearch, FaPaperPlane, FaImage, FaBell,
} from 'react-icons/fa';
import image from '../assets/for.jpg';
import ReactMarkdown from 'react-markdown';

const RightSidebar = ({
  darkMode,
  width = 'w-80',
  className = '',
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('personal');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const users = [
    { id: 1, name: 'Yodahe', username: 'yodahe.dev', profileimage: image, online: true, lastSeen: new Date(), unread: 2 },
    { id: 2, name: 'Alice',  username: 'alice.dev',  profileimage: image, online: false, lastSeen: new Date(Date.now() - 3600000), unread: 0 },
  ];

  useEffect(() => {
    const stored = localStorage.getItem('chatMessages');
    if (stored) setChatMessages(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    setChatMessages(prev => [
      ...prev,
      { sender: 'You', text: message, timestamp: new Date() }
    ]);
    setMessage('');
  };

  const handleKey = e => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const handleFileUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    setChatMessages(prev => [
      ...prev,
      { sender: 'You', file: URL.createObjectURL(file), timestamp: new Date(), type: 'file' }
    ]);
  };

  const tabs = [
    { key: 'personal', label: 'Personal', icon: <FaUserFriends />, badge: users.reduce((a,u)=>a+u.unread,0) },
    { key: 'group',    label: 'Groups',   icon: <FaUsers />,       badge: 0 },
    { key: 'channel',  label: 'Channels', icon: <FaLock />,        badge: 0 },
    { key: 'ai',       label: 'AI',       icon: <FaRobot />,       badge: 0 },
    { key: 'other',    label: 'Other',    icon: <FaLayerGroup />,  badge: 0 },
  ];

  return (
    <aside className={`${width} h-screen flex flex-col p-2 ${className} ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      {!selectedUser ? (
        <>
          <div className="flex justify-between mb-4">
            {tabs.map(tab => (
              <div key={tab.key} className="relative group">
                <button
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 py-2 px-4 rounded-md transition hover:bg-gray-100 dark:hover:bg-gray-700
                    ${activeTab === tab.key ? 'bg-gray-200 dark:bg-gray-800' : ''}`}
                >
                  {tab.icon}
                  {tab.badge > 0 && <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded-full">{tab.badge}</span>}
                </button>
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2 opacity-0 group-hover:opacity-100 text-xs bg-gray-700 text-white px-2 py-1 rounded-md">
                  {tab.label}
                </span>
              </div>
            ))}
          </div>

          <div className="relative mb-2">
            <FaSearch className={`absolute left-3 top-3 ${darkMode ? 'text-gray-300' : 'text-gray-400'}`} />
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none
                ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
            />
          </div>

          <div className="overflow-y-auto flex-1">
            {activeTab === 'personal' ? (
              users
                .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(user => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex p-2 mb-1 rounded-lg hover:${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                  >
                    <div className="relative">
                      <img src={user.profileimage} alt="" className="h-10 w-10 rounded-full" />
                      {user.online && <span className="absolute bottom-0 right-0 h-2 w-2 bg-green-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="ml-3 flex-1 text-left">
                      <p className="font-semibold truncate">{user.name}</p>
                      <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>@{user.username}</p>
                      {!user.online && <p className="text-xs text-gray-400">Last seen {user.lastSeen.toLocaleTimeString()}</p>}
                    </div>
                    {user.unread > 0 && <span className="text-xs bg-blue-500 text-white rounded-full px-2">{user.unread}</span>}
                  </button>
                ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <FaBell size={40} className="mb-2" />
                <p>No {activeTab} chats.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex items-center p-2 border-b dark:border-gray-800">
            <button onClick={() => setSelectedUser(null)} className="p-1 mr-2">
              <FaChevronLeft />
            </button>
            <img src={selectedUser.profileimage} alt="" className="h-8 w-8 rounded-full" />
            <div className="ml-2">
              <p className="font-semibold">{selectedUser.name}</p>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedUser.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-2 rounded-xl
                  ${msg.sender === 'You'
                    ? 'bg-blue-500 text-white'
                    : (darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200')}`}
                >
                  {msg.file
                    ? <img src={msg.file} alt="" className="max-w-full rounded" />
                    : <ReactMarkdown>{msg.text}</ReactMarkdown>
                  }
                  <div className="text-right text-xs mt-1 opacity-75">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-2 border-t dark:border-gray-800">
            <div className="flex items-center">
              <button onClick={() => fileInputRef.current.click()}><FaImage /></button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              <div className="ml-2 relative flex-1">
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyPress={handleKey}
                  placeholder="Type a message..."
                  className={`w-full pl-4 pr-10 py-2 rounded-full focus:outline-none
                    ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
                />
                <button onClick={handleSendMessage} className="absolute right-2 top-2">
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
