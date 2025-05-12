import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function ProductUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [fetching, setFetching] = useState(true);

  // fetch product
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await axios.get(`${API}/products/${id}`);
        setForm({
          name: res.data.name,
          description: res.data.description,
          price: res.data.price,
          quantity: res.data.quantity,
          imageUrl: res.data.imageUrl || '',
          isDiscounted: res.data.isDiscounted,
          lastPrice: res.data.lastPrice || '',
          currentPrice: res.data.currentPrice,
        });
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to load product');
        navigate('/');
      } finally {
        setFetching(false);
      }
    }
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      alert('You must log in first.');
      return navigate('/login');
    }

    try {
      setLoading(true);
      const payload = { ...form, userId };
      await axios.put(`${API}/products/${id}`, payload);
      alert('Product updated.');
      navigate(`/products/${id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <p className="p-6 text-center">Loading...</p>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Update Product</h1>
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
          type="text"
          name="imageUrl"
          value={form.imageUrl}
          onChange={handleChange}
          placeholder="Image URL"
          className="p-2 border rounded"
        />

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

        <input
          type="number"
          name="lastPrice"
          value={form.lastPrice}
          onChange={handleChange}
          placeholder="Last Price"
          className="p-2 border rounded"
        />

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
          className={`bg-green-600 text-white py-2 rounded hover:bg-green-700 transition ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Updating...' : 'Update Product'}
        </button>
      </form>
    </div>
  );
}
