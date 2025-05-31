import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Fuse from 'fuse.js';
import { 
  FiGrid, FiList, FiShoppingCart, FiSearch, FiX, 
  FiHeart, FiClock, FiTruck, FiGift, FiShield, 
  FiFilter, FiStar, FiUser, FiShoppingBag, FiChevronRight
} from 'react-icons/fi';
import { FaStar, FaHeart, FaRegHeart, FaFire, FaGem, FaShippingFast } from 'react-icons/fa';
import { BiCategory, BiSolidDiscount, BiTrendingUp } from 'react-icons/bi';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const API = 'http://localhost:5000/api';
const fallbackImage = "/src/assets/hero/for.jpg";

// Custom hook for responsive design
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

const formatPrice = (price) => price?.toLocaleString();

const getDiscountPercent = (oldPrice, newPrice) => {
  if (!oldPrice || oldPrice <= newPrice) return null;
  const percent = ((oldPrice - newPrice) / oldPrice) * 100;
  return `-${Math.round(percent)}%`;
};

const sortOptions = {
  newest: { sortBy: 'createdAt', order: 'DESC' },
  popular: { sortBy: 'sold', order: 'DESC' },
  'price-desc': { sortBy: 'price', order: 'DESC' },
  'price-asc': { sortBy: 'price', order: 'ASC' },
  'top-rated': { sortBy: 'rating', order: 'DESC' },
};

const conditionOptions = [
  { id: 'all', name: 'All Conditions', icon: '🔄' },
  { id: 'new', name: 'Brand New', icon: '✨' },
  { id: 'used', name: 'Pre-owned', icon: '🔄' },
  { id: 'other', name: 'Other', icon: '❓' },
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const slideUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

const staggerChildren = {
  visible: { 
    transition: { 
      staggerChildren: 0.1 
    } 
  }
};

const slideIn = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.5 } }
};

// Rating Stars Component
const RatingStars = ({ rating, size = 'sm' }) => {
  const starSize = size === 'lg' ? 'text-lg' : 'text-sm';
  
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => (
        <FaStar 
          key={i} 
          className={`${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'} ${starSize} mr-0.5`}
        />
      ))}
      <span className={`ml-1 text-gray-600 dark:text-gray-300 ${size === 'lg' ? 'text-sm' : 'text-xs'}`}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

// Custom hook for sold count
const useSoldCount = () => {
  const [soldCounts, setSoldCounts] = useState({});
  
  const fetchSoldCount = useCallback(async (productId) => {
    try {
      const response = await axios.get(`${API}/product/${productId}/sold-count`);
      setSoldCounts(prev => ({
        ...prev,
        [productId]: response.data.soldCount || 0
      }));
    } catch (error) {
      console.error(`Error fetching sold count for product ${productId}:`, error);
    }
  }, []);

  const fetchSoldCounts = useCallback(async (productIds) => {
    try {
      const counts = {};
      
      await Promise.all(productIds.map(async (id) => {
        try {
          const response = await axios.get(`${API}/product/${id}/sold-count`);
          counts[id] = response.data.soldCount || 0;
        } catch (err) {
          console.error(`Error fetching sold count for product ${id}:`, err);
          counts[id] = 0;
        }
      }));
      
      setSoldCounts(prev => ({ ...prev, ...counts }));
    } catch (error) {
      console.error("Error fetching sold counts:", error);
    }
  }, []);

  return { soldCounts, fetchSoldCount, fetchSoldCounts };
};

// Product Card Component
const ProductCard = ({ 
  product, 
  index, 
  navigate, 
  likedProducts, 
  toggleLike, 
  categoryMap, 
  productRatings, 
  soldCounts,
  cardType = 'grid'
}) => {
  const liked = likedProducts[product.id];
  const rating = productRatings[product.id] || 0;
  const soldCount = soldCounts[product.id] || 0;
  
  const renderPriceInfo = () => {
    const discount = getDiscountPercent(product.lastPrice, product.price);
    return product.lastPrice ? (
      <div className="flex items-center gap-2">
        <p className="text-orange-600 font-bold text-base md:text-lg">{formatPrice(product.price)} ETB</p>
        <p className="line-through text-gray-500 dark:text-gray-400 text-sm">{formatPrice(product.lastPrice)} ETB</p>
        {discount && (
          <span className="ml-1 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
            <BiSolidDiscount className="mr-1" /> {discount}
          </span>
        )}
      </div>
    ) : (
      <p className="text-orange-600 font-bold text-base md:text-lg">{formatPrice(product.price)} ETB</p>
    );
  };

  const renderConditionBadge = (condition) => {
    if (!condition) return null;
    
    let bgColor, textColor, icon;
    
    switch(condition) {
      case 'new': 
        bgColor = 'bg-emerald-100 dark:bg-emerald-900/30';
        textColor = 'text-emerald-800 dark:text-emerald-200';
        icon = '✨';
        break;
      case 'used':
        bgColor = 'bg-blue-100 dark:bg-blue-900/30';
        textColor = 'text-blue-800 dark:text-blue-200';
        icon = '🔄';
        break;
      case 'other':
        bgColor = 'bg-purple-100 dark:bg-purple-900/30';
        textColor = 'text-purple-800 dark:text-purple-200';
        icon = '❓';
        break;
      default:
        bgColor = 'bg-gray-100 dark:bg-gray-800';
        textColor = 'text-gray-800 dark:text-gray-200';
        icon = '📦';
    }
    
    return (
      <div className={`text-xs font-bold px-2 py-1 rounded-full ${bgColor} ${textColor} flex items-center gap-1`}>
        <span>{icon}</span> {condition.charAt(0).toUpperCase() + condition.slice(1)}
      </div>
    );
  };

  const buyNow = (e) => {
    e.stopPropagation();
    navigate(`/checkout/${product.id}`);
  };

  if (cardType === 'grid') {
    return (
      <motion.div 
        key={product.id} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onClick={() => navigate(`/product/${product.id}`)} 
        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        <div className="relative">
          <div className="relative aspect-square overflow-hidden">
            <img
              src={product.imageUrl || fallbackImage}
              alt={product.name}
              onError={(e) => (e.target.src = fallbackImage)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
          
          {product.isFeatured && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10">
              <FaFire className="inline mr-1" /> Featured
            </div>
          )}
          
          <div className="absolute top-3 left-3 z-10">
            {renderConditionBadge(product.condition)}
          </div>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={e => toggleLike(e, product.id)}
            className="absolute top-3 right-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-100 hover:text-red-500 transition-colors z-10"
            aria-label={liked ? "Unlike" : "Like"}
          >
            {liked ? 
              <FaHeart className="text-red-500 text-lg" /> : 
              <FaRegHeart className="text-gray-600 dark:text-gray-300 text-lg" />
            }
          </motion.button>
          
          {/* Hot Deal Badge */}
          {soldCount > 10 && (
            <div className="absolute bottom-3 right-3 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center">
              <BiTrendingUp className="mr-1" /> Hot Deal
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h2>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {categoryMap[product.categoryId] || 'Uncategorized'}
            </div>
            <RatingStars rating={rating} />
          </div>
          
          {renderPriceInfo()}
          
          <div className="flex justify-between items-center mt-2">
            {soldCount > 0 && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <FiShoppingBag className="mr-1" />
                <span>{soldCount} sold</span>
              </div>
            )}
            <div className="flex-1"></div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {product.stock > 0 ? (
                <span className="text-green-600">{product.stock} in stock</span>
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => buyNow(e)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              Buy Now
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/product/${product.id}`);
              }}
              className="flex-1 border border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 text-sm py-2 px-4 rounded-lg transition-colors"
            >
              Details
            </motion.button>
          </div>
        </div>
      </motion.div>
    );
  } else {
    return (
      <motion.div 
        key={product.id} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.3 }}
        onClick={() => navigate(`/product/${product.id}`)} 
        className="flex flex-col sm:flex-row items-start gap-4 bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer shadow hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
      >
        <div className="relative w-full sm:w-40 aspect-square">
          <img
            src={product.imageUrl || fallbackImage}
            alt={product.name}
            onError={(e) => (e.target.src = fallbackImage)}
            className="w-full h-full object-cover rounded-lg"
            loading="lazy"
          />
          <div className="absolute top-2 left-2">
            {renderConditionBadge(product.condition)}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={e => toggleLike(e, product.id)}
            className="absolute top-2 right-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1.5 rounded-full shadow"
          >
            {liked ? 
              <FaHeart className="text-red-500 text-sm" /> : 
              <FaRegHeart className="text-gray-600 dark:text-gray-300 text-sm" />
            }
          </motion.button>
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{product.name}</h3>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-2">
                {categoryMap[product.categoryId] || 'Uncategorized'}
              </div>
            </div>
            <RatingStars rating={rating} />
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">{product.description}</p>
          
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {renderPriceInfo()}
            </div>
            
            <div className="flex items-center gap-4">
              {soldCount > 0 && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FiShoppingBag className="mr-1" />
                  <span>{soldCount} sold</span>
                </div>
              )}
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {product.stock > 0 ? (
                  <span className="text-green-600">{product.stock} in stock</span>
                ) : (
                  <span className="text-red-600">Out of stock</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-3 sm:mt-0">
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => buyNow(e)} 
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
          >
            <FiShoppingCart className="text-lg" /> Buy Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.id}`);
            }}
            className="flex-1 sm:flex-initial border border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            Details
          </motion.button>
        </div>
      </motion.div>
    );
  }
};

// Hero Section Component
const HeroSection = ({ featuredProducts, navigate, productRatings }) => {
  return (
    <div className="relative bg-gradient-to-br from-orange-900 via-amber-900 to-orange-900 text-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/40 to-black/80"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1607082350899-7e105aa886ae?auto=format&fit=crop&w=1920')] bg-cover bg-center opacity-10"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-6"
          >
            <motion.div variants={slideUp} className="bg-orange-800/30 backdrop-blur-sm border border-orange-700/50 inline-block px-4 py-2 rounded-full">
              <div className="flex items-center gap-2">
                <FaGem className="text-orange-300" />
                <span className="font-medium">Ethiopia's Premier Marketplace</span>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={slideUp}
              className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight"
            >
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">AfroHive</span> Marketplace
            </motion.h1>
            
            <motion.p 
              variants={slideUp}
              className="text-xl md:text-2xl mb-8 text-gray-200 max-w-xl"
            >
              Connecting Ethiopian sellers and buyers in Africa's fastest growing e-commerce ecosystem
            </motion.p>
            
            <motion.div 
              variants={slideUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/products')}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center"
              >
                <FaFire className="mr-2" /> Shop Hot Deals
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 bg-transparent border-2 border-white/30 text-white font-bold rounded-xl shadow-xl transition-all duration-300 hover:bg-white/10 backdrop-blur-sm"
              >
                Explore Products
              </motion.button>
            </motion.div>
            
            <motion.div 
              variants={slideUp}
              className="mt-8 flex flex-wrap gap-4"
            >
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full p-1 mr-2">
                  <FiUser className="text-white" />
                </div>
                <span>500k+ Happy Customers</span>
              </div>
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full p-1 mr-2">
                  <FiStar className="text-white" />
                </div>
                <span>4.8/5 Average Rating</span>
              </div>
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full p-1 mr-2">
                  <FiShoppingBag className="text-white" />
                </div>
                <span>100k+ Orders Delivered</span>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-2 gap-4"
          >
            {featuredProducts.slice(0, 4).map((product, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1, duration: 0.3 }}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 cursor-pointer border border-white/20 hover:border-amber-400 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center">
                  <div className="mb-3 bg-white p-2 rounded-lg w-16 h-16 flex items-center justify-center">
                    <img 
                      src={product.imageUrl || fallbackImage} 
                      alt={product.name}
                      className="w-12 h-12 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-white font-semibold text-center line-clamp-1 group-hover:text-amber-300">{product.name}</h3>
                  <p className="text-amber-300 font-bold mt-1">{formatPrice(product.price)} ETB</p>
                  <div className="mt-1">
                    <RatingStars 
                      rating={productRatings[product.id] || 0} 
                      size="sm" 
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Featured Categories Component
const FeaturedCategories = ({ categories, handleCategoryClick }) => {
  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={staggerChildren}
      className="py-16 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.div variants={fadeIn} className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Popular Categories</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover products across our most popular categories
          </p>
        </motion.div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {categories.slice(0, 5).map((category, index) => (
            <motion.div 
              key={category.id}
              variants={slideUp}
              whileHover={{ y: -5 }}
              onClick={() => handleCategoryClick(category.id)}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 w-16 h-16 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BiCategory className="text-orange-500 text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{category.name}</h3>
                <div className="flex items-center text-orange-500 mt-2">
                  <span className="text-sm">Shop Now</span>
                  <FiChevronRight />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function HomePage() {
  const screenSize = useScreenSize();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [cardType, setCardType] = useState('grid');
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [likedProducts, setLikedProducts] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [productRatings, setProductRatings] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("user_id");
  const abortControllerRef = useRef(null);
  const searchRef = useRef(null);
  
  const { soldCounts, fetchSoldCounts } = useSoldCount();
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  });

  const fuse = useMemo(() => new Fuse([], {
    keys: ['name', 'description', 'category'],
    threshold: 0.3,
    includeScore: true,
  }), []);

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach(category => {
      map[category.id] = category.name;
    });
    return map;
  }, [categories]);

  // Fetch product ratings
  const fetchProductRatings = useCallback(async (productIds) => {
    try {
      const ratings = {};
      
      await Promise.all(productIds.map(async (id) => {
        try {
          const response = await axios.get(`${API}/rating/${id}`);
          ratings[id] = response.data.averageRating || 0;
        } catch (err) {
          console.error(`Error fetching rating for product ${id}:`, err);
          ratings[id] = 0;
        }
      }));
      
      setProductRatings(prev => ({ ...prev, ...ratings }));
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API}/categories`);
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const fetchProducts = useCallback(debounce(async (query, sortKey, condition, category, priceRange, pageNum = 1, reset = false) => {
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
          categoryId: category === 'all' ? undefined : category,
          minPrice: priceRange.min,
          maxPrice: priceRange.max,
          page: pageNum,
          limit: 12
        },
        signal: abortControllerRef.current.signal,
      });

      if (reset) {
        setProducts(res.data);
      } else {
        setProducts(prev => [...prev, ...res.data]);
      }
      
      // Check if there are more products
      setHasMore(res.data.length === 12);
      
      // Fetch ratings and sold counts for new products
      const productIds = res.data.map(p => p.id);
      if (productIds.length > 0) {
        fetchProductRatings(productIds);
        fetchSoldCounts(productIds);
      }
    } catch (err) {
      if (!axios.isCancel(err)) setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, 300), [fetchProductRatings, fetchSoldCounts]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      const nextPage = page + 1;
      fetchProducts(searchQuery, sortBy, selectedCondition, selectedCategory, priceRange, nextPage, false);
      setPage(nextPage);
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {
    const fetchSpecialProducts = async () => {
      try {
        const featuredRes = await axios.get(`${API}/products`, { params: { featured: true, limit: 4 } });
        setFeaturedProducts(featuredRes.data);
        
        // Fetch ratings and sold counts for featured products
        const productIds = featuredRes.data.map(p => p.id);
        if (productIds.length > 0) {
          fetchProductRatings(productIds);
          fetchSoldCounts(productIds);
        }
      } catch (err) {
        console.error("Error fetching special products:", err);
      }
    };

    fetchSpecialProducts();
  }, [fetchProductRatings, fetchSoldCounts]);

  useEffect(() => {
    // Reset to page 1 when filters change
    setPage(1);
    fetchProducts(searchQuery, sortBy, selectedCondition, selectedCategory, priceRange, 1, true);
  }, [searchQuery, sortBy, selectedCondition, selectedCategory, priceRange, fetchProducts]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!currentUserId || products.length === 0) return;

    const checkLikes = async () => {
      try {
        const likeStatus = await Promise.all(
          products.map(product => 
            axios.post(`${API}/isLiked`, {
              userId: currentUserId,
              productId: product.id,
            }).then(res => ({ id: product.id, liked: res.data.liked }))
          )
        );
        
        const newLikedProducts = likeStatus.reduce((acc, { id, liked }) => {
          acc[id] = liked;
          return acc;
        }, {});
        
        setLikedProducts(newLikedProducts);
      } catch (err) {
        console.error("Error checking like status:", err);
      }
    };

    checkLikes();
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
    if (searchRef.current) searchRef.current.focus();
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowFilters(false);
    
    setTimeout(() => {
      document.getElementById('products-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: parseInt(value)
    }));
  };

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <HeroSection 
        featuredProducts={featuredProducts} 
        navigate={navigate} 
        productRatings={productRatings} 
      />
      
      {/* Featured Categories */}
      <FeaturedCategories 
        categories={categories} 
        handleCategoryClick={handleCategoryClick} 
      />
      
      {/* Condition Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-gray-800 shadow-sm py-4 border-b border-gray-200 dark:border-gray-700"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide space-x-4 py-1">
            {conditionOptions.map((condition) => (
              <motion.button
                key={condition.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCondition(condition.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCondition === condition.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{condition.icon}</span>
                  {condition.name}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="relative">
            <div className="flex items-center">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FiSearch className="text-gray-500 text-xl" />
                </div>
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-lg border border-gray-200 dark:border-gray-700"
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
              
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`ml-3 p-4 rounded-2xl bg-white dark:bg-gray-800 shadow-lg flex items-center transition-all border border-gray-200 dark:border-gray-700 ${
                  showFilters ? 'text-orange-500' : 'text-gray-500'
                }`}
              >
                <FiFilter className="text-2xl" />
              </motion.button>
            </div>
            
            <AnimatePresence>
              {(suggestions.length > 0 && isSearchFocused) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {suggestions.map((product) => (
                    <motion.div 
                      key={product.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => navigate(`/product/${product.id}`)} 
                      className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <img
                        src={product.imageUrl || fallbackImage}
                        alt={product.name}
                        onError={(e) => (e.target.src = fallbackImage)}
                        className="w-10 h-10 rounded-lg object-cover mr-4"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <div className="text-gray-800 dark:text-gray-200 font-medium truncate">{product.name}</div>
                        <div className="text-sm text-orange-500">ETB {formatPrice(product.price)}</div>
                      </div>
                      <div className="text-xs">
                        {product.condition === 'new' ? (
                          <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 px-2 py-1 rounded-full">
                            ✨ New
                          </div>
                        ) : product.condition === 'used' ? (
                          <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
                            🔄 Used
                          </div>
                        ) : (
                          <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full">
                            📦 Other
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Mobile Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Categories</h4>
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-200'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Price Range (ETB)</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 dark:text-gray-300">Min:</label>
                      <input
                        type="number"
                        min="0"
                        max={priceRange.max}
                        value={priceRange.min}
                        onChange={(e) => handlePriceChange('min', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 dark:text-gray-300">Max:</label>
                      <input
                        type="number"
                        min={priceRange.min}
                        max="10000"
                        value={priceRange.max}
                        onChange={(e) => handlePriceChange('max', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        step="100"
                        value={priceRange.max}
                        onChange={(e) => handlePriceChange('max', e.target.value)}
                        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-600"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sort By</h4>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 border-0"
                  >
                    <option value="newest">Newest Arrivals</option>
                    <option value="popular">Most Popular</option>
                    <option value="top-rated">Top Rated</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="price-asc">Price: Low to High</option>
                  </select>
                </div>
                
                <button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCondition('all');
                    setSelectedCategory('all');
                    setPriceRange({ min: 0, max: 10000 });
                  }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow hover:from-orange-600 hover:to-amber-600 transition-all"
                >
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Products Grid */}
        <div id="products-section">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory === 'all' ? 'All Products' : categoryMap[selectedCategory] || 'Products'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
              <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCardType('grid')} 
                  className={`p-2 rounded-xl transition-colors ${cardType === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm text-orange-500' : 'text-gray-500'}`}
                >
                  <FiGrid className="w-5 h-5" />
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCardType('list')} 
                  className={`p-2 rounded-xl transition-colors ${cardType === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm text-orange-500' : 'text-gray-500'}`}
                >
                  <FiList className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
          
          {loading && page === 1 ? (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow"
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 animate-pulse" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-1/2" />
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4" />
                </motion.div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-xl mb-4">{error}</div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => fetchProducts(searchQuery, sortBy, selectedCondition, selectedCategory, priceRange)}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl shadow hover:bg-orange-600 transition-colors"
              >
                Try Again
              </motion.button>
            </div>
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No products found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search or filter criteria</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCondition('all');
                  setSelectedCategory('all');
                  setPriceRange({ min: 0, max: 10000 });
                }}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                Clear Filters
              </motion.button>
            </motion.div>
          ) : cardType === 'grid' ? (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={staggerChildren}
              className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            >
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  index={index}
                  navigate={navigate}
                  likedProducts={likedProducts}
                  toggleLike={toggleLike}
                  categoryMap={categoryMap}
                  productRatings={productRatings}
                  soldCounts={soldCounts}
                  cardType="grid"
                />
              ))}
            </motion.div>
          ) : (
            <div className="space-y-4">
              {products.map((product, index) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  index={index}
                  navigate={navigate}
                  likedProducts={likedProducts}
                  toggleLike={toggleLike}
                  categoryMap={categoryMap}
                  productRatings={productRatings}
                  soldCounts={soldCounts}
                  cardType="list"
                />
              ))}
            </div>
          )}
          
          {/* Infinite scroll loader */}
          {hasMore && products.length > 0 && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          )}
        </div>
      </div>
      
      {/* Floating Action Button */}
      <AnimatePresence>
        {screenSize.isMobile && (
          <motion.button 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => setShowFilters(!showFilters)}
            className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full shadow-lg z-10 hover:from-orange-600 hover:to-amber-600 transition-all"
          >
            <FiFilter className="text-2xl" />
          </motion.button>
        )}
      </AnimatePresence>
      
      {/* Fast Shipping Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-900 border-t border-b border-orange-200 dark:border-gray-700 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-orange-500 p-3 rounded-full">
                <FaShippingFast className="text-white text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fast & Reliable Delivery</h3>
                <p className="text-gray-600 dark:text-gray-400">Across Ethiopia in 2-3 business days</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/shipping')}
              className="px-6 py-3 bg-white dark:bg-gray-800 text-orange-500 font-medium rounded-lg shadow hover:shadow-md transition-all border border-orange-200 dark:border-gray-700"
            >
              Learn More
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}