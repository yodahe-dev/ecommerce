import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api'; // Change to your API URL

export default function ProductCreate() {
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    imageUrl: '',
    isDiscounted: false,
    lastPrice: '',
    currentPrice: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get the seller ID from localStorage
    const sellerId = localStorage.getItem('user_id');
    if (!sellerId) {
      alert('Seller ID not found. Please log in.');
      return navigate('/login'); // Redirect to login if no sellerId
    }

    // Add the sellerId to the form data
    const productData = { ...form, userId: sellerId };

    try {
      const response = await axios.post(`${API}/products`, productData);
      if (response.status === 200) {
        alert('Product created successfully!');
        setForm({
          name: '',
          description: '',
          price: '',
          quantity: '',
          imageUrl: '',
          isDiscounted: false,
          lastPrice: '',
          currentPrice: '',
        });
      }
    } catch (err) {
      console.error('Error submitting:', err);
      const errorMessage = err.response?.data?.message || 'Failed to create product';
      alert(errorMessage);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Product Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter product description"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Product Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Enter product price"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Product Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            placeholder="Enter product quantity"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Product Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input
            type="text"
            name="imageUrl"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="Enter image URL"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Is Discounted */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isDiscounted"
            checked={form.isDiscounted}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label className="text-sm text-gray-700">Is Discounted?</label>
        </div>

        {/* Last Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Price</label>
          <input
            type="number"
            name="lastPrice"
            value={form.lastPrice}
            onChange={handleChange}
            placeholder="Enter last price (optional)"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Current Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Current Price</label>
          <input
            type="number"
            name="currentPrice"
            value={form.currentPrice}
            onChange={handleChange}
            placeholder="Enter current price"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Create Product
          </button>
        </div>
      </form>
    </div>
  );
}
