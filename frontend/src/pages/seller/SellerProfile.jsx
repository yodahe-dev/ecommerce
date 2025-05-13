import { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react'; // optional, for accessibility

const API = 'http://localhost:5000/api';

export default function SellerProfile() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', quantity: '' });
  const [error, setError] = useState('');
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        const res = await axios.get(`${API}/products/seller/${userId}`);
        setSeller(res.data.seller);
        setProducts(res.data.products);
      } catch (err) {
        console.error('Failed to fetch seller profile:', err);
        setError('Failed to load profile.');
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
    });
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setFormData({ name: '', description: '', price: '', quantity: '' });
  };

  const handleUpdate = async () => {
    try {
      const res = await axios.put(`${API}/products/${editingProduct.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedProduct = res.data.product;
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      closeEdit();
    } catch (err) {
      console.error('Update failed', err);
      alert('Failed to update product.');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete product.');
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (!seller) return <p>Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-2">Seller Profile</h2>
      <p><strong>Username:</strong> {seller.username}</p>
      <p><strong>Email:</strong> {seller.email}</p>
      <p><strong>Role:</strong> {seller.role}</p>
      <p><strong>Total Products:</strong> {products.length}</p>

      <hr className="my-4" />

      <h3 className="text-xl font-semibold mb-2">Your Products</h3>
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="border p-3 rounded bg-gray-50 dark:bg-gray-800">
            <p className="font-medium">{product.name}</p>
            <p className="text-sm text-gray-600">Price: ${product.price}</p>
            <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>

            <div className="flex gap-2 mt-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                onClick={() => openEdit(product)}
              >
                Edit
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                onClick={() => handleDelete(product.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Edit Popover Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
                className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
              />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
              />
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="Price"
                className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
              />
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Quantity"
                className="w-full p-2 border rounded bg-gray-100 dark:bg-gray-800"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 rounded"
                onClick={closeEdit}
              >
                Cancel
              </button>
              <button
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
                onClick={handleUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
