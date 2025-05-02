import React, { useState } from 'react'
import { FaUsers, FaLayerGroup, FaUser, FaStar, FaCog, FaHeart, FaUserCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const features = [
  {
    id: 1,
    name: 'Rooms',
    icon: <FaUsers className="text-3xl text-blue-600" />,
    description: 'Create and manage rooms for your projects.',
    to: "/newroom"
  },
  {
    id: 2,
    name: 'Posts',
    icon: <FaLayerGroup className="text-3xl text-green-600" />,
    description: 'Share updates and news about your projects.',
    to: "/posts"
  },
  {
    id: 3,
    name: 'Settings',
    icon: <FaCog className="text-3xl text-gray-600" />,
    description: 'Manage your account settings and preferences.',
    to: "/settings"
  }
]

const rooms = [
  {
    id: 1,
    name: 'React Devs',
    username: 'john_doe',
    followers: 150,
    posts: 42,
    rating: 4.5,
    members: 30,
    avatar: null
  },
  {
    id: 2,
    name: 'UI Designers',
    username: 'jane_ui',
    followers: 230,
    posts: 65,
    rating: 4.8,
    members: 44,
    avatar: "https://i.pravatar.cc/150?img=3"
  },
  {
    id: 3,
    name: 'Node Masters',
    username: 'node_guy',
    followers: 120,
    posts: 35,
    rating: 4.2,
    members: 27,
    avatar: null
  }
]

function CreatePage() {
  const [search, setSearch] = useState("")

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-2xl font-semibold mb-4">Create</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        {features.map(item => (
          <Link
            to={item.to}
            key={item.id}
            className="border rounded-2xl shadow-md p-4 hover:shadow-xl transition-all bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <div className="mb-2">{item.icon}</div>
            <h2 className="text-lg font-medium mb-1">{item.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
          </Link>
        ))}
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Your Rooms</h2>
        <input
          type="text"
          placeholder="Search rooms..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full p-2 rounded-md border dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map(room => (
          <div
            key={room.id}
            className="border rounded-2xl shadow-md p-5 bg-white dark:bg-gray-800 hover:shadow-lg transition-all"
          >
            <div className="flex items-center mb-3">
              {room.avatar ? (
                <img
                  src={room.avatar}
                  alt={room.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <FaUserCircle className="text-4xl text-gray-400 mr-3" />
              )}
              <div>
                <h3 className="text-lg font-bold">{room.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">@{room.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300 mb-3">
              <p className="flex items-center"><FaHeart className="mr-2 text-red-500" /> {room.followers} followers</p>
              <p className="flex items-center"><FaLayerGroup className="mr-2 text-green-600" /> {room.posts} posts</p>
              <p className="flex items-center"><FaStar className="mr-2 text-yellow-500" /> Rating: {room.rating}</p>
              <p className="flex items-center"><FaUsers className="mr-2 text-blue-500" /> {room.members} members</p>
            </div>

            <Link
              to={`/rooms/${room.id}`}
              className="inline-block mt-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              View Room
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CreatePage
