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
      .then(res => {
        setProducts(res.data);
      })
      .catch(err => {
        console.error("Error fetching products:", err);
      });
  }, []);

  const handleDetails = (id) => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    console.log("Added to cart:", product);
  };

  return (
    <div className="flex flex-wrap gap-5 justify-center">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => handleDetails(product.id)}
          className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden 
                     hover:shadow-xl cursor-pointer transition duration-300"
          style={{ width: "100%", maxWidth: "320px" }}
        >
          <img
            src={product.imageUrl || '/assets/default-image.png'}
            alt={product.name}
            className="h-64 w-full object-cover"
          />

          <div className="p-4 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {product.name}
            </h2>

            {product.lastPrice ? (
              <div className="flex flex-col">
                <span className="text-gray-500 line-through text-sm">
                  {product.lastPrice} ETB
                </span>
                <span className="text-orange-500 text-lg font-bold">
                  {product.price} ETB
                </span>
              </div>
            ) : (
              <p className="text-orange-500 text-lg font-bold">
                {product.price} ETB
              </p>
            )}

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FaStar className="text-yellow-400 mr-1" />
              4.5 (20 buyers)
            </div>

            <button
              onClick={(e) => handleAddToCart(e, product)}
              className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg 
                         hover:bg-orange-600 transition text-sm font-medium"
            >
              Add to Cart
            </button>

            <button
              onClick={() => handleDetails(product.id)}
              className="mt-3 px-4 py-2 text-orange-500 rounded-lg border-gray-500 
                         transition text-sm font-medium"
            >
              View details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
