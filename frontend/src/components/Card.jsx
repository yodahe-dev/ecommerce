import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart, FaEye, FaFire } from "react-icons/fa";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function Card() {
  const [products, setProducts] = useState([]);
  const [likedProducts, setLikedProducts] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [sortOption, setSortOption] = useState("featured");
  const [filterOption, setFilterOption] = useState("all");
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
          <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            Brand New
          </span>
        );
      case "old":
        return (
          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            Pre-Owned
          </span>
        );
      default:
        return null;
    }
  };

  const getCategoryLabel = category => {
    switch (category?.toLowerCase()) {
      case "electronics":
        return "bg-blue-100 text-blue-800";
      case "fashion":
        return "bg-pink-100 text-pink-800";
      case "home":
        return "bg-purple-100 text-purple-800";
      case "sports":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Sort and filter products
  const sortedAndFilteredProducts = [...products]
    .filter(product => {
      if (filterOption === "all") return true;
      return product.category?.toLowerCase() === filterOption;
    })
    .sort((a, b) => {
      if (sortOption === "price-low") return a.price - b.price;
      if (sortOption === "price-high") return b.price - a.price;
      if (sortOption === "popular") return b.sold - a.sold;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-600 mb-3">
            Premium Collection
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our carefully curated selection of premium products with exclusive discounts
          </p>
        </div>
        
        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => setFilterOption("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterOption === "all" ? "bg-orange-500 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              All Products
            </button>
            <button 
              onClick={() => setFilterOption("electronics")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterOption === "electronics" ? "bg-blue-500 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              Electronics
            </button>
            <button 
              onClick={() => setFilterOption("fashion")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterOption === "fashion" ? "bg-pink-500 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              Fashion
            </button>
            <button 
              onClick={() => setFilterOption("home")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterOption === "home" ? "bg-purple-500 text-white shadow-lg" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
            >
              Home & Kitchen
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-gray-600 dark:text-gray-300 text-sm">Sort by:</span>
            <select 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sortedAndFilteredProducts.map(product => {
            const discount = getDiscountPercentage(product.lastPrice, product.price);
            const liked = likedProducts[product.id];
            const isHovered = hoveredProduct === product.id;

            return (
              <div
                key={product.id}
                className="relative group"
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                <div 
                  onClick={() => handleDetails(product.id)}
                  className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer transform group-hover:-translate-y-2 h-full flex flex-col"
                >
                  {/* Badges */}
                  <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                    {discount && (
                      <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                        {discount} OFF
                      </div>
                    )}
                    {product.sold > 50 && (
                      <div className="bg-gradient-to-r from-amber-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <FaFire className="text-yellow-300" />
                        <span>Hot Deal</span>
                      </div>
                    )}
                    {getConditionLabel(product.condition)}
                  </div>
                  
                  {/* Like button */}
                  <button
                    onClick={e => toggleLike(e, product.id)}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 ${
                      liked 
                        ? "bg-red-500 text-white shadow-lg" 
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                    }`}
                    aria-label={liked ? "Unlike" : "Like"}
                    title={liked ? "Unlike" : "Like"}
                  >
                    {liked ? (
                      <FaHeart className="text-red-500 animate-pulse" size={18} />
                    ) : (
                      <FaRegHeart size={18} />
                    )}
                  </button>
                  
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <img
                      src={product.imageUrl || "/src/assets/hero/for.jpg"}
                      alt={product.name}
                      onError={e => (e.target.src = "/assets/default-image.png")}
                      className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Quick actions */}
                    <div className={`absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center gap-4 transition-opacity duration-300 ${
                      isHovered ? "opacity-100" : "opacity-0"
                    }`}>
                      <button
                        onClick={e => handleBuyNow(e, product)}
                        className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-lg transform transition-all hover:scale-110"
                      >
                        <FaShoppingCart size={18} />
                      </button>
                      <button
                        onClick={() => handleDetails(product.id)}
                        className="bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transform transition-all hover:scale-110"
                      >
                        <FaEye size={18} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className={`inline-block ${getCategoryLabel(product.category)} text-xs font-medium px-2.5 py-0.5 rounded-full mb-2`}>
                      {product.category || "Uncategorized"}
                    </div>
                    
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 mb-1">
                      {product.name}
                    </h2>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
                      {product.description || "Premium product with high quality materials"}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} size={14} className={i < 4 ? "fill-current" : "text-gray-300 dark:text-gray-600"} />
                          ))}
                        </div>
                        <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(24)</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">In Stock</span>
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-auto">
                      {product.lastPrice ? (
                        <div className="flex flex-col">
                          <span className="text-orange-500 font-bold text-lg">
                            {product.price} ETB
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            {product.lastPrice} ETB
                          </span>
                        </div>
                      ) : (
                        <p className="text-orange-500 font-bold text-lg">
                          {product.price} ETB
                        </p>
                      )}
                      
                      <div className="bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 rounded-full px-3 py-1">
                        <span className="text-xs font-medium text-orange-700 dark:text-amber-300">
                          {product.sold || 0} sold
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                    <button
                      onClick={e => handleBuyNow(e, product)}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-medium py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <FaShoppingCart />
                      <span>Buy Now</span>
                    </button>
                    <button
                      onClick={() => handleDetails(product.id)}
                      className="flex-1 border border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-medium py-2.5 rounded-xl transition-all"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Empty state */}
        {sortedAndFilteredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Try adjusting your filters to find what you're looking for
            </p>
          </div>
        )}
        
        {/* Load more button */}
        <div className="text-center mt-12">
          <button className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-800 dark:hover:to-gray-900 text-gray-800 dark:text-gray-200 font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:-translate-y-1">
            Load More Products
          </button>
        </div>
      </div>
    </div>
  );
}