import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function Card() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/products`)
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleDetails = (id) => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    console.log("Added to cart:", product);
  };

  return (
    <div className="flex flex-wrap gap-6 justify-center p-4">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => handleDetails(product.id)}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition-all"
          style={{ width: "100%", maxWidth: "320px" }}
        >
          <img
            src={product.imageUrl || "/assets/default-image.png"}
            alt={product.name}
            className="w-full h-64 object-cover rounded-t-2xl"
          />

          <div className="p-4 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {product.name}
            </h2>

            {product.lastPrice ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <span className="line-through">{product.lastPrice} ETB</span>
                <span className="ml-2 text-orange-500 font-bold text-base">
                  {product.price} ETB
                </span>
              </div>
            ) : (
              <p className="text-orange-500 font-bold text-base">
                {product.price} ETB
              </p>
            )}

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FaStar className="text-yellow-400 mr-1" />
              4.5 (20 buyers)
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded-lg"
              >
                Add to Cart
              </button>
              <button
                onClick={() => handleDetails(product.id)}
                className="flex-1 border border-orange-500 text-orange-500 hover:bg-orange-50 text-sm py-2 px-4 rounded-lg"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
