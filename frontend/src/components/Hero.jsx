import { Link } from "react-router-dom";
import Img from "../assets/for.jpg";

export default function Hero() {
  return (
    <div className="relative flex flex-col-reverse lg:flex-row items-center justify-between 
                    bg-white dark:bg-slate-800 overflow-hidden 
                    min-h-[300px] max-h-[100px] px-6 py-10 lg:px-16 lg:py-16">
      
      {/* Left: Content */}
      <div className="lg:w-1/2 space-y-5 text-center lg:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
          Welcome to Pickup
        </h1>
        <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
          Fast, simple and secure. Buy and sell across Ethiopia.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Didn't get your order in 7 days? We refund.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
          <Link
            to="/category"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md text-sm font-medium"
          >
            Browse Products
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 border border-gray-300 dark:border-gray-500 
                       hover:bg-gray-100 dark:hover:bg-slate-700 
                       text-gray-800 dark:text-gray-100 rounded-md text-sm font-medium"
          >
            About Us
          </Link>
        </div>
      </div>

      {/* Right: Image */}
      <div className="lg:w-1/2 mb-8 lg:mb-0">
        <img
          src={Img}
          alt="Marketplace"
          className="w-full max-w-md mx-auto shadow-md object-cover"
        />
      </div>
    </div>
  );
}
