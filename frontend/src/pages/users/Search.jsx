import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Fuse from 'fuse.js';
import { FiGrid, FiList, FiShoppingCart, FiSearch, FiChevronDown } from 'react-icons/fi';
import { FaStar, FaHeart, FaRegHeart, FaFire } from 'react-icons/fa';
import { IoFlashSharp } from 'react-icons/io5';
import { motion, AnimatePresence } from 'framer-motion';

const API = 'http://localhost:5000/api';
const fallbackImage = "/src/assets/hero/for.jpg";

const formatPrice = (price) => price?.toLocaleString();

const getDiscountPercent = (oldPrice, newPrice) => {
  if (!oldPrice || oldPrice <= newPrice) return null;
  const percent = ((oldPrice - newPrice) / oldPrice) * 100;
  return `-${Math.round(percent)}%`;
};

const sortOptions = {
  newest: { sortBy: 'createdAt', order: 'DESC' },
  oldest: { sortBy: 'createdAt', order: 'ASC' },
  'price-desc': { sortBy: 'price', order: 'DESC' },
  'price-asc': { sortBy: 'price', order: 'ASC' },
  popular: { sortBy: 'soldCount', order: 'DESC' },
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [cardType, setCardType] = useState('grid');
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedProducts, setLikedProducts] = useState({});
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("user_id");
  const abortControllerRef = useRef(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const fuse = useMemo(() => new Fuse([], {
    keys: ['name', 'description', 'category'],
    threshold: 0.3,
    includeScore: true,
  }), []);

  useEffect(() => {
    axios.get(`${API}/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    if (!currentUserId || products.length === 0) return;

    const fetchLikes = async () => {
      const likesData = {};
      for (const product of products) {
        try {
          const res = await axios.post(`${API}/isLiked`, {
            userId: currentUserId,
            productId: product.id,
          });
          likesData[product.id] = res.data.liked;
        } catch (err) {
          console.error("Error checking like status:", err);
          likesData[product.id] = false;
        }
      }
      setLikedProducts(likesData);
    };

    fetchLikes();
  }, [products, currentUserId]);

  const toggleLike = async (e, productId) => {
    e.stopPropagation();
    if (!currentUserId) {
      navigate('/login');
      return;
    }

    const liked = likedProducts[productId];
    const newLikedState = !liked;

    // Optimistic UI update
    setLikedProducts(prev => ({ ...prev, [productId]: newLikedState }));

    try {
      if (liked) {
        await axios.post(`${API}/unlike`, { userId: currentUserId, productId });
      } else {
        await axios.post(`${API}/like`, { userId: currentUserId, productId });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert on error
      setLikedProducts(prev => ({ ...prev, [productId]: liked }));
    }
  };

  const buyNow = (product) => {
    const exists = cart.find(item => item.id === product.id);
    const updatedCart = exists
      ? cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      : [...cart, { ...product, qty: 1 }];

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    navigate(`/checkout/${product.id}`);
  };

  const addToCart = (e, product) => {
    e.stopPropagation();
    const exists = cart.find(item => item.id === product.id);
    const updatedCart = exists
      ? cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      : [...cart, { ...product, qty: 1 }];

    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Show visual feedback
    const button = e.currentTarget;
    button.classList.add('bg-green-500');
    setTimeout(() => button.classList.remove('bg-green-500'), 300);
  };

  const fetchProducts = useCallback(debounce(async (query, sortKey) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError('');
      const { sortBy, order } = sortOptions[sortKey] || sortOptions.newest;

      const res = await axios.get(`${API}/products`, {
        params: { search: query, sortBy, order },
        signal: abortControllerRef.current.signal,
      });

      setProducts(res.data);
    } catch (err) {
      if (!axios.isCancel(err)) setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, 300), []);

  const fetchSuggestions = useCallback(debounce(async (query) => {
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      const { data } = await axios.get(`${API}/products`, { params: { limit: 50 } });
      fuse.setCollection(data);
      const results = fuse.search(query).slice(0, 5).map(r => r.item);
      setSuggestions(results);
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    }
  }, 200), [fuse]);

  useEffect(() => {
    fetchProducts(searchQuery, sortBy);
  }, [searchQuery, sortBy, fetchProducts]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.id}`);
    setShowSuggestions(false);
  };

  const renderPriceInfo = (product) => {
    const discount = getDiscountPercent(product.lastPrice, product.price);
    return product.lastPrice ? (
      <div className="flex flex-wrap items-baseline gap-1">
        <p className="text-lg font-bold text-orange-600">{formatPrice(product.price)} ETB</p>
        <p className="text-sm line-through text-gray-500">{formatPrice(product.lastPrice)} ETB</p>
        {discount && (
          <span className="ml-1 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
            {discount}
          </span>
        )}
      </div>
    ) : (
      <p className="text-lg font-bold text-orange-600">{formatPrice(product.price)} ETB</p>
    );
  };

  const renderRating = (product) => (
    <div className="flex items-center gap-1 text-sm">
      <div className="flex items-center text-amber-400">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={`${i < 4 ? 'fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
      <span className="text-gray-600">(42)</span>
      {product.soldCount > 0 && (
        <div className="flex items-center ml-2 text-gray-600">
          <FaFire className="text-orange-500 mr-1" />
          <span>{product.soldCount} sold</span>
        </div>
      )}
    </div>
  );

  const renderGridCard = (product) => {
    const liked = likedProducts[product.id];
    const discount = getDiscountPercent(product.lastPrice, product.price);
    
    return (
      <motion.div
        key={product.id}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate(`/product/${product.id}`)}
        className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <div className="relative">
          {discount && (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
              {discount}
            </div>
          )}
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={e => toggleLike(e, product.id)}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
              aria-label={liked ? "Unlike" : "Like"}
            >
              {liked ? (
                <FaHeart className="text-red-500 w-5 h-5" />
              ) : (
                <FaRegHeart className="text-gray-500 w-5 h-5 hover:text-red-500" />
              )}
            </button>
          </div>
          
          <div className="aspect-square overflow-hidden">
            <img
              src={product.imageUrl || fallbackImage}
              alt={product.name}
              onError={(e) => (e.target.src = fallbackImage)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h2 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</h2>
            {product.isNew && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            )}
          </div>
          
          {renderRating(product)}
          
          <div className="mt-1">
            {renderPriceInfo(product)}
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(e, product);
              }}
              className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-sm py-2.5 rounded-lg transition-all duration-300 shadow hover:shadow-md"
            >
              <FiShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                buyNow(product);
              }}
              className="flex-1 bg-white border border-orange-500 text-orange-500 hover:bg-orange-50 text-sm py-2.5 rounded-lg transition-colors duration-300"
            >
              Buy Now
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderListCard = (product) => {
    const liked = likedProducts[product.id];
    
    return (
      <motion.div
        key={product.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => navigate(`/product/${product.id}`)}
        className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
      >
        <div className="relative">
          <div className="w-24 h-24 rounded-lg overflow-hidden">
            <img
              src={product.imageUrl || fallbackImage}
              alt={product.name}
              onError={(e) => (e.target.src = fallbackImage)}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={e => toggleLike(e, product.id)}
            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white dark:bg-gray-700 shadow-sm hover:text-red-500"
          >
            {liked ? (
              <FaHeart className="text-red-500 w-4 h-4" />
            ) : (
              <FaRegHeart className="text-gray-500 w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
            {product.isNew && (
              <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                New
              </span>
            )}
          </div>
          
          <div className="mb-2">
            {renderRating(product)}
          </div>
          
          <div className="mb-3">
            {renderPriceInfo(product)}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {product.description}
          </p>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); addToCart(e, product); }}
            className="px-4 py-2 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-300 shadow hover:shadow-md"
          >
            <FiShoppingCart className="w-4 h-4" />
            <span>Cart</span>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); buyNow(product); }}
            className="px-4 py-2 border border-orange-500 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
          >
            Buy Now
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search for products, brands, categories..."
              className="block w-full pl-12 pr-4 py-3.5 rounded-xl border-0 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-orange-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
            />
            
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-40 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  {suggestions.map((product) => (
                    <div 
                      key={product.id} 
                      onClick={() => handleSuggestionClick(product)}
                      className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden">
                        <img
                          src={product.imageUrl || fallbackImage}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="ml-4 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                          {product.name}
                        </div>
                        <div className="text-sm text-orange-500 font-semibold">
                          ETB {formatPrice(product.price)}
                        </div>
                      </div>
                      <div className="ml-auto text-xs text-gray-500 capitalize">
                        {product.category}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button 
                  onClick={() => setFilterOpen(!filterOpen)}
                  className="flex items-center gap-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors"
                >
                  <span>Filters</span>
                  <FiChevronDown className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {filterOpen && (
                  <div className="absolute z-10 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-2">Categories</div>
                    <div className="space-y-2">
                      {['Electronics', 'Clothing', 'Home', 'Beauty'].map(category => (
                        <label key={category} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input type="checkbox" className="rounded text-orange-500" />
                          {category}
                        </label>
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-4 pr-10 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-700 dark:text-gray-300 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
              >
                <option value="newest">Newest</option>
                <option value="popular">Popular</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
              <button 
                onClick={() => setCardType('grid')} 
                className={`p-2 rounded-xl transition-colors ${cardType === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                aria-label="Grid view"
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCardType('list')} 
                className={`p-2 rounded-xl transition-colors ${cardType === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                aria-label="List view"
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="flex-1 px-4 sm:px-6 py-6 pb-20">
        {loading ? (
          <div className="max-w-7xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 animate-pulse border border-gray-100 dark:border-gray-700">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="max-w-7xl mx-auto text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <IoFlashSharp className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load products</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => fetchProducts(searchQuery, sortBy)}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="max-w-7xl mx-auto text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-500 mb-4">
              <FiSearch className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Try adjusting your search or filter to find what you're looking for
            </p>
          </div>
        ) : cardType === 'grid' ? (
          <motion.div 
            layout
            className="max-w-7xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence>
              {products.map(renderGridCard)}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className="max-w-7xl mx-auto space-y-4"
          >
            <AnimatePresence>
              {products.map(renderListCard)}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}