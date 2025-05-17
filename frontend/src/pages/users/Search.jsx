import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import debounce from 'lodash.debounce';
import Fuse from 'fuse.js';

const API = 'http://localhost:5000/api';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [cardType, setCardType] = useState('grid');
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  const sortMapping = {
    newest: { sortBy: 'createdAt', order: 'DESC' },
    oldest: { sortBy: 'createdAt', order: 'ASC' },
    'price-desc': { sortBy: 'price', order: 'DESC' },
    'price-asc': { sortBy: 'price', order: 'ASC' },
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

        const params = {
          search: query,
          sortBy,
          order,
        };

        const { data } = await axios.get(`${API}/products`, {
          params,
          signal: abortControllerRef.current.signal,
        });
        setProducts(data);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError('Failed to fetch products');
        }
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Fuse instance for client-side suggestions
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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center text-gray-400 dark:text-gray-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                fetchSuggestions(e.target.value);
              }}
              placeholder="Discover amazing products..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl border-0 ring-2 ring-gray-200 dark:ring-gray-700 focus:ring-3 focus:ring-orange-500 bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
            />
            {suggestions.length > 0 && (
              <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover mr-4" />
                    <div>
                      <div className="text-gray-800 dark:text-gray-200 font-medium">{product.name}</div>
                      <div className="text-sm text-orange-500">ETB {product.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 appearance-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <button
                onClick={() => setCardType('grid')}
                className={`p-2 rounded-xl ${cardType === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
                aria-label="Grid view"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setCardType('list')}
                className={`p-2 rounded-xl ${cardType === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
                aria-label="List view"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-custom px-6 py-8">
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
          <div className="max-w-7xl mx-auto text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="max-w-7xl mx-auto text-center py-12 text-gray-500 dark:text-gray-400">
            No products found.
          </div>
        ) : cardType === 'grid' ? (
          <div className="max-w-7xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="aspect-square w-full object-cover rounded-xl mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{product.name}</h3>
                <p className="text-orange-500 font-semibold">ETB {product.price}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/products/${product.id}`)}
                className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex flex-col">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{product.name}</h3>
                  <p className="text-orange-500 font-semibold">ETB {product.price}</p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{product.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
