import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Fuse from 'fuse.js';
import { FiGrid, FiList, FiShoppingCart } from 'react-icons/fi';
import { FaStar } from 'react-icons/fa';
import '../../home.css';

const API = 'http://localhost:5000/api';

function formatPrice(price) {
  return price?.toLocaleString();
}

function getDiscountPercent(oldPrice, newPrice) {
  if (!oldPrice || oldPrice <= newPrice) return null;
  const percent = ((oldPrice - newPrice) / oldPrice) * 100;
  return `-${Math.round(percent)}%`;
}

function getConditionLabel(condition) {
  if (condition === 'new') return 'New';
  if (condition === 'used') return 'Used';
  return 'Unknown';
}

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [cardType, setCardType] = useState('list');
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  const sortMapping = {
    newest: { sortBy: 'createdAt', order: 'DESC' },
    oldest: { sortBy: 'createdAt', order: 'ASC' },
    'price-desc': { sortBy: 'price', order: 'DESC' },
    'price-asc': { sortBy: 'price', order: 'ASC' },
  };

  const buyNow = (product) => {
    const exists = cart.find((item) => item.id === product.id);
    const newCart = exists
      ? cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      : [...cart, { ...product, qty: 1 }];

    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    navigate(`/checkout/${product.id}`);
  };

  const fetchProducts = useCallback(
    debounce(async (query, sortKey) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError('');
        const { sortBy, order } = sortMapping[sortKey] || sortMapping.newest;
        const { data } = await axios.get(`${API}/products`, {
          params: { search: query, sortBy, order },
          signal: abortControllerRef.current.signal,
        });
        setProducts(data);
      } catch (err) {
        if (!axios.isCancel(err)) setError('Failed to fetch products');
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  const fuse = React.useMemo(
    () =>
      new Fuse([], {
        keys: ['name', 'description'],
        threshold: 0.3,
        includeScore: true,
      }),
    []
  );

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query) return setSuggestions([]);
      try {
        const { data } = await axios.get(`${API}/products`, { params: { limit: 50 } });
        fuse.setCollection(data);
        const results = fuse.search(query).slice(0, 5).map((r) => r.item);
        setSuggestions(results);
      } catch {
        setSuggestions([]);
      }
    }, 200),
    [fuse]
  );

  useEffect(() => {
    fetchProducts(searchQuery, sortBy);
  }, [searchQuery, sortBy, fetchProducts]);

  return (
    <div className="overflow-y-auto flex flex-col bg-gray-50 dark:bg-gray-900 h-screen">
      <div className="sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          <div className="relative group">
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              placeholder="Search products..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl border-0 ring-2 ring-gray-200 dark:ring-gray-700 focus:ring-3 focus:ring-orange-500 bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover mr-4" />
                    <div>
                      <div className="text-gray-800 dark:text-gray-200 font-medium">{product.name}</div>
                      <div className="text-sm text-orange-500">ETB {formatPrice(product.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="newest">Newest</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="oldest">Oldest</option>
            </select>
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <button onClick={() => setCardType('grid')} className={`p-2 rounded-xl ${cardType === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}>
                <FiGrid className="w-6 h-6" />
              </button>
              <button onClick={() => setCardType('list')} className={`p-2 rounded-xl ${cardType === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}>
                <FiList className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {loading ? (
          <div className="max-w-7xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded mb-3 w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded mb-2 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">No products found.</div>
        ) : cardType === 'grid' ? (
          <div className="max-w-7xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const discount = getDiscountPercent(product.lastPrice, product.price);
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="relative bg-white dark:bg-slate-800 rounded-2xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
                >
                  {discount && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded shadow z-10">
                      {discount}
                    </div>
                  )}
                  <img
                    src={product.imageUrl || "/assets/default-image.png"}
                    alt={product.name}
                    onError={(e) => (e.target.src = "/assets/default-image.png")}
                    className="w-full h-64 object-cover rounded-t-2xl"
                  />
                  <div className="p-4 space-y-2">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{product.name}</h2>
                    {product.lastPrice ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="line-through">{formatPrice(product.lastPrice)} ETB</span>
                        <span className="ml-2 text-orange-500 font-bold text-base">{formatPrice(product.price)} ETB</span>
                      </div>
                    ) : (
                      <div className="text-orange-500 font-bold text-base">{formatPrice(product.price)} ETB</div>
                    )}
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <FaStar className="text-yellow-400 mr-1" />
                      4.5 (20 sold)
                    </div>
                    <div>{getConditionLabel(product.condition)}</div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          buyNow(product);
                        }}
                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-4 rounded-lg"
                      >
                        Buy Now
                      </button>
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="flex-1 border border-orange-500 text-orange-500 hover:bg-orange-50 text-sm py-2 px-4 rounded-lg"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-4">
            {products.map((product) => {
              const discount = getDiscountPercent(product.lastPrice, product.price);
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 cursor-pointer"
                >
                  <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{product.name}</h3>
                    {product.lastPrice ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <span className="line-through">{formatPrice(product.lastPrice)} ETB</span>
                        <span className="ml-2 text-orange-500 font-bold text-base">{formatPrice(product.price)} ETB</span>
                        <span className="ml-2 text-green-600">{discount}</span>
                      </div>
                    ) : (
                      <p className="text-orange-500 font-semibold">ETB {formatPrice(product.price)}</p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{product.description}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      buyNow(product);
                    }}
                    className="px-3 py-2 flex items-center gap-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600"
                  >
                    <FiShoppingCart /> Buy Now
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div className="min-h-52" />
      </div>
    </div>
  );
}
