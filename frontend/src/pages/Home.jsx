import React, { useState } from "react";
import { FaHeart, FaRegHeart, FaComment, FaSave } from "react-icons/fa";
import { motion } from "framer-motion";
import forImg from "../assets/for.jpg"; // Replace with actual import
import { BookHeart, BookmarkIcon } from "lucide-react";

const Home = () => {
  // Sample posts data
  const postsData = [
    {
      id: 1,
      description: "This is a sample post description.",
      image: forImg,
    },
    {
      id: 2,
      description: "Another interesting post description! Another interesting post description! Another interesting post description! Another interesting post description! Another interesting post description! Another interesting post description! Another interesting post description! Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!Another interesting post description!",
      image: forImg,
    },
    { id: 3, description: "What an amazing idea for a post.", image: forImg },
    // Add more posts as necessary
  ];

  const [commentsState, setCommentsState] = useState({});
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [readMorePost, setReadMorePost] = useState(null);

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
    setNewComment("");
  };

  const toggleLike = (postId) => {
    setLikedPosts((prevLikes) =>
      prevLikes.includes(postId)
        ? prevLikes.filter((id) => id !== postId)
        : [...prevLikes, postId]
    );
  };

  const toggleSave = (postId) => {
    setSavedPosts((prevSaved) =>
      prevSaved.includes(postId)
        ? prevSaved.filter((id) => id !== postId)
        : [...prevSaved, postId]
    );
  };

  const handleCommentOpen = () => {
    setIsCommentOpen(true);
  };

  const handleCommentClose = () => {
    setIsCommentOpen(false);
  };

  const toggleReadMore = (postId) => {
    setReadMorePost((prevPostId) => (prevPostId === postId ? null : postId));
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-4">
      <div className="max-w-4xl w-full space-y-6">
        {postsData.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            <div className="p-4">
              {/* Post Content */}
              <img
                src={post.image}
                alt="Post"
                className="w-full h-72 object-cover rounded-lg mb-4"
              />
              <p className="text-gray-800 dark:text-gray-100 mt-2">
                {readMorePost === post.id
                  ? post.description
                  : post.description.slice(0, 150)}
                {post.description.length > 150 && (
                  <button
                    onClick={() => toggleReadMore(post.id)}
                    className="text-indigo-500"
                  >
                    {readMorePost === post.id ? "Read Less" : "Read More"}
                  </button>
                )}
              </p>

              {/* Post Actions (Like, Save, Comment) */}
              <div className="flex justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className="flex items-center"
                  >
                    {likedPosts.includes(post.id) ? (
                      <FaHeart className="text-red-500" />
                    ) : (
                      <FaRegHeart className="text-gray-500 dark:text-gray-400" />
                    )}
                    <span className="ml-2">Like</span>
                  </button>

                  <button
                    onClick={() => handleCommentOpen()}
                    className="flex items-center"
                  >
                    <FaComment className="text-gray-500 dark:text-gray-400" />
                    <span className="ml-2">Comment</span>
                  </button>

                  
                    
                  <button
                    onClick={() => toggleSave(post.id)}
                    className="flex items-center"
                  >
                    {savedPosts.includes(post.id) ? (
                      <BookmarkIcon className="text-yellow-500 fill-yellow-500" />
                    ) : (
                      <BookmarkIcon className="text-gray-500 dark:text-gray-400 " />
                    )}
                    <span className="ml-2">save</span>
                  </button>
                </div>
              </div>

              {isCommentOpen && (
  <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 px-4">
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col">
      {/* Header */}
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

      {/* Textarea */}
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

{/* Comments List */}
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



      {/* Actions */}
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
