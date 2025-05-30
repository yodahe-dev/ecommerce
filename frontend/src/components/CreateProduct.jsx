import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FiX, FiPlus, FiUpload, FiInfo, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

const API = 'http://localhost:5000/api';

export default function CreateProduct() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    lastPrice: '',
    condition: 'new',
    categoryId: ''
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
  const [tabsCompleted, setTabsCompleted] = useState({
    details: false,
    variants: false,
    images: false,
  });
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const navigate = useNavigate();
  const sizeInputRef = useRef();
  const fileInputRef = useRef();
  const dropRef = useRef();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        setCategories(response.data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setErrors(prev => ({ ...prev, categories: 'Failed to load categories' }));
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
    
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = (e) => {
      document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
    };
    updateTheme(mq);
    mq.addEventListener('change', updateTheme);
    return () => mq.removeEventListener('change', updateTheme);
  }, []);

  useEffect(() => {
    const dropArea = dropRef.current;
    
    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
      } else if (e.type === 'dragleave') {
        setDragActive(false);
      }
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
          return setErrors(prev => ({ ...prev, mainImage: 'Image must be under 5MB' }));
        }
        setMainImage(file);
        setPreview(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, mainImage: null }));
      }
    };
    
    if (dropArea) {
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, handleDrag);
      });
      dropArea.addEventListener('drop', handleDrop);
    }
    
    return () => {
      if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
          dropArea.removeEventListener(eventName, handleDrag);
        });
        dropArea.removeEventListener('drop', handleDrop);
      }
    };
  }, []);

  const validateTab = (tab) => {
    const newErrors = {};
    
    if (tab === 'details') {
      if (!form.name.trim()) newErrors.name = 'Product name is required';
      else if (form.name.length > 100) newErrors.name = 'Max 100 characters';
      if (form.description.length > 2000) newErrors.description = 'Max 2000 characters';
      if (!form.price || !/^\d{1,9}(\.\d{1,2})?$/.test(form.price) || Number(form.price) <= 0)
        newErrors.price = 'Valid price is required';
      if (form.lastPrice && (!/^\d{1,9}(\.\d{1,2})?$/.test(form.lastPrice) || Number(form.lastPrice) < 0))
        newErrors.lastPrice = 'Invalid last price';
      if (!form.quantity || !/^\d+$/.test(form.quantity) || Number(form.quantity) < 1)
        newErrors.quantity = 'Valid quantity is required';
      if (!form.categoryId) newErrors.categoryId = 'Category is required';
    }
    
    if (tab === 'images') {
      if (!mainImage) newErrors.mainImage = 'Main image is required';
    }
    
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

  const goToNextTab = () => {
    const tabErrors = validateTab(activeTab);
    
    if (Object.keys(tabErrors).length > 0) {
      setErrors(tabErrors);
      return;
    }
    
    // Mark current tab as completed
    setTabsCompleted(prev => ({ ...prev, [activeTab]: true }));
    
    // Determine next tab
    const tabs = ['details', 'variants', 'images'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const goToPreviousTab = () => {
    const tabs = ['details', 'variants', 'images'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation for all tabs
    const detailsErrors = validateTab('details');
    const imagesErrors = validateTab('images');
    const allErrors = { ...detailsErrors, ...imagesErrors };
    
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      
      // Go to the first tab with errors
      if (Object.keys(detailsErrors).length > 0) {
        setActiveTab('details');
      } else if (Object.keys(imagesErrors).length > 0) {
        setActiveTab('images');
      }
      
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
    data.append('lastPrice', form.lastPrice || '');
    data.append('condition', form.condition);
    data.append('categoryId', form.categoryId);
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
      
      // Reset form state
      setForm({ 
        name: '', 
        description: '', 
        price: '', 
        quantity: '', 
        lastPrice: '', 
        condition: 'new',
        categoryId: ''
      });
      setSizes([]);
      setMainImage(null);
      setExtraImages([]);
      setPreview(null);
      
      // Reset tabs
      setTabsCompleted({
        details: false,
        variants: false,
        images: false,
      });
      
      // Return to first tab
      setActiveTab('details');
    } catch (err) {
      console.error('Create product error:', err);
      setErrors({ server: err.response?.data?.message || 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 4000);
    }
  };

  // Determine if all required fields are completed for the current tab
  const isTabComplete = (tab) => {
    if (tab === 'details') {
      return form.name.trim() && 
             form.price && 
             form.quantity && 
             form.categoryId &&
             !errors.name && 
             !errors.price && 
             !errors.quantity;
    }
    
    if (tab === 'images') {
      return mainImage !== null;
    }
    
    // Variants tab has no required fields
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create New Product</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Fill in the details below to list your product
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl w-full md:w-auto border border-blue-100 dark:border-blue-800/50">
            <FiInfo className="text-blue-500 text-xl flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Fields marked with <span className="text-blue-500 font-bold">*</span> are required
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 ease-in-out"
              style={{ width: activeTab === 'details' ? '33%' : activeTab === 'variants' ? '66%' : '100%' }}
            ></div>
          </div>
          
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`relative px-6 py-4 text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <span className="mr-2">1</span>
                  Product Details
                  {tabsCompleted.details && (
                    <FiCheck className="ml-2 w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('variants')}
                className={`relative px-6 py-4 text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === 'variants'
                    ? 'text-blue-600 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <span className="mr-2">2</span>
                  Variants
                  {tabsCompleted.variants && (
                    <FiCheck className="ml-2 w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('images')}
                className={`relative px-6 py-4 text-sm font-medium transition-colors flex-shrink-0 ${
                  activeTab === 'images'
                    ? 'text-blue-600 border-b-2 border-blue-500'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center">
                  <span className="mr-2">3</span>
                  Images
                  {tabsCompleted.images && (
                    <FiCheck className="ml-2 w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={activeTab === 'images' ? handleSubmit : (e) => e.preventDefault()} className="space-y-8">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Product Name <span className="text-blue-500 font-bold">*</span>
                      </label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        maxLength={100}
                        placeholder="e.g. Premium Leather Jacket"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Category <span className="text-blue-500 font-bold">*</span>
                      </label>
                      {loadingCategories ? (
                        <div className="flex items-center justify-center h-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                          <FaSpinner className="animate-spin text-blue-500 mr-2" />
                          <span className="text-gray-500">Loading categories...</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            name="categoryId"
                            value={form.categoryId}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border appearance-none ${
                              errors.categoryId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                            } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-10`}
                          >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                              <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.categoryId}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      rows={4}
                      maxLength={2000}
                      placeholder="Describe your product in detail..."
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.description}
                      </p>
                    )}
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                      {form.description.length}/2000 characters
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price <span className="text-blue-500 font-bold">*</span>
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
                          step="0.01"
                          className={`w-full pl-10 px-4 py-3 rounded-lg border ${
                            errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                        />
                      </div>
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.price}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                          step="0.01"
                          className={`w-full pl-10 px-4 py-3 rounded-lg border ${
                            errors.lastPrice ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                        />
                      </div>
                      {errors.lastPrice && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.lastPrice}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quantity <span className="text-blue-500 font-bold">*</span>
                      </label>
                      <input
                        name="quantity"
                        type="number"
                        value={form.quantity}
                        onChange={handleChange}
                        placeholder="Available stock"
                        min="1"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all`}
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.quantity}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Condition
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { value: 'new', label: 'Brand New' },
                        { value: 'used', label: 'Used - Like New' },
                        { value: 'other', label: 'Other' }
                      ].map((option) => (
                        <button
                          type="button"
                          key={option.value}
                          onClick={() => setForm(prev => ({ ...prev, condition: option.value }))}
                          className={`px-4 py-3 rounded-lg border ${
                            form.condition === option.value 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          } transition-all`}
                        >
                          <span className={`font-medium ${
                            form.condition === option.value 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'variants' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Variants (Sizes, Colors, etc.)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                      <input
                        value={sizeInput}
                        ref={sizeInputRef}
                        onChange={(e) => setSizeInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSize()}
                        placeholder="e.g. Small, Blue, Cotton"
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={addSize}
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
                      >
                        <FiPlus className="text-lg" /> Add
                      </button>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Added variants:</p>
                      <div className="flex flex-wrap gap-2">
                        {sizes.map((s, i) => (
                          <div
                            key={i}
                            className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-lg flex items-center transition-all hover:bg-blue-200 dark:hover:bg-blue-800/50 group"
                          >
                            {s}
                            <button
                              type="button"
                              onClick={() => removeSize(s)}
                              className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        {sizes.length === 0 && (
                          <p className="text-gray-500 dark:text-gray-400 text-sm py-2">
                            No variants added yet. Add sizes, colors or other attributes.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-start">
                      <FiInfo className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                      <p className="text-sm text-blue-700 dark:text-blue-300">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Main Image <span className="text-blue-500 font-bold">*</span>
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      This will be the primary image shown for your product
                    </p>
                    <div className="flex flex-col md:flex-row gap-8">
                      <label
                        ref={dropRef}
                        className={`flex-1 h-72 rounded-2xl border-2 ${
                          dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' : 
                          errors.mainImage ? 'border-red-500' : 
                          preview ? 'border-transparent' : 'border-dashed border-gray-300 dark:border-gray-600'
                        } flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden relative group`}
                      >
                        {preview ? (
                          <>
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
                              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                                Change Image
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center text-center p-6">
                            <FiUpload className={`text-3xl mb-3 ${
                              dragActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
                            }`} />
                            <p className={`font-medium ${
                              dragActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {dragActive ? 'Drop your image here' : 'Upload Main Image'}
                            </p>
                            <p className={`text-sm mt-1 ${
                              dragActive ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {dragActive ? '' : 'Click to browse or drag & drop'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
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
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
                          Image Requirements
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                          {[
                            "High quality (min 1000x1000px)",
                            "Well-lit product photo",
                            "Plain background preferred",
                            "No watermarks or text overlays",
                            "Show the product clearly",
                            "Use natural lighting if possible"
                          ].map((item, index) => (
                            <li key={index} className="flex items-start">
                              <FiCheck className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {errors.mainImage && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.mainImage}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Images
                    </label>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Show your product from different angles or in context (max 5)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <label
                        className={`h-48 rounded-xl border-2 border-dashed ${
                          errors.extraImages
                            ? 'border-red-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
                        } flex items-center justify-center cursor-pointer transition-colors bg-gray-50 dark:bg-gray-700/50`}
                      >
                        <div className="text-center p-4">
                          <FiPlus className="text-2xl text-gray-400 dark:text-gray-500 mx-auto mb-2" />
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
                        <div key={i} className="relative group h-48 rounded-xl overflow-hidden">
                          <img
                            src={URL.createObjectURL(img)}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                            alt={`Extra ${i}`}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
                          <button
                            type="button"
                            onClick={() => removeExtraImage(i)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {errors.extraImages && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.extraImages}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                
                {activeTab !== 'details' && (
                  <button
                    type="button"
                    onClick={goToPreviousTab}
                    className="px-6 py-3 rounded-lg font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <FiChevronLeft /> Back
                  </button>
                )}
                
                {activeTab !== 'images' ? (
                  <button
                    type="button"
                    onClick={goToNextTab}
                    disabled={!isTabComplete(activeTab)}
                    className={`flex-1 font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isTabComplete(activeTab) 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700' 
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Continue to {activeTab === 'details' ? 'Variants' : 'Images'} 
                    <FiChevronRight className="ml-1" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || !isTabComplete('images')}
                    className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
                      !isTabComplete('images') ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
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
                      <>
                        <FiCheck className="text-lg" />
                        Create Product
                      </>
                    )}
                  </button>
                )}
              </div>

              {errors.server && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 mt-6">
                  <p className="text-red-700 dark:text-red-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.server}
                  </p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800 mt-6 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-700 dark:text-green-300">{success}</p>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            By creating a product, you agree to our{' '}
            <a href="#" className="text-blue-500 hover:underline transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-500 hover:underline transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}