// src/components/CategorySection.jsx
import React from "react";
import { FaMobileAlt, FaLaptop, FaTshirt, FaHeadphones } from "react-icons/fa";

const categories = [
  { name: "Phones", icon: <FaMobileAlt size={24} /> },
  { name: "Laptops", icon: <FaLaptop size={24} /> },
  { name: "Clothes", icon: <FaTshirt size={24} /> },
  { name: "Accessories", icon: <FaHeadphones size={24} /> },
];

export default function CategorySection() {
  return (
    <section className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Browse by Category
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="flex flex-col items-center justify-center bg-orange-100 dark:bg-slate-700 
                       rounded-lg p-6 text-orange-600 dark:text-orange-300 hover:bg-orange-200 
                       dark:hover:bg-slate-600 transition transform hover:scale-105 cursor-pointer"
          >
            {cat.icon}
            <span className="mt-2 text-lg font-medium">{cat.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
