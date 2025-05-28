import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Fuse from 'fuse.js';
import { FiGrid, FiList, FiShoppingCart, FiSearch, FiX } from 'react-icons/fi';
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { IoFilter } from 'react-icons/io5';

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
  popular: { sortBy: 'sold', order: 'DESC' },
};

const conditionOptions = [
  { id: 'all', name: 'All Conditions' },
  { id: 'new', name: 'Brand New' },
  { id: 'used', name: 'Used' },
  { id: 'refurbished', name: 'Refurbished' },
];

const categoryOptions = [
  { id: 'all', name: 'All Categories' },
  { id: 'electronics', name: 'Electronics' },
  { id: 'fashion', name: 'Fashion' },
  { id: 'home', name: 'Home & Kitchen' },
  { id: 'sports', name: 'Sports & Outdoors' },
  { id: 'beauty', name: 'Beauty' },
];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [cardType, setCardType] = useState('grid');
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [likedProducts, setLikedProducts] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("user_id");
  const abortControllerRef = useRef(null);

  const fuse = useMemo(() => new Fuse([], {
    keys: ['name', 'description', 'category'],
    threshold: 0.3,
    includeScore: true,
  }), []);

  useEffect(() => {
    fetchProducts(searchQuery, sortBy, selectedCondition, selectedCategory, priceRange);
  }, [searchQuery, sortBy, selectedCondition, selectedCategory, priceRange]);

  useEffect(() => {
    if (!currentUserId) return;

    products.forEach(product => {
      axios.post(`${API}/isLiked`, {
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

  const toggleLike = async (e, productId) => {
    e.stopPropagation();
    if (!currentUserId) {
      alert("You must be logged in to like a product.");
      return;
    }

    const liked = likedProducts[productId];

    try {
      if (liked) {
        await axios.post(`${API}/unlike`, { userId: currentUserId, productId });
      } else {
        await axios.post(`${API}/like`, { userId: currentUserId, productId });
      }
      setLikedProducts(prev => ({ ...prev, [productId]: !liked }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const buyNow = (product) => {
    navigate(`/checkout/${product.id}`);
  };

  const fetchProducts = useCallback(debounce(async (query, sortKey, condition, category, priceRange) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError('');
      const { sortBy, order } = sortOptions[sortKey] || sortOptions.newest;

      const res = await axios.get(`${API}/products`, {
        params: { 
          search: query, 
          sortBy, 
          order,
          condition: condition === 'all' ? undefined : condition,
          category: category === 'all' ? undefined : category,
          minPrice: priceRange[0],
          maxPrice: priceRange[1]
        },
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
    if (!query) return setSuggestions([]);
    try {
      const { data } = await axios.get(`${API}/products`, { params: { limit: 50 } });
      fuse.setCollection(data);
      const results = fuse.search(query).slice(0, 5).map(r => r.item);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    }
  }, 200), [fuse]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchSuggestions(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
  };

  const renderPriceInfo = (product) => {
    const discount = getDiscountPercent(product.lastPrice, product.price);
    return product.lastPrice ? (
      <div className="flex items-center gap-2">
        <p className="text-orange-500 font-bold text-base md:text-lg">{formatPrice(product.price)} ETB</p>
        <p className="line-through text-gray-500 dark:text-gray-400 text-sm">{formatPrice(product.lastPrice)} ETB</p>
        {discount && <span className="ml-1 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">{discount}</span>}
      </div>
    ) : (
      <p className="text-orange-500 font-bold text-base md:text-lg">{formatPrice(product.price)} ETB</p>
    );
  };

  const renderGridCard = (product) => {
    const liked = likedProducts[product.id];
    return (
      <div 
        key={product.id} 
        onClick={() => navigate(`/product/${product.id}`)} 
        className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden"
      >
        <div className="relative">
          <img
            src={product.imageUrl || fallbackImage}
            alt={product.name}
            onError={(e) => (e.target.src = fallbackImage)}
            className="w-full h-64 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
          />
          <button
            onClick={e => toggleLike(e, product.id)}
            className="absolute top-3 right-3 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-100 hover:text-red-500 transition-colors"
            aria-label={liked ? "Unlike" : "Like"}
          >
            {liked ? 
              <FaHeart className="text-red-500 text-lg" /> : 
              <FaRegHeart className="text-gray-600 dark:text-gray-300 text-lg" />
            }
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h2>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{product.category}</div>
            </div>
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
              <FaStar className="text-yellow-400 mr-1" />
              <span>4.5</span>
            </div>
          </div>
          
          {renderPriceInfo(product)}
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                buyNow(product);
              }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Buy Now
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.id}`);
              }}
              className="flex-1 border border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-slate-700 text-sm py-2 px-4 rounded-lg transition-colors"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderListCard = (product) => {
    const liked = likedProducts[product.id];
    return (
      <div 
        key={product.id} 
        onClick={() => navigate(`/product/${product.id}`)} 
        className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 cursor-pointer shadow hover:shadow-md transition-all"
      >
        <div className="relative">
          <img
            src={product.imageUrl || fallbackImage}
            alt={product.name}
            onError={(e) => (e.target.src = fallbackImage)}
            className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-xl"
          />
          <button
            onClick={e => toggleLike(e, product.id)}
            className="absolute top-2 right-2 bg-white/80 dark:bg-slate-700/80 backdrop-blur-sm p-1.5 rounded-full shadow"
          >
            {liked ? 
              <FaHeart className="text-red-500 text-sm" /> : 
              <FaRegHeart className="text-gray-600 dark:text-gray-300 text-sm" />
            }
          </button>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</h3>
            <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
              <FaStar className="text-yellow-400 mr-1" />
              <span>4.5</span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-2">{product.category}</div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{product.description}</p>
          
          {renderPriceInfo(product)}
        </div>
        
        <button 
          onClick={(e) => { e.stopPropagation(); buyNow(product); }} 
          className="hidden md:flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2 px-4 rounded-xl transition-all shadow-md hover:shadow-lg"
        >
          <FiShoppingCart className="text-lg" /> Buy Now
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Discover Amazing Products</h1>
          
          <div className="relative">
            <div className="flex items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiSearch className="text-gray-500 text-xl" />
                </div>
                <input
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg"
                />
                {searchQuery && (
                  <button 
                    onClick={clearSearch}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="text-xl" />
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`ml-3 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center transition-all ${showFilters ? 'text-orange-500' : 'text-gray-500'}`}
              >
                <IoFilter className="text-2xl" />
              </button>
            </div>
            
            {(suggestions.length > 0 && isSearchFocused) && (
              <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                {suggestions.map((product) => (
                  <div 
                    key={product.id} 
                    onClick={() => navigate(`/product/${product.id}`)} 
                    className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <img
                      src={product.imageUrl || fallbackImage}
                      alt={product.name}
                      onError={(e) => (e.target.src = fallbackImage)}
                      className="w-10 h-10 rounded-lg object-cover mr-4"
                    />
                    <div className="flex-1">
                      <div className="text-gray-800 dark:text-gray-200 font-medium truncate">{product.name}</div>
                      <div className="text-sm text-orange-500">ETB {formatPrice(product.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Condition</h3>
              <div className="flex flex-wrap gap-2">
                {conditionOptions.map((condition) => (
                  <button
                    key={condition.id}
                    onClick={() => setSelectedCondition(condition.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCondition === condition.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {condition.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Category</h3>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Price Range</h3>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">ETB 0</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">ETB {priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </div>
          
          <div className="flex items-center gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="newest">Newest</option>
              <option value="popular">Popular</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="oldest">Oldest</option>
            </select>
            
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <button 
                onClick={() => setCardType('grid')} 
                className={`p-2 rounded-xl transition-colors ${cardType === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm text-orange-500' : 'text-gray-500'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setCardType('list')} 
                className={`p-2 rounded-xl transition-colors ${cardType === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm text-orange-500' : 'text-gray-500'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="flex-1 px-4 py-6">
        {loading ? (
          <div className="max-w-7xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow animate-pulse">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2" />
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="max-w-7xl mx-auto text-center py-12">
            <div className="text-red-500 text-xl mb-4">{error}</div>
            <button 
              onClick={() => fetchProducts(searchQuery, sortBy, selectedCondition, selectedCategory, priceRange)}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl shadow hover:bg-orange-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="max-w-7xl mx-auto text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCondition('all');
                setSelectedCategory('all');
                setPriceRange([0, 10000]);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : cardType === 'grid' ? (
          <div className="max-w-7xl mx-auto grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map(renderGridCard)}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-4">
            {products.map(renderListCard)}
          </div>
        )}
      </div>
      
      {/* Floating Action Button */}
      <button 
        onClick={() => setShowFilters(!showFilters)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-lg z-10 md:hidden hover:from-orange-600 hover:to-amber-600 transition-all"
      >
        <IoFilter className="text-2xl" />
      </button>
    </div>
  );
}