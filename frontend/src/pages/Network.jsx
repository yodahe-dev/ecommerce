import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaHandshake,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaTwitch,
  FaRegStar,
  FaCheckCircle,
  FaBuilding,
  FaBitcoin,
  FaMoneyBillWave
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';
import placeholderAvatar from '../assets/for.jpg';

const skillsList = [
  'TikTok', 'Instagram', 'YouTube', 'Twitch',
  'Gaming', 'Streaming', 'Investing', 'B2B',
  'Real Estate', 'Finance', 'Stock Trading', 'Brokerage'
];

const mockUsers = [
  {
    id: 1,
    name: 'Emma Waves',
    role: 'TikTok Creator',
    company: 'Wave Media',
    skills: ['TikTok', 'Video Editing', 'Brand Deals'],
    bio: '2M+ followers. Viral dance and challenge videos.',
    links: { instagram: '#', tiktok: '#', youtube: '#' },
    followers: 2000000,
    rating: 4.9,
    reviews: 120,
    verified: true,
    online: true,
    collabs: 35,
  },
  {
    id: 2,
    name: 'Max Gamer',
    role: 'Pro Gamer',
    company: 'Elite E-sports',
    skills: ['Gaming', 'Streaming', 'Twitch'],
    bio: 'Top FPS player. 500K+ fans on Twitch and YouTube.',
    links: { twitch: '#', youtube: '#', instagram: '#' },
    followers: 500000,
    rating: 4.7,
    reviews: 85,
    verified: false,
    online: false,
    collabs: 20,
  },
  {
    id: 3,
    name: 'Laura Funds',
    role: 'Investor',
    company: 'Capital Growth LLC',
    skills: ['Investing', 'Finance', 'Stock Trading'],
    bio: 'Managed $50M portfolio. Focus on tech startups.',
    links: { linkedin: '#', twitter: '#', website: '#' },
    followers: 15000,
    rating: 4.8,
    reviews: 60,
    verified: true,
    online: true,
    collabs: 12,
  },
  {
    id: 4,
    name: 'Sara Broker',
    role: 'Stock Broker',
    company: 'MoneyWise Corp',
    skills: ['Brokerage', 'B2B', 'Real Estate'],
    bio: 'Expert in corporate deals and real estate investments.',
    links: { linkedin: '#', website: '#', twitter: '#' },
    followers: 8000,
    rating: 4.6,
    reviews: 40,
    verified: false,
    online: false,
    collabs: 8,
  }
];

const Network = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ skills: [] });
  const [users, setUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = debounce(q => {
    setLoading(true);
    setTimeout(() => {
      const res = mockUsers.filter(u =>
        u.name.toLowerCase().includes(q.toLowerCase()) ||
        u.role.toLowerCase().includes(q.toLowerCase()) ||
        u.company.toLowerCase().includes(q.toLowerCase()) ||
        u.skills.some(s => s.toLowerCase().includes(q.toLowerCase()))
      );
      setUsers(res);
      setLoading(false);
    }, 300);
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  const toggleSkill = skill => {
    setFilters(prev => ({
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const filtered = users.filter(u =>
    filters.skills.length === 0 ||
    filters.skills.every(s => u.skills.includes(s))
  );

  const collab = id => console.log('Request collab:', id);

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent"
          >
            Collaborator Network
          </motion.h1>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Search by name, role, company..."
              className="w-full pl-12 pr-4 py-4 rounded-full shadow-2xl bg-white dark:bg-gray-800 dark:text-white text-gray-800 focus:ring-2 focus:ring-purple-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {skillsList.map(skill => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-4 py-2 rounded-full text-sm transition ${
            filters.skills.includes(skill)
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
            >
              {skill}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="flex flex-wrap gap-6 justify-center">
          {filtered.map(u => (
            <motion.div
              key={u.id}
              whileHover={{ y: -5 }}
              className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl transition max-w-xs w-full"
            >
              <div className="flex items-center mb-4">
                <div className="relative">
                  <img
                    src={placeholderAvatar}
                    alt={u.name}
                    className="w-16 h-16 rounded-full border-2 border-purple-300 dark:border-gray-700"
                  />
                  {u.online && (
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{u.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{u.role} @ {u.company}</p>
                </div>
                {u.verified && <FaCheckCircle className="text-green-500 text-xl" />}
              </div>

              {/* stats */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <FaRegStar className="text-yellow-400" /> <span>{u.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaMoneyBillWave /> <span>{u.reviews} reviews</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaBitcoin /> <span>{(u.followers/1000).toFixed(1)}K fans</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaHandshake /> <span>{u.collabs} collabs</span>
                </div>
              </div>

              {/* skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {u.skills.map(s => (
                  <span key={s} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs">
                    {s}
                  </span>
                ))}
              </div>

              {/* bio */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">{u.bio}</p>

              {/* links + collab */}
              <div className="flex items-center justify-between">
                <div className="flex gap-3 text-gray-500 dark:text-gray-400">
                  {u.links.linkedin && <a href={u.links.linkedin}><FaLinkedin /></a>}
                  {u.links.twitter  && <a href={u.links.twitter}><FaTwitter /></a>}
                  {u.links.instagram&& <a href={u.links.instagram}><FaInstagram /></a>}
                  {u.links.tiktok   && <a href={u.links.tiktok}><FaTiktok /></a>}
                  {u.links.youtube  && <a href={u.links.youtube}><FaYoutube /></a>}
                  {u.links.twitch   && <a href={u.links.twitch}><FaTwitch /></a>}
                </div>
                <button
                  onClick={() => collab(u.id)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-full flex items-center gap-2"
                >
                  <FaHandshake />
                  <span>Collaborate</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* no results */}
        {filtered.length === 0 && !loading && (
          <div className="text-center py-16">
            <FaSearch className="text-gray-500 dark:text-gray-400 text-5xl mb-4" />
            <p className="text-lg text-gray-500 dark:text-gray-400">No results found</p>
          </div>
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin border-4 border-t-4 border-purple-600 rounded-full w-12 h-12 mx-auto mb-4"></div>
            <p className="text-lg text-gray-500 dark:text-gray-400">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Network;
