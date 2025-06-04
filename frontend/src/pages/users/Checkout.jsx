import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

function decimalToDMS(deg, type) {
  const absolute = Math.abs(deg);
  const degrees = Math.floor(absolute);
  const minutesNotTruncated = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesNotTruncated);
  const seconds = ((minutesNotTruncated - minutes) * 60).toFixed(3);

  let direction = "";
  if (type === "lat") direction = deg >= 0 ? "N" : "S";
  else if (type === "lng") direction = deg >= 0 ? "E" : "W";

  return `${direction} ${degrees}° ${minutes}' ${seconds}''`;
}

const isValidPhone = (phone) => /^9\d{8}$/.test(phone);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const Checkout = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [deliveryAllowed, setDeliveryAllowed] = useState(false);
  const [message, setMessage] = useState("");
  const [notes, setNotes] = useState([]);
  const [inputNote, setInputNote] = useState("");
  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [shippingPrice, setShippingPrice] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const userId = localStorage.getItem("user_id") || "";
  const totalAmount = product ? product.price + shippingPrice : 0;

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    const handleChange = (e) => setIsDarkMode(e.matches);
    darkModeMediaQuery.addEventListener('change', handleChange);
    
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tx_ref = urlParams.get('tx_ref');
      
      if (tx_ref) {
        try {
          const response = await axios.get(`${API}/verify-payment?tx_ref=${tx_ref}`);
          if (response.data.status === 'success') {
            setVerificationStatus('success');
            if (response.data.orderId) {
              setOrderId(response.data.orderId);
              localStorage.setItem('lastOrderId', response.data.orderId);
            }
          } else {
            setVerificationStatus('failed');
          }
        } catch (error) {
          setVerificationStatus('error');
          console.error("Payment verification error:", error);
        }
      }
    };

    verifyPayment();
  }, []);

  useEffect(() => {
    const url = window.location.href;
    const match = url.match(/\/checkout\/([a-zA-Z0-9\-]+)/);
    if (match && match[1]) {
      const id = match[1];
      setProductId(id);
      fetch(`${API}/products/${id}`)
        .then((res) => res.json())
        .then(data => {
          setProduct(data);
          setShippingPrice(data.shippingPrice || 50);
        })
        .catch(() => setProduct(null));
    }
  }, []);

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      return data.display_name || "Unknown address";
    } catch {
      return "Failed to get address";
    }
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported by your browser");
      return;
    }
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newCoords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(newCoords);
        const addr = await getAddressFromCoords(newCoords.lat, newCoords.lng);

        if (!addr.toLowerCase().includes("addis ababa")) {
          setDeliveryAllowed(false);
          setMessage("Delivery is available only in Addis Ababa for now.");
        } else {
          setDeliveryAllowed(true);
          setMessage("");
        }

        setAddress(addr);
        setLoadingLocation(false);
      },
      () => {
        alert("Failed to get your location");
        setLoadingLocation(false);
      }
    );
  };

  const addNote = () => {
    const trimmed = inputNote.trim();
    if (trimmed && !notes.includes(trimmed)) {
      setNotes([...notes, trimmed]);
      setInputNote("");
    }
  };

  const removeNote = (noteToRemove) => {
    setNotes(notes.filter((n) => n !== noteToRemove));
  };

  const makePayment = async () => {
    if (!productId || !userId) return;
    
    setIsProcessing(true);
    const payload = {
      email,
      amount: totalAmount,
      userId,
      productId,
      phone,
      additionalphone: receiverPhone,
      address,
      notes: notes,
      quantity: 1
    };

    try {
      const res = await axios.post(`${API}/pay`, payload);
      if (res.data.checkout_url) {
        // Store order ID for later reference
        if (res.data.orderId) {
          localStorage.setItem('lastOrderId', res.data.orderId);
        }
        window.location.href = res.data.checkout_url;
      } else {
        alert("Payment failed: " + (res.data.message || "Unknown error"));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Check console for details";
      alert("Payment error: " + errorMsg);
      console.error("Payment error:", err.response?.data || err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !isValidEmail(email) ||
      !isValidPhone(phone) ||
      !isValidPhone(receiverPhone) ||
      !deliveryAllowed ||
      !address
    )
      return;
    makePayment();
  };

  const isFormValid =
    isValidEmail(email) && 
    isValidPhone(phone) &&
    isValidPhone(receiverPhone) &&
    deliveryAllowed && 
    address;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              ShopSphere
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-yellow-400'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-700 font-bold">U</span>
              </div>
              <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column - Product and Form */}
          <div className="lg:w-7/12">
            <div className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Complete Your Order
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Secure checkout with Chapa payment</p>
              </div>
              
              <div className="p-6">
                {product && (
                  <div className="flex items-center mb-8 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800">
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500&q=80"}
                      alt={product.name}
                      className="w-24 h-24 rounded-xl object-cover border-4 border-white dark:border-gray-800 shadow-md"
                    />
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">{product.name}</h3>
                      <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        {product.price} ETB
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                            </svg>
                          ))}
                        </div>
                        <span className="ml-2 text-gray-500 dark:text-gray-400">(24 reviews)</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200 flex items-center">
                      <span>Your Email</span>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Required</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        className={`w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${
                          email ? (isValidEmail(email) ? "border-green-500 focus:ring-green-500 focus:border-green-500" : "border-red-500 focus:ring-red-500 focus:border-red-500") : "focus:ring-indigo-500 focus:border-indigo-500"
                        } focus:outline-none focus:ring-2 transition-colors`}
                      />
                      {email && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {isValidEmail(email) ? (
                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    {!isValidEmail(email) && email.length > 0 && (
                      <p className="mt-2 text-red-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Enter a valid email address
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200 flex items-center">
                      <span>Your Phone Number</span>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Required</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">+251</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9XXXXXXXX"
                        required
                        className={`pl-14 w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${
                          phone ? (isValidPhone(phone) ? "border-green-500 focus:ring-green-500 focus:border-green-500" : "border-red-500 focus:ring-red-500 focus:border-red-500") : "focus:ring-indigo-500 focus:border-indigo-500"
                        } focus:outline-none focus:ring-2 transition-colors`}
                      />
                      {phone && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {isValidPhone(phone) ? (
                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    {!isValidPhone(phone) && phone.length > 0 && (
                      <p className="mt-2 text-red-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Enter valid Ethiopian phone starting with 9, 9 digits total
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200 flex items-center">
                      <span>Receiver's Phone Number</span>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">Required</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">+251</span>
                      </div>
                      <input
                        type="tel"
                        value={receiverPhone}
                        onChange={(e) => setReceiverPhone(e.target.value)}
                        placeholder="9XXXXXXXX"
                        required
                        className={`pl-14 w-full p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} ${
                          receiverPhone ? (isValidPhone(receiverPhone) ? "border-green-500 focus:ring-green-500 focus:border-green-500" : "border-red-500 focus:ring-red-500 focus:border-red-500") : "focus:ring-indigo-500 focus:border-indigo-500"
                        } focus:outline-none focus:ring-2 transition-colors`}
                      />
                      {receiverPhone && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          {isValidPhone(receiverPhone) ? (
                            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      )}
                    </div>
                    {!isValidPhone(receiverPhone) && receiverPhone.length > 0 && (
                      <p className="mt-2 text-red-600 text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Enter valid Ethiopian phone starting with 9, 9 digits total
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block mb-2 font-medium text-gray-800 dark:text-gray-200">
                      Order Notes (optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={inputNote}
                        onChange={(e) => setInputNote(e.target.value)}
                        placeholder="Add a note..."
                        className={`flex-1 p-3 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
                      />
                      <button
                        type="button"
                        onClick={addNote}
                        disabled={!inputNote.trim()}
                        className="px-4 py-3 bg-indigo-600 text-white rounded-lg disabled:bg-indigo-300 hover:bg-indigo-700 transition-colors flex items-center"
                      >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add
                      </button>
                    </div>
                    {notes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {notes.map((n) => (
                          <div
                            key={n}
                            className={`rounded-full px-3 py-2 flex items-center gap-2 transition-all ${
                              isDarkMode 
                                ? 'bg-gray-700 text-gray-200' 
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            <span>{n}</span>
                            <button
                              type="button"
                              onClick={() => removeNote(n)}
                              className={`text-sm font-bold ${
                                isDarkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
                              }`}
                              aria-label={`Remove note ${n}`}
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delivery Location
                    </h3>
                    
                    <button
                      type="button"
                      onClick={shareLocation}
                      disabled={loadingLocation}
                      className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center transition-all ${
                        loadingLocation 
                          ? 'bg-indigo-400 text-white' 
                          : `${
                              isDarkMode 
                                ? 'bg-indigo-700 hover:bg-indigo-600 text-white' 
                                : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                            }`
                      }`}
                    >
                      {loadingLocation ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Locating...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Use My Current Location
                        </>
                      )}
                    </button>

                    {coords && (
                      <div className={`mt-4 p-4 rounded-xl border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-gray-200' 
                          : 'bg-indigo-50 border-indigo-200 text-gray-700'
                      } transition-all duration-300`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold mb-2">Location Details</h4>
                            <p className="text-sm">
                              <span className="font-medium">Latitude:</span> {coords.lat.toFixed(6)} / {decimalToDMS(coords.lat, "lat")}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Longitude:</span> {coords.lng.toFixed(6)} / {decimalToDMS(coords.lng, "lng")}
                            </p>
                          </div>
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            deliveryAllowed 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {deliveryAllowed ? (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="mt-3 p-3 rounded-lg bg-white dark:bg-gray-800 text-sm italic border border-gray-200 dark:border-gray-700">
                          {address}
                        </p>
                      </div>
                    )}

                    {message && (
                      <div className={`mt-4 p-4 rounded-xl flex items-center ${
                        isDarkMode 
                          ? 'bg-red-900 text-red-200' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {message}
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={!isFormValid || isProcessing}
                      className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                        isFormValid && !isProcessing
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Payment...
                        </div>
                      ) : isFormValid ? (
                        <div className="flex items-center justify-center">
                          <span>Pay {totalAmount} ETB</span>
                          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      ) : (
                        "Complete all fields to proceed"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            
            {!deliveryAllowed && address && (
              <div className={`mt-6 p-4 rounded-xl text-center ${
                isDarkMode 
                  ? 'bg-gray-800 text-gray-400' 
                  : 'bg-indigo-50 text-indigo-700'
              }`}>
                <p>Delivery available only in Addis Ababa. More cities coming soon!</p>
              </div>
            )}
          </div>
          
          {/* Right Column - Order Summary */}
          <div className="lg:w-5/12">
            <div className={`sticky top-8 rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <h2 className="text-xl font-bold">Order Summary</h2>
              </div>
              
              <div className="p-6">
                {product && (
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <img
                          src={product.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100&q=80"}
                          alt={product.name}
                          className="w-16 h-16 rounded-lg object-cover border-2 border-white dark:border-gray-800 shadow"
                        />
                        <div className="ml-3">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">SKU: SP-{productId?.slice(0, 8)}</p>
                        </div>
                      </div>
                      <p className="font-bold text-indigo-600 dark:text-indigo-400">{product.price} ETB</p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="font-medium">{product?.price || 0} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="font-medium">{shippingPrice} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax</span>
                    <span className="font-medium">0 ETB</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {totalAmount} ETB
                    </span>
                  </div>
                </div>
                
                <div className="bg-indigo-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Secure Payment
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Your payment is securely processed by Chapa. We do not store your payment details.
                  </p>
                </div>
                
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Worldwide Delivery</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-sm text-gray-600 dark:text-gray-400">30-Day Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2023 ShopSphere. All rights reserved. Payment processed securely via Chapa.</p>
          <div className="mt-2 flex justify-center space-x-6">
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
          </div>
        </footer>
      </div>

      {/* Payment Verification Modals */}
      {verificationStatus === 'success' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
              <p className="mb-6">Your order has been placed successfully. Order ID: {orderId || localStorage.getItem('lastOrderId')}</p>
              <button 
                onClick={() => {
                  setVerificationStatus(null);
                  window.location.href = "/";
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'failed' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
              <p className="mb-6">Your payment could not be processed. Please try again.</p>
              <button 
                onClick={() => setVerificationStatus(null)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'error' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-md w-full rounded-2xl p-6 ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Verification Error</h2>
              <p className="mb-6">There was an issue verifying your payment. Please contact support.</p>
              <button 
                onClick={() => setVerificationStatus(null)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;