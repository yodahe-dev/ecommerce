import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    lastPrice: '',
    shippingPrice: '',
    condition: '',
    sizes: '',
  });
  const [mainImage, setMainImage] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (e) => {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
    };
    updateTheme(mq);
    mq.addEventListener('change', updateTheme);
    return () => mq.removeEventListener('change', updateTheme);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setError('Main image must be an image under 5MB');
      return;
    }

    setMainImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleExtraImages = (e) => {
    const files = Array.from(e.target.files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    setExtraImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Product name is required');
    if (!form.price || Number(form.price) <= 0) return setError('Valid price is required');
    if (!mainImage) return setError('Main image is required');

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
    if (form.shippingPrice) data.append('shippingPrice', form.shippingPrice);
    if (form.condition) data.append('condition', form.condition);
    if (form.sizes) data.append('sizes', JSON.stringify(form.sizes.split(',').map(s => s.trim())));
    data.append('userId', userId);
    data.append('main', mainImage);
    extraImages.forEach((img) => data.append('extra', img));

    try {
      setLoading(true);
      await axios.post(`${API}/products`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Product created');
      setForm({
        name: '',
        description: '',
        price: '',
        lastPrice: '',
        shippingPrice: '',
        condition: '',
        sizes: '',
      });
      setMainImage(null);
      setExtraImages([]);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-2xl h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
          Create Product
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { label: 'Product Name', name: 'name', type: 'text' },
            { label: 'Description', name: 'description', textarea: true },
            { label: 'Price', name: 'price', type: 'number' },
            { label: 'Last Price (optional)', name: 'lastPrice', type: 'number' },
            { label: 'Shipping Price (optional)', name: 'shippingPrice', type: 'number' },
            { label: 'Condition (optional)', name: 'condition', type: 'text' },
            {
              label: 'Sizes (comma-separated, optional)',
              name: 'sizes',
              type: 'text',
            },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-orange-200">
                {field.label}
              </label>
              {field.textarea ? (
                <textarea
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-4 rounded-xl border-2 bg-transparent text-gray-800 dark:text-gray-100"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="w-full p-4 rounded-xl border-2 bg-transparent text-gray-800 dark:text-gray-100"
                />
              )}
            </div>
          ))}

          {/* Main image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-orange-200">
              Main Image
            </label>
            <label className="flex flex-col items-center justify-center w-full p-6 rounded-xl border-2 border-dashed cursor-pointer bg-gray-50 dark:bg-gray-700/20">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full max-h-64 object-contain mb-2 rounded-xl" />
              ) : (
                <span className="text-sm text-gray-500 dark:text-gray-400">Click to upload main image</span>
              )}
              <input type="file" accept="image/*" onChange={handleMainImage} className="hidden" required />
            </label>
          </div>

          {/* Extra images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-orange-200">
              Extra Images (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleExtraImages}
              className="w-full p-2 text-sm text-gray-600 dark:text-gray-300"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
