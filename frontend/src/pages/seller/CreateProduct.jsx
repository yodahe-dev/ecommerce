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
    lastPrice: '',
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('You must log in first.');
      return navigate('/login');
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', parseFloat(form.price));
    formData.append('quantity', parseInt(form.quantity, 10));
    formData.append('lastPrice', form.lastPrice ? parseFloat(form.lastPrice) : '');
    formData.append('userId', userId);

    if (image) {
      formData.append('image', image);
    }

    try {
      setLoading(true);
      await axios.post(`${API}/products`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Product created successfully!');
      setForm({
        name: '',
        description: '',
        price: '',
        quantity: '',
        lastPrice: '',
      });
      setImage(null);
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

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product name"
          className="p-2 border rounded"
          required
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product description"
          className="p-2 border rounded"
          required
        />

        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="p-2 border rounded"
          required
        />

        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          className="p-2 border rounded"
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="p-2 border rounded"
        />

        <input
          type="number"
          name="lastPrice"
          value={form.lastPrice}
          onChange={handleChange}
          placeholder="Last Price (optional)"
          className="p-2 border rounded"
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
