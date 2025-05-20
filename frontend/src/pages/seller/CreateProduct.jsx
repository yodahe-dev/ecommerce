// CreateProduct.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiX, FiPlus } from 'react-icons/fi';

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
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();
  const sizeInputRef = useRef();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (e) => {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
    };
    updateTheme(mq);
    mq.addEventListener('change', updateTheme);
    return () => mq.removeEventListener('change', updateTheme);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Product name is required';
    else if (form.name.length > 100) newErrors.name = 'Max 100 characters';
    if (form.description.length > 2000) newErrors.description = 'Max 2000 characters';
    if (!form.price || !/^\d{1,9}$/.test(form.price) || Number(form.price) <= 0)
      newErrors.price = 'Valid price is required';
    if (form.lastPrice && (!/^\d{1,9}$/.test(form.lastPrice) || Number(form.lastPrice) < 0))
      newErrors.lastPrice = 'Last price must be 1-9 digits';
    if (!mainImage) newErrors.mainImage = 'Main image is required';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      return setErrors((prev) => ({ ...prev, mainImage: 'Image must be under 5MB' }));
    }
    setMainImage(file);
    setPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, mainImage: null }));
  };

  const handleExtraImages = (e) => {
    const files = Array.from(e.target.files).filter(
      (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024
    );
    if (files.length + extraImages.length > 5) {
      return setErrors((prev) => ({ ...prev, extraImages: 'Max 5 extra images' }));
    }
    setExtraImages((prev) => [...prev, ...files]);
    setErrors((prev) => ({ ...prev, extraImages: null }));
  };

  const removeExtraImage = (index) => {
    setExtraImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addSize = () => {
    const trimmed = sizeInput.trim();
    if (trimmed && !sizes.includes(trimmed)) {
      setSizes((prev) => [...prev, trimmed]);
      setSizeInput('');
      sizeInputRef.current?.focus();
    }
  };

  const removeSize = (s) => {
    setSizes((prev) => prev.filter((v) => v !== s));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

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
      setSuccess('Product created.');
      setForm({ name: '', description: '', price: '', lastPrice: '', condition: '' });
      setSizes([]);
      setMainImage(null);
      setExtraImages([]);
      setPreview(null);
    } catch (err) {
      setErrors({ server: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-xl">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-orange-600">Create Product</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            placeholder="Product Name *"
            className="w-full p-3 rounded-xl border bg-transparent text-gray-800 dark:text-white"
          />
          {errors.name && <div className="text-sm text-red-600">{errors.name}</div>}

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            maxLength={2000}
            placeholder="Description"
            className="w-full p-3 rounded-xl border bg-transparent text-gray-800 dark:text-white"
          />
          {errors.description && <div className="text-sm text-red-600">{errors.description}</div>}

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="Price *"
              min="0"
              className="w-full p-4 rounded-xl border bg-transparent text-gray-800 dark:text-white"
            />
            <input
              name="lastPrice"
              type="number"
              value={form.lastPrice}
              onChange={handleChange}
              placeholder="Last Price (optional)"
              min="0"
              className="w-full p-4 rounded-xl border bg-transparent text-gray-800 dark:text-white"
            />
          </div>
          {errors.price && <div className="text-sm text-red-600">{errors.price}</div>}
          {errors.lastPrice && <div className="text-sm text-red-600">{errors.lastPrice}</div>}

          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            className="w-full p-3 rounded-xl border bg-transparent text-gray-800 dark:text-white"
          >
            <option value="">Condition (optional)</option>
            <option value="new">New</option>
            <option value="old">Old</option>
            <option value="other">Other</option>
          </select>

          <div>
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                value={sizeInput}
                ref={sizeInputRef}
                onChange={(e) => setSizeInput(e.target.value)}
                placeholder="Add size"
                className="flex-1 p-2 border rounded-xl bg-transparent text-gray-800 dark:text-white"
              />
              <button
                type="button"
                onClick={addSize}
                className="bg-orange-600 text-white px-4 rounded-xl flex items-center justify-center gap-1"
              >
                <FiPlus /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s, i) => (
                <span key={i} className="px-3 py-1 bg-orange-200 dark:bg-orange-700 text-sm rounded-full flex items-center">
                  {s}
                  <FiX onClick={() => removeSize(s)} className="ml-1 cursor-pointer" />
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1">Main Image *</label>
            <label className="block w-full border-2 border-dashed p-4 rounded-xl text-center cursor-pointer">
              {preview ? (
                <img src={preview} alt="Preview" className="mx-auto max-h-64 object-contain" />
              ) : (
                <span className="text-gray-400">Click to upload main image (max 5MB)</span>
              )}
              <input type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
            </label>
            {errors.mainImage && <div className="text-sm text-red-600">{errors.mainImage}</div>}
          </div>

          <div>
            <label className="block mb-1">Extra Images (max 5)</label>
            <input type="file" accept="image/*" multiple onChange={handleExtraImages} className="w-full p-2" />
            <div className="flex flex-wrap gap-2 mt-2">
              {extraImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(img)} className="h-16 w-16 object-cover rounded-md" alt={`Extra ${i}`} />
                  <button
                    type="button"
                    onClick={() => removeExtraImage(i)}
                    className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
            {errors.extraImages && <div className="text-sm text-red-600">{errors.extraImages}</div>}
          </div>

          {errors.server && <div className="text-red-600">{errors.server}</div>}
          {success && <div className="text-green-600">{success}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-600 text-white font-semibold hover:bg-orange-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
}
