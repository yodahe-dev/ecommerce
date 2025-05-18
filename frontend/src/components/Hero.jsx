import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Img1 from "../assets/hero/hero-1.png";
import Img2 from "../assets/hero/hero-2.png";
import Img3 from "../assets/hero/hero-1.png";

const slides = [
  {
    title: "Welcome to Pickup",
    subtitle: "Fast, simple and secure. Buy and sell across Ethiopia.",
    extra: "Didn't get your order in 7 days? We refund.",
    image: Img1,
  },
  {
    title: "Shop Smart, Live Better",
    subtitle: "Find everything you need in one place.",
    extra: "Fast delivery across all regions.",
    image: Img2,
  },
  {
    title: "Secure Payments, Happy Users",
    subtitle: "Your transactions are safe with us.",
    extra: "Trusted by thousands nationwide.",
    image: Img3,
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <div
      className="relative flex flex-col-reverse lg:flex-row items-center justify-between
                  bg-white dark:bg-slate-900 overflow-hidden
                  px-6 py-12 lg:px-20 lg:py-20 transition-all duration-700"
    >
      {/* Left: Content */}
      <div className="lg:w-1/2 space-y-5 text-center lg:text-left z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white transition-all duration-500">
          {slide.title}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">{slide.subtitle}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{slide.extra}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-6">
          <Link
            to="/category"
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition"
          >
            Browse Products
          </Link>
          <Link
            to="/about"
            className="px-6 py-3 border border-gray-300 dark:border-gray-500
                       hover:bg-gray-100 dark:hover:bg-slate-700
                       text-gray-800 dark:text-gray-100 rounded-lg text-sm font-medium transition"
          >
            About Us
          </Link>
        </div>
      </div>

      {/* Right: Image */}
      <div className="lg:w-1/2 mb-10 lg:mb-0 relative z-0 flex justify-center">
        <div className="w-[400px] h-[300px]">
          <img
            src={slide.image}
            alt="Slide"
            className="w-full h-full rounded-xl shadow-lg object-cover transition-all duration-700"
          />
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full cursor-pointer ${
              i === current ? "bg-orange-500" : "bg-gray-400 dark:bg-gray-600"
            } transition-all`}
          />
        ))}
      </div>
    </div>
  );
}
