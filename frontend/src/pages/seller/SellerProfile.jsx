import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api';

export default function SellerProfile() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const userId = localStorage.getItem('user_id');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

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

  const handleEdit = (productId) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await axios.delete(`${API}/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
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
      {products.length === 0 ? (
        <p>You haven't listed any products yet.</p>
      ) : (
        <ul className="space-y-2">
          {products.map((product) => (
            <li key={product.id} className="border p-3 rounded bg-gray-50 dark:bg-gray-800">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-gray-600">Price: ${product.price}</p>
              <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>

              <div className="flex gap-2 mt-2">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  onClick={() => handleEdit(product.id)}
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
      )}
    </div>
  );
}
