import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiX, FiPlus, FiUpload, FiInfo } from 'react-icons/fi';
import { FaRegCheckCircle } from 'react-icons/fa';

const API = 'http://localhost:5000/api';

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
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
  const [activeTab, setActiveTab] = useState('details');

  const navigate = useNavigate();
  const sizeInputRef = useRef();
  const fileInputRef = useRef();

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
    if (!form.quantity) newErrors.quantity = 'Quantity is required';
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
    data.append('quantity', form.quantity);
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
      setSuccess('Product created successfully!');
      setForm({ name: '', description: '', price: '', quantity: '', lastPrice: '', condition: '' });
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create New Product</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Fill in the details below to list your product
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
              <FiInfo className="text-orange-500 text-xl" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
              Fields marked with <span className="text-orange-500">*</span> are required
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Product Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'images'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Images
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className={`px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === 'variants'
                    ? 'text-orange-600 border-b-2 border-orange-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Variants
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Product Name <span className="text-orange-500">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={100}
                      placeholder="e.g. Premium Leather Jacket"
                      className={`w-full p-4 rounded-xl border ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      maxLength={2000}
                      placeholder="Describe your product in detail..."
                      className={`w-full p-4 rounded-xl border ${
                        errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                      {form.description.length}/2000 characters
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                          ETB
                        </div>
                        <input
                          name="price"
                          type="number"
                          value={form.price}
                          onChange={handleChange}
                          placeholder="0.00"
                          min="0"
                          className={`w-full pl-10 p-4 rounded-xl border ${
                            errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Last Price
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 dark:text-gray-400">
                          ETB
                        </div>
                        <input
                          name="lastPrice"
                          type="number"
                          value={form.lastPrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          min="0"
                          className={`w-full pl-10 p-4 rounded-xl border ${
                            errors.lastPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                        />
                      </div>
                      {errors.lastPrice && (
                        <p className="mt-1 text-sm text-red-600">{errors.lastPrice}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quantity <span className="text-orange-500">*</span>
                      </label>
                      <input
                        name="quantity"
                        type="number"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="Available stock"
                        min="1"
                        className={`w-full p-4 rounded-xl border ${
                          errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Condition
                    </label>
                    <select
                      name="condition"
                      value={form.condition}
                      onChange={handleChange}
                      className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="">Select condition</option>
                      <option value="new">Brand New</option>
                      <option value="used">Used - Like New</option>
                      <option value="good">Used - Good</option>
                      <option value="fair">Used - Fair</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'variants' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Product Variants (Sizes, Colors, etc.)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-2">
                      <input
                        value={sizeInput}
                        ref={sizeInputRef}
                        onChange={(e) => setSizeInput(e.target.value)}
                        placeholder="e.g. Small, Blue, Cotton"
                        className="flex-1 p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button
                        type="button"
                        onClick={addSize}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
                      >
                        <FiPlus className="text-lg" /> Add
                      </button>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Added variants:</p>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((s, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-sm rounded-full flex items-center transition-all hover:bg-orange-200 dark:hover:bg-orange-800"
                          >
                            {s}
                            <FiX
                              onClick={() => removeSize(s)}
                              className="ml-2 cursor-pointer hover:text-orange-900"
                            />
                          </span>
                        ))}
                        {sizes.length === 0 && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No variants added yet
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
                    <div className="flex items-start">
                      <FiInfo className="text-orange-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Add variants to help customers find your product. You can add sizes, colors,
                        materials, or any other attributes that distinguish your product.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Main Image <span className="text-orange-500">*</span>
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      This will be the primary image shown for your product
                    </p>
                    <div className="flex flex-col md:flex-row gap-8">
                      <label
                        className={`flex-1 h-64 rounded-2xl border-2 border-dashed ${
                          errors.mainImage
                            ? 'border-red-500'
                            : 'border-orange-300 dark:border-orange-700'
                        } flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-orange-500 dark:hover:border-orange-500 bg-orange-50 dark:bg-orange-900/20`}
                      >
                        {preview ? (
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-contain p-4"
                          />
                        ) : (
                          <div className="flex flex-col items-center text-center p-6">
                            <FiUpload className="text-3xl text-orange-500 mb-3" />
                            <p className="font-medium text-gray-700 dark:text-gray-300">
                              Upload Main Image
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Click to browse or drag & drop
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                              JPG, PNG, or GIF • Max 5MB
                            </p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImage}
                          className="hidden"
                          ref={fileInputRef}
                        />
                      </label>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                          Image Requirements
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <li className="flex items-start">
                            <FaRegCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>High quality (min 1000x1000px)</span>
                          </li>
                          <li className="flex items-start">
                            <FaRegCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Well-lit product photo</span>
                          </li>
                          <li className="flex items-start">
                            <FaRegCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>Plain background preferred</span>
                          </li>
                          <li className="flex items-start">
                            <FaRegCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span>No watermarks or text overlays</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    {errors.mainImage && (
                      <p className="mt-2 text-sm text-red-600">{errors.mainImage}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Images
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      Show your product from different angles or in context
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label
                        className={`h-48 rounded-2xl border-2 border-dashed ${
                          errors.extraImages
                            ? 'border-red-500'
                            : 'border-orange-300 dark:border-orange-700'
                        } flex items-center justify-center cursor-pointer transition-colors hover:border-orange-500 dark:hover:border-orange-500 bg-orange-50 dark:bg-orange-900/20`}
                      >
                        <div className="text-center p-4">
                          <FiPlus className="text-2xl text-orange-500 mx-auto mb-2" />
                          <p className="text-gray-700 dark:text-gray-300">Add Image</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Max 5 images • 5MB each
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleExtraImages}
                          className="hidden"
                        />
                      </label>
                      {extraImages.map((img, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={URL.createObjectURL(img)}
                            className="h-48 w-full object-cover rounded-xl border border-gray-200 dark:border-gray-700"
                            alt={`Extra ${i}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeExtraImage(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {errors.extraImages && (
                      <p className="mt-2 text-sm text-red-600">{errors.extraImages}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-xl font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Creating Product...
                    </>
                  ) : (
                    'Create Product'
                  )}
                </button>
              </div>

              {errors.server && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-red-700 dark:text-red-300">{errors.server}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 flex items-center">
                  <FaRegCheckCircle className="text-green-500 text-xl mr-3" />
                  <p className="text-green-700 dark:text-green-300">{success}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            By creating a product, you agree to our{' '}
            <a href="#" className="text-orange-500 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-orange-500 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}