import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Auto dark/light theme based on system
  useEffect(() => {
    const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    function updateTheme(e) {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
    }
    updateTheme(darkMediaQuery);
    darkMediaQuery.addEventListener('change', updateTheme);
    return () => darkMediaQuery.removeEventListener('change', updateTheme);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      setImageFile(null);
      e.target.value = null; // reset file input
      return;
    }

    // Check image mime type
    if (!file.type.startsWith('image/')) {
      setError('Only image files allowed');
      setImageFile(null);
      e.target.value = null;
      return;
    }

    setError('');
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('Valid price is required');
      return;
    }
    if (!imageFile) {
      setError('Product image is required');
      return;
    }

    setError('');
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('You must log in first.');
      return navigate('/login');
    }

    const data = new FormData();
    data.append('name', form.name);
    data.append('description', form.description);
    data.append('price', form.price);
    data.append('userId', userId);
    data.append('image', imageFile);

    try {
      setLoading(true);
      await axios.post(`${API}/products`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Product created successfully!');
      setForm({ name: '', description: '', price: '' });
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-lg">
      <h1 className="text-3xl font-semibold mb-6">Create New Product</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product name *"
          className="p-3 rounded border border-gray-300 focus:border-blue-600 focus:outline-none"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product description"
          rows={4}
          className="p-3 rounded border border-gray-300 focus:border-blue-600 focus:outline-none resize-none"
        />

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price *"
          min="0"
          step="0.01"
          className="p-3 rounded border border-gray-300 focus:border-blue-600 focus:outline-none"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="p-2 border border-gray-300 rounded"
          required
        />

        {error && <p className="text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
  