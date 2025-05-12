import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

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

  const [loading, setLoading] = useState(false);
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

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('You must log in first.');
      return navigate('/login');
    }

    const productData = { ...form, userId };

    try {
      setLoading(true);
      const res = await axios.post(`${API}/products`, productData);
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
    } catch (err) {
      console.error('Product create failed:', err);
      const message = err.response?.data?.message || 'Something went wrong.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        {/* Name */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product name"
          className="p-2 border rounded"
          required
        />

        {/* Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product description"
          className="p-2 border rounded"
          required
        />

        {/* Price */}
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="p-2 border rounded"
          required
        />

        {/* Quantity */}
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          className="p-2 border rounded"
          required
        />

        {/* Image URL */}
        <input
          type="text"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="Image URL"
          className="p-2 border rounded"
        />

        {/* Is Discounted */}
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isDiscounted"
            checked={form.isDiscounted}
            onChange={handleChange}
            className="mr-2"
          />
          Discounted?
        </label>

        {/* Last Price */}
        <input
          type="number"
          name="lastPrice"
          value={form.lastPrice}
          onChange={handleChange}
          placeholder="Last Price"
          className="p-2 border rounded"
        />

        {/* Current Price */}
        <input
          type="number"
          name="currentPrice"
          value={form.currentPrice}
          onChange={handleChange}
          placeholder="Current Price"
          className="p-2 border rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
