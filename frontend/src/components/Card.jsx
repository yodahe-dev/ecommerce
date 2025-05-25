import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function Card() {
  const [products, setProducts] = useState([]);
  const [likedProducts, setLikedProducts] = useState({});
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem("user_id");

  useEffect(() => {
    axios
      .get(`${API}/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    products.forEach(product => {
      axios
        .post(`${API}/isLiked`, {
          userId: currentUserId,
          productId: product.id,
        })
        .then(res => {
          setLikedProducts(prev => ({
            ...prev,
            [product.id]: res.data.liked,
          }));
        })
        .catch(err => console.error("Error checking like status:", err));
    });
  }, [products, currentUserId]);

  const handleDetails = id => {
    navigate(`/product/${id}`);
  };

  const handleBuyNow = (e, product) => {
    e.stopPropagation();
    navigate(`/checkout/${product.id}`);
  };

  const toggleLike = async (e, productId) => {
    e.stopPropagation();
    if (!currentUserId) {
      alert("You must be logged in to like a product.");
      return;
    }

    const liked = likedProducts[productId];

    try {
      if (liked) {
        await axios.post(`${API}/unlike`, {
          userId: currentUserId,
          productId,
        });
      } else {
        await axios.post(`${API}/like`, {
          userId: currentUserId,
          productId,
        });
      }
      setLikedProducts(prev => ({ ...prev, [productId]: !liked }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const getDiscountPercentage = (oldPrice, newPrice) => {
    if (!oldPrice || oldPrice <= newPrice) return null;
    const percent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    return `-${percent}%`;
  };

  const getConditionLabel = condition => {
    switch (condition?.toLowerCase()) {
      case "new":
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
            New
          </span>
        );
      case "old":
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
            Old
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-wrap gap-6 justify-center p-4">
      {products.map(product => {
        const discount = getDiscountPercentage(product.lastPrice, product.price);
        const liked = likedProducts[product.id];

        return (
          <div
            key={product.id}
            onClick={() => handleDetails(product.id)}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
            style={{ width: "100%", maxWidth: "265px" }}
          >
            {discount && (
              <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow z-10">
                {discount}
              </div>
            )}

            <img
              src={product.imageUrl || "/src/assets/hero/for.jpg"}
              alt={product.name}
              onError={e => (e.target.src = "/assets/default-image.png")}
              className="w-full h-64 object-cover rounded-t-2xl"
            />

            <div className="p-4 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {product.name}
              </h2>

              {product.lastPrice ? (
                <div className="text-orange-500 font-bold text-base">
                  {product.price} ETB
                  <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="line-through">{product.lastPrice} ETB</span>
                  </span>
                </div>
              ) : (
                <p className="text-orange-500 font-bold text-base">
                  {product.price} ETB
                </p>
              )}

              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <FaStar className="text-yellow-400 mr-1" />
                4.5 (20 sold)
              </div>

              <div>{getConditionLabel(product.condition)}</div>

              <div className="flex gap-2 mt-4 items-center">
                <button
                  onClick={e => handleBuyNow(e, product)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded-lg"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => handleDetails(product.id)}
                  className="flex-1 border border-orange-500 text-orange-500 hover:bg-orange-50 text-sm py-2 px-4 rounded-lg"
                >
                  Details
                </button>
                <button
                  onClick={e => toggleLike(e, product.id)}
                  className="text-red-600 p-2 rounded hover:border-orange-600"
                  aria-label={liked ? "Unlike" : "Like"}
                  title={liked ? "Unlike" : "Like"}
                >
                  {liked ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
