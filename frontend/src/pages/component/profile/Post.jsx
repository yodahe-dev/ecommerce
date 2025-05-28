import { useEffect, useState, Fragment, useRef } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { 
  ExclamationCircleIcon, 
  PencilIcon, 
  TrashIcon, 
  XMarkIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const API = 'http://localhost:5000/api';

export default function SellerProfile() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    price: '', 
    quantity: '',
    imageUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/products/seller/${userId}`);
        setSeller(res.data.seller);
        setProducts(res.data.products);
      } catch (err) {
        console.error('Failed to fetch seller profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchSellerData();
  }, [userId]);

  const openEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      imageUrl: product.imageUrl || ''
    });
    setImagePreview(product.imageUrl || null);
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', quantity: '', imageUrl: '' });
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({...formData, imageUrl: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleUpdate = async () => {
    if (!formData.name.trim() || !formData.price || !formData.quantity) {
      setError('Name, price and quantity are required');
      return;
    }

    try {
      const updatedData = {
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };

      const res = await axios.put(`${API}/products/${editingProduct.id}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedProduct = res.data.product;
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      closeEdit();
    } catch (err) {
      console.error('Update failed', err);
      setError('Failed to update product. Please check your inputs.');
    }
  };

  const handleDelete = async (productId) => {
    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed', err);
      setError('Failed to delete product. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!seller && loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {seller?.businessName || 'Your Store'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your products and inventory
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl">
              Add New Product
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Products
          </h2>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-indigo-900 dark:text-indigo-100">
            {products.length} items
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
                <div className="p-5">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                  <div className="flex space-x-3">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto flex items-center justify-center text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Get started by adding your first product to your store
              </p>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Add Product
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="aspect-w-16 aspect-h-10 bg-gray-100 dark:bg-gray-700 relative">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentNode.innerHTML = `
                          <div class="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-1">{product.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 line-clamp-2">{product.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{product.price} ETB</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">/ each</span>
                    </div>
                    <div className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                      <span className="font-medium text-gray-700 dark:text-gray-200">{product.quantity}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-1">in stock</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-4">
                    <button
                      onClick={() => openEdit(product)}
                      className="flex-1 inline-flex items-center justify-center bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(product)}
                      className="flex-1 inline-flex items-center justify-center bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 font-medium py-2 px-4 rounded-lg transition-colors dark:bg-red-900/30 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-800/30"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      <Transition appear show={!!editingProduct} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeEdit}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900 dark:text-white"
                    >
                      Edit Product
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={closeEdit}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Product Image
                      </label>
                      <div className="mt-1 flex justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-600 px-6 py-10">
                        <div className="text-center">
                          {imagePreview ? (
                            <div className="relative">
                              <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="mx-auto h-40 w-40 object-contain rounded-lg"
                              />
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md"
                                onClick={() => {
                                  setImagePreview(null);
                                  setFormData({...formData, imageUrl: ''});
                                }}
                              >
                                <XMarkIcon className="h-5 w-5 text-gray-500" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                              <div className="mt-4 flex text-sm leading-6 text-gray-600 dark:text-gray-400">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                                >
                                  <span>Upload an image</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs leading-5 text-gray-600 dark:text-gray-400">
                                PNG, JPG, GIF up to 10MB
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Product Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Enter product description"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Price (ETB)
                        </label>
                        <input
                          type="number"
                          id="price"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="0.00"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {error && (
                    <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-md">
                      <div className="flex items-center">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" />
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      onClick={closeEdit}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={handleUpdate}
                    >
                      Save Changes
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      
      {/* Delete Confirmation Modal */}
      <Transition appear show={!!deleteConfirm} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setDeleteConfirm(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-bold leading-6 text-gray-900 dark:text-white"
                    >
                      Confirm Deletion
                    </Dialog.Title>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-gray-600 dark:text-gray-300">
                      Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteConfirm?.name}"</span>? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      onClick={() => setDeleteConfirm(null)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      onClick={() => handleDelete(deleteConfirm.id)}
                    >
                      Delete Product
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

