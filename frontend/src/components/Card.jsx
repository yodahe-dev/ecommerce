import React from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import Img from "../assets/for.jpg";

const products = [
  {
    id: 1,
    name: "Samsung Galaxy S21",
    price: 1000,
    rate: 4.8,
    img: Img,
    totalBuyer: 10,
  },
];

export default function Card() {
  const navigate = useNavigate();

  const handleDetails = (id) => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // prevent routing when button is clicked
    // Add to cart logic here
    console.log("Added to cart:", product);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => handleDetails(product.id)}
          className="bg-white dark:bg-slate-800 shadow-lg rounded-xl overflow-hidden 
                     hover:shadow-xl cursor-pointer transition duration-300"
          style={{ width: "100%", maxWidth: "320px" }}
        >
          <img
            src={product.img}
            alt={product.name}
            className="h-64 w-full object-cover"
          />

          <div className="p-4 flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              {product.name}
            </h2>

            <p className="text-orange-500 text-lg font-bold">
              ${product.price}
            </p>

            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <FaStar className="text-yellow-400 mr-1" />
              {product.rate} ({product.totalBuyer} buyers)
            </div>

            <button
              onClick={(e) => handleAddToCart(e, product)}
              className="mt-3 px-4 py-2 bg-orange-500 text-white rounded-lg 
                         hover:bg-orange-600 transition text-sm font-medium"
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
