import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Trash2, ImagePlus } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    lastPrice: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (e) => {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
    };
    updateTheme(darkMediaQuery);
    darkMediaQuery.addEventListener('change', updateTheme);
    return () => darkMediaQuery.removeEventListener('change', updateTheme);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // prevent negative and multiple dots
    if ((name === 'price' || name === 'lastPrice') && !/^\d*\.?\d{0,2}$/.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Image must be less than 5MB');
    if (!file.type.startsWith('image/')) return setError('Only image files allowed');
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Product name is required');
    if (!form.price || Number(form.price) <= 0) return setError('Valid price is required');
    if (!imageFile) return setError('Product image is required');

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
    if (form.lastPrice) data.append('lastPrice', form.lastPrice);
    data.append('userId', userId);
    data.append('image', imageFile);

    try {
      setLoading(true);
      await axios.post(`${API}/products`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Product created successfully!');
      setForm({ name: '', description: '', price: '', lastPrice: '' });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-5xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 grid gap-8 grid-cols-1 md:grid-cols-2 overflow-auto"
      >
        {/* Left side: Form Fields */}
        <div className="space-y-5">
          <h2 className="text-3xl font-bold text-orange-600">Add New Product</h2>

          <div>
            <label className="block text-sm text-gray-700 dark:text-orange-200">Product Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Wooden Table"
              className="w-full mt-1 p-4 rounded-xl border-2 bg-transparent dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 dark:text-orange-200">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Write something about this product..."
              rows="4"
              className="w-full mt-1 p-4 rounded-xl border-2 bg-transparent dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 dark:text-orange-200">Price</label>
              <input
                type="text"
                inputMode="decimal"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="no-spinner w-full mt-1 p-4 rounded-xl border-2 bg-transparent dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 dark:text-orange-200">
                Last Price <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                inputMode="decimal"
                name="lastPrice"
                value={form.lastPrice}
                onChange={handleChange}
                className="no-spinner w-full mt-1 p-4 rounded-xl border-2 bg-transparent dark:text-white"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-200 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-4 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
          >
            {loading ? 'Uploading...' : 'Create Product'}
          </button>
        </div>

        {/* Right side: Image Upload */}
        <div className="flex flex-col gap-4 items-center justify-center">
          <label className="w-full border-2 border-dashed p-6 rounded-xl text-center cursor-pointer bg-gray-50 dark:bg-gray-700/40 hover:border-orange-500 transition">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-contain rounded-xl shadow-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-600 p-1 rounded-full shadow"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-300">
                <ImagePlus size={40} />
                <p className="mt-2">Click to upload image</p>
                <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 5MB</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required={!imageFile}
            />
          </label>
        </div>
      </form>

      {/* Hide number input arrows */}
      <style>
        {`
          input[type='number'], input[type='text'].no-spinner {
            -moz-appearance: textfield;
          }
          input[type='number']::-webkit-inner-spin-button,
          input[type='number']::-webkit-outer-spin-button,
          input[type='text'].no-spinner::-webkit-inner-spin-button,
          input[type='text'].no-spinner::-webkit-outer-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
        `}
      </style>
    </div>
  );
}
