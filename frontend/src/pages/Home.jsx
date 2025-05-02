import React, { useState } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaSave, FaUserFriends } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { BookmarkIcon } from 'lucide-react';
import forImg from '../assets/for.jpg'; // Dummy image
import '../Home.css';

const Home = () => {
  const [commentsState, setCommentsState] = useState({});
  const [activePostId, setActivePostId] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [readMorePost, setReadMorePost] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [collabedPosts, setCollabedPosts] = useState([]);

  const postsData = [
    {
      id: 1,
      description: 'This is a sample post description.',
      image: forImg,
      groupType: 'public',
      members: ['user1', 'user2'],
      date: '2025-05-01',
      user: {
        name: 'John Doe',
        username: '@johndoe',
        profileImg: forImg,
      },
    },
    {
      id: 2,
      description: 'Another interesting post description! Another interesting post description!',
      image: forImg,
      groupType: 'private',
      members: ['admin'],
      date: '2025-05-01',
      user: {
        name: 'Jane Smith',
        username: '@janesmith',
        profileImg: forImg,
      },
    },
  ];

  const handleCommentSubmit = (postId) => {
    if (!commentsState[postId]) {
      setCommentsState({
        ...commentsState,
        [postId]: [newComment],
      });
    } else {
      setCommentsState({
        ...commentsState,
        [postId]: [...commentsState[postId], newComment],
      });
    }
    setNewComment('');
  };

  const toggleLike = (postId) => {
    setLikedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const toggleSave = (postId) => {
    setSavedPosts((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  const handleCommentOpen = (postId) => setActivePostId(postId);
  const handleCommentClose = () => setActivePostId(null);

  const toggleReadMore = (postId) => {
    setReadMorePost((prev) => (prev === postId ? null : postId));
  };

  const handleCollab = (postId) => {
    const confirmed = window.confirm('Do you want to accept the collab request?');
    if (confirmed) {
      setCollabedPosts((prev) => [...prev, postId]);
      alert(`You are now collaborating on post ${postId}`);
    } else {
      alert(`Collab request sent for post ${postId}`);
    }
  };

  const handlePostAction = (e, postId) => {
    if (e.target.closest('.like-btn')) {
      toggleLike(postId);
    } else if (e.target.closest('.comment-btn')) {
      handleCommentOpen(postId);
    } else if (e.target.closest('.save-btn')) {
      toggleSave(postId);
    } else if (e.target.closest('.collab-btn')) {
      handleCollab(postId);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center py-10 px-4 ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <div className="max-w-4xl w-full space-y-6">
        {postsData.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden transition-transform duration-300 hover:shadow-xl"
          >
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <img src={post.user.profileImg} alt="User" className="w-10 h-10 rounded-full" />
                <div>
                  <div className="text-sm font-bold text-gray-800 dark:text-white">{post.user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{post.user.username} · {post.date}</div>
                </div>
              </div>

              {post.image && (
                <img src={post.image} alt="Post" className="w-full h-72 object-cover rounded-lg mb-4 shadow-md" />
              )}

              <p className="text-gray-800 dark:text-gray-100 mt-2">
                {readMorePost === post.id ? post.description : post.description.slice(0, 150)}
                {post.description.length > 150 && (
                  <button onClick={() => toggleReadMore(post.id)} className="text-indigo-500 ml-2">
                    {readMorePost === post.id ? 'Read Less' : 'Read More'}
                  </button>
                )}
              </p>

              <div className="flex justify-between mt-4" onClick={(e) => handlePostAction(e, post.id)}>
                <div className="flex items-center space-x-4">
                  <button className="like-btn flex items-center hover:shadow-md">
                    {likedPosts.includes(post.id)
                      ? <FaHeart className="text-red-500" />
                      : <FaRegHeart className="text-gray-500 dark:text-gray-400" />}
                    <span className="ml-2">Like</span>
                  </button>

                  <button className="comment-btn flex items-center hover:shadow-md">
                    <FaComment className="text-gray-500 dark:text-gray-400" />
                    <span className="ml-2">Comment</span>
                  </button>

                  <button className="save-btn flex items-center hover:shadow-md">
                    {savedPosts.includes(post.id)
                      ? <BookmarkIcon className="text-yellow-500 fill-yellow-500" />
                      : <BookmarkIcon className="text-gray-500 dark:text-gray-400" />}
                    <span className="ml-2">Save</span>
                  </button>

                  <button className="collab-btn flex items-center hover:shadow-md">
                    <FaUserFriends className="text-blue-500" />
                    <span className="ml-2">
                      {collabedPosts.includes(post.id) ? 'Collabed' : 'Collab'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Comment Modal */}
              {activePostId === post.id && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4">
                  <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center border-b border-gray-300 dark:border-gray-700 pb-3">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Comments</h3>
                      <button
                        onClick={handleCommentClose}
                        className="text-gray-500 hover:text-red-500 transition text-lg"
                        aria-label="Close"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="relative mt-4">
                      <textarea
                        className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Write your comment..."
                        maxLength={300}
                        autoFocus
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="text-right text-xs text-gray-400 mt-1">
                        {newComment.length}/300
                      </div>
                    </div>

                    <div className="mt-4 flex-1 overflow-y-auto pr-1 custom-scrollbar relative">
                      <div className="flex flex-col-reverse min-h-full justify-end space-y-reverse space-y-3">
                        {[...(commentsState[post.id] || [])].map((comment, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl shadow-sm overflow-x-hidden"
                          >
                            <p className="text-gray-700 dark:text-gray-200 text-sm break-words whitespace-pre-wrap">
                              {comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3">
                      <button
                        className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-600 transition"
                        onClick={handleCommentClose}
                      >
                        Cancel
                      </button>
                      <button
                        disabled={!newComment.trim()}
                        className={`px-4 py-2 rounded-lg text-white transition ${
                          newComment.trim()
                            ? "bg-indigo-600 hover:bg-indigo-700"
                            : "bg-indigo-300 cursor-not-allowed"
                        }`}
                        onClick={() => handleCommentSubmit(post.id)}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
