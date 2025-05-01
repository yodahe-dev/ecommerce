import React, { useState } from 'react';

const CommentPopup = ({ postId, onClose, comments }) => {
  const [newComment, setNewComment] = useState("");
  const [commentList, setCommentList] = useState(comments || []);

  const handleAddComment = () => {
    if (newComment.trim()) {
      setCommentList([...commentList, { text: newComment, id: Date.now() }]);
      setNewComment("");
    }
  };

  const handleDeleteComment = (commentId) => {
    setCommentList(commentList.filter(comment => comment.id !== commentId));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Comments</h3>
          <button onClick={onClose} className="text-gray-500 text-lg">X</button>
        </div>

        <div className="max-h-60 overflow-y-auto mb-4">
          {commentList.map((comment) => (
            <div key={comment.id} className="flex justify-between items-center mb-3 p-2 border-b">
              <p className="text-sm">{comment.text}</p>
              <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500">Delete</button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            placeholder="Add a comment..." 
            className="w-full p-2 border rounded-lg focus:outline-none"
          />
          <button 
            onClick={handleAddComment} 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg ml-2"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentPopup;
