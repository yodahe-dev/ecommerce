import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X, Plus } from 'lucide-react';

const API = 'http://localhost:5000/api';

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    lastPrice: '',
    condition: '',
  });
  const [sizes, setSizes] = useState([]);
  const [sizeInput, setSizeInput] = useState('');

  const [mainImage, setMainImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [extraImages, setExtraImages] = useState([]);
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
      return setError('Main image must be an image under 5MB');
    }
    setMainImage(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleExtraImages = (e) => {
    const files = Array.from(e.target.files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    if (files.length + extraImages.length > 5) {
      return setError('You can upload a maximum of 5 extra images');
    }
    setExtraImages((prev) => [...prev, ...files]);
    setError('');
  };

  const removeExtraImage = (index) => {
    setExtraImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    const trimmed = sizeInput.trim();
    if (trimmed && !sizes.includes(trimmed)) {
      setSizes((prev) => [...prev, trimmed]);
      setSizeInput('');
    }
  };

  const removeSize = (s) => {
    setSizes((prev) => prev.filter((v) => v !== s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Product name is required');
    if (!form.price || Number(form.price) <= 0) return setError('Valid price is required');
    if (!mainImage) return setError('Main image is required');

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
    if (form.condition) data.append('condition', form.condition);
    if (sizes.length > 0) data.append('sizes', JSON.stringify(sizes));
    data.append('userId', userId);
    data.append('main', mainImage);
    extraImages.forEach((img) => data.append('extra', img));

    try {
      setLoading(true);
      await axios.post(`${API}/products`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Product created');
      setForm({ name: '', description: '', price: '', lastPrice: '', condition: '' });
      setSizes([]);
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl overflow-auto max-h-[95vh]">
        <h2 className="text-3xl font-bold mb-6 text-center text-orange-600 dark:text-orange-400">Create Product</h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Text Inputs */}
          <input name="name" value={form.name} onChange={handleChange} placeholder="Product Name *"
            className="w-full p-4 rounded-xl border bg-transparent text-gray-800 dark:text-white" />

          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" rows={3}
            className="w-full p-4 rounded-xl border bg-transparent text-gray-800 dark:text-white" />

          <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price *" min="0" step="0.01"
            className="w-full p-4 rounded-xl border bg-transparent text-gray-800 dark:text-white" />

          <input name="lastPrice" type="number" value={form.lastPrice} onChange={handleChange} placeholder="Last Price (optional)" min="0" step="0.01"
            className="w-full p-4 rounded-xl border bg-transparent text-gray-800 dark:text-white" />

          <select name="condition" value={form.condition} onChange={handleChange}
            className="w-full p-4 rounded-xl border bg-transparent text-gray-800 dark:text-white">
            <option value="">Condition (optional)</option>
            <option value="new">New</option>
            <option value="old">Old</option>
            <option value="other">Other</option>
          </select>

          {/* Sizes */}
          <div>
            <div className="flex gap-2 mb-2">
              <input
                value={sizeInput}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder="Add size (e.g., M, 42)"
                className="flex-1 p-3 border rounded-xl bg-transparent text-gray-800 dark:text-white"
              />
              <button
                type="button"
                onClick={addSize}
                className="bg-orange-600 text-white px-4 rounded-xl flex items-center gap-1"
              >
                <Plus size={16} /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm flex items-center gap-1"
                >
                  {s}
                  <X size={12} onClick={() => removeSize(s)} className="cursor-pointer" />
                </span>
              ))}
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm mb-1">Main Image *</label>
            <label className="block w-full border-2 border-dashed p-4 rounded-xl text-center cursor-pointer hover:border-orange-500">
              {preview ? (
                <img src={preview} alt="Preview" className="mx-auto max-h-64 object-contain" />
              ) : (
                <span className="text-gray-400 dark:text-gray-500">Click to upload main image (max 5MB)</span>
              )}
              <input type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
            </label>
          </div>

          {/* Extra Images */}
          <div>
            <label className="block text-sm mb-1">Extra Images (max 5)</label>
            <input type="file" accept="image/*" multiple onChange={handleExtraImages}
              className="w-full p-2 border rounded-md text-sm bg-transparent text-gray-800 dark:text-white" />
            <div className="flex gap-2 mt-3 flex-wrap">
              {extraImages.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={URL.createObjectURL(img)} className="h-16 w-16 object-cover rounded-md" alt={`Extra ${i}`} />
                  <button type="button" onClick={() => removeExtraImage(i)}
                    className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-100 text-red-800 rounded-lg dark:bg-red-950 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
        <div className='min-h-32'>

        </div>
      </div>
      
    </div>
  );
}
