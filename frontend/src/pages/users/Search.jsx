import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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

  // Optimized fetch with abort controller
  const fetchProducts = useCallback(
    debounce(async (query, sort) => {
      const abortController = new AbortController();
      try {
        setLoading(true);
        const params = {
          search: query,
          sortBy: sort.includes('price') ? 'price' : 'createdAt',
          order: sort.includes('asc') ? 'ASC' : 'DESC',
        };
        
        const { data } = await axios.get(`${API}/products`, { 
          params,
          signal: abortController.signal 
        });
        
        setProducts(data);
        setError('');
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError('Failed to fetch products');
        }
      } finally {
        setLoading(false);
      }
      return () => abortController.abort();
    }, 300),
    []
  );

  // Memoized fuzzy search
  const fuse = new Fuse([], {
    keys: ['name', 'description'],
    threshold: 0.3,
    includeScore: true
  });

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query) return setSuggestions([]);
      try {
        const { data } = await axios.get(`${API}/products`, { params: { limit: 50 } });
        fuse.setCollection(data);
        setSuggestions(fuse.search(query).slice(0, 5).map(r => r.item));
      } catch {
        setSuggestions([]);
      }
    }, 200),
    []
  );

  useEffect(() => {
    fetchProducts(searchQuery, sortBy);
  }, [searchQuery, sortBy, fetchProducts]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Search Header */}
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto p-6 space-y-4">
          {/* Search Bar */}
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

            {/* Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute z-30 mt-2 w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                {suggestions.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover mr-4"
                    />
                    <div>
                      <div className="text-gray-800 dark:text-gray-200 font-medium">{product.name}</div>
                      <div className="text-sm text-orange-500">ETB {product.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
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
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setCardType('list')}
                className={`p-2 rounded-xl ${cardType === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
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
            <div className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          </div>
        ) : (
          <div className={`max-w-7xl mx-auto ${cardType === 'grid' ? 'grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}`}>
            {products.map(product => (
              cardType === 'grid' ? (
                <GridCard key={product.id} product={product} />
              ) : (
                <ListCard key={product.id} product={product} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const GridCard = ({ product }) => (
  <div 
    className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
    onClick={() => window.location = `/products/${product.id}`}
  >
    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 mb-4">
      <img
        src={product.imageUrl}
        alt={product.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      {product.lastPrice && (
        <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm">
          -{Math.round(100 - (product.price / product.lastPrice * 100))}%
        </div>
      )}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-1">
      {product.name}
    </h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
      {product.description}
    </p>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-orange-500">ETB {product.price}</span>
        {product.lastPrice && (
          <span className="text-sm line-through text-gray-400">ETB {product.lastPrice}</span>
        )}
      </div>
      <div className="flex gap-2">
        <button className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
        <button className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
);

const ListCard = ({ product }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
    <div className="flex gap-4">
      <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-orange-500">ETB {product.price}</span>
            {product.lastPrice && (
              <span className="text-sm line-through text-gray-400">ETB {product.lastPrice}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors">
              Add to Cart
            </button>
            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);