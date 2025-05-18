import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

const formatPrice = (num) =>
  num?.toLocaleString("en-US", { minimumFractionDigits: 0 });

export default function MyCart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) {
      setError("Please log in to see your cart.");
      setLoading(false);
      return;
    }

    axios
      .get(`${API}/cart/user/${userId}`)
      .then((res) => {
        setCartItems(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load cart.");
        setLoading(false);
      });
  }, [userId]);

  const handleDelete = async (cartItemId) => {
    try {
      await axios.delete(`${API}/cart/${cartItemId}`);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (err) {
      alert("Delete failed: " + (err.response?.data?.message || err.message));
    }
  };

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) return;

    try {
      const res = await axios.put(`${API}/cart/${itemId}`, { quantity: newQty });
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: res.data.quantity } : item
        )
      );
    } catch (err) {
      alert("Failed to update quantity");
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (loading) return <p className="text-center p-4">Loading your cart...</p>;
  if (error) return <p className="text-red-600 text-center p-4">{error}</p>;
  if (cartItems.length === 0)
    return <p className="text-center p-4">Your cart is empty.</p>;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen overflow-y-auto">
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold text-center">🛒 Your Cart</h1>

      {cartItems.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-4 bg-white dark:bg-slate-800 shadow  rounded-lg p-4"
        >
          <img
            src={item.product.imageUrl || "/assets/default-image.png"}
            alt={item.product.name}
            className="w-20 h-20 object-cover rounded-md border"
            onError={(e) =>
              (e.currentTarget.src = "/assets/default-image.png")
            }
          />

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              {item.product.name}
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-300">
              Price: {formatPrice(item.product.price)} ETB
            </p>

            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                -
              </button>

              <span className="w-8 text-center">{item.quantity}</span>

              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded"
              >
                +
              </button>
            </div>

            <p className="mt-1 text-sm font-semibold text-orange-500">
              Total: {formatPrice(item.product.price * item.quantity)} ETB
            </p>
          </div>

          <button
            onClick={() => handleDelete(item.id)}
            className="text-sm text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ))}

      <div className="text-right mt-6 border-t pt-4">
        <h3 className="text-lg font-bold">
          Grand Total:{" "}
          <span className="text-orange-500">{formatPrice(totalPrice)} ETB</span>
        </h3>
      </div>
    </div>
    </div>
  );
}
