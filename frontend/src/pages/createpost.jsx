import { useState, useEffect } from 'react';
import { createPost } from '../api';
import { useNavigate } from 'react-router-dom';

function CreatePost() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    userId: '', // filled from localStorage
  });
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      setForm((prev) => ({ ...prev, userId: storedUserId }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files.length) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    if (!form.userId) {
      setMsg('User ID is missing');
      setLoading(false);
      return;
    }

    const data = new FormData();
    data.append('title', form.title);
    data.append('description', form.description);
    data.append('userId', form.userId);
    if (image) data.append('image', image);

    const res = await createPost(data);
    setLoading(false);

    if (res.message?.startsWith('Error')) {
      setMsg(res.message);
    } else if (res.error) {
      setMsg(res.error);
    } else {
      setMsg('Post created.');
      setTimeout(() => navigate('/'), 1000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white mb-6">Create Post</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            required
            className="w-full p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0 file:text-sm file:font-semibold
              file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-semibold rounded-lg ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400'
            }`}
          >
            {loading ? 'Creating...' : 'Create Post'}
          </button>

          {msg && <p className="text-sm text-center mt-2 text-red-500 dark:text-red-400">{msg}</p>}
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
