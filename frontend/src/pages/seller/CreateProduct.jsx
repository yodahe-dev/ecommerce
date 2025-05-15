import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';  // Update your API base URL if needed

export default function CreateProduct() {
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

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must log in first.');
      return navigate('/login'); // Redirect to login if no token
    }

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', parseFloat(form.price));
    formData.append('quantity', parseInt(form.quantity, 10));
    formData.append('lastPrice', form.lastPrice ? parseFloat(form.lastPrice) : '');
    
    // Append image to formData if available
    if (image) {
      formData.append('image', image);
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API}/products`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
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

        {/* Product Name */}
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Product name"
          className="p-2 border rounded"
          required
        />

        {/* Product Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Product description"
          className="p-2 border rounded"
          required
        />

        {/* Product Price */}
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
          className="p-2 border rounded"
          required
        />

        {/* Product Quantity */}
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          className="p-2 border rounded"
          required
        />

        {/* Image Upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="p-2 border rounded"
        />

        {/* Last Price (Optional) */}
        <input
          type="number"
          name="lastPrice"
          value={form.lastPrice}
          onChange={handleChange}
          placeholder="Last Price (optional)"
          className="p-2 border rounded"
        />

        {/* Submit Button */}
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
