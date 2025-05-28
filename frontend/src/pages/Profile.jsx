import React, { useState, useEffect } from "react";
import { FaUserCircle, FaSpinner, FaCopy, FaStar, FaChevronRight } from "react-icons/fa";
import { MdDarkMode, MdLightMode, MdOutlineInventory, MdOutlineReceipt, MdDashboard } from "react-icons/md";
import { HiOutlineShoppingBag, HiOutlineCreditCard } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { getProfile } from "../api";
import SellerProfile from "./component/profile/Post";

const API = "http://localhost:5000/api";

export default function Profile({ token, darkMode, setDarkMode }) {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("orders");
  const [orderTab, setOrderTab] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState("");
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    getProfile(token)
      .then((res) => {
        if (res.error) {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          setUser(res);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile.");
        setLoading(false);
      });
  }, [token, navigate]);

  useEffect(() => {
    if (!user) return;

    const statusMap = {
      all: "",
      unpaid: "pending",
      paid: "paid",
      received: "received",
    };

    const status = statusMap[orderTab.toLowerCase()] || "";
    const url = `${API}/orders/${user.id}${status ? `?status=${status}` : ""}`;

    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (orderTab.toLowerCase() === "unpaid") {
          setOrders(data.filter((o) => o.orderStatus === "pending"));
        } else {
          setOrders(data);
        }
      })
      .catch(() => setOrders([]));
  }, [orderTab, user, token]);

  const copyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopySuccess("Copied!");
      setTimeout(() => setCopySuccess(""), 2000);
    }
  };

  const confirmReceived = async (orderId) => {
    const res = await fetch(`${API}/orders/confirm/${orderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setOrders((orders) =>
        orders.map((o) =>
          o.id === orderId ? { ...o, receiveStatus: "received" } : o
        )
      );
    } else {
      const err = await res.json();
      alert(err?.error || "Failed to confirm receipt");
    }
  };

  const openRatingModal = (product) => {
    setCurrentProduct(product);
    setShowModal(true);
  };

  const closeRatingModal = () => {
    setShowModal(false);
    setRatingValue(0);
    setFeedbackText("");
    setImageFile(null);
  };

  const submitRating = async () => {
    if (!ratingValue || !currentProduct) {
      return alert("Please select a rating.");
    }

    const formData = new FormData();
    formData.append("userId", user.id);
    formData.append("productId", currentProduct.id);
    formData.append("rating", ratingValue);
    formData.append("feedback", feedbackText);
    if (imageFile) formData.append("image", imageFile);

    try {
      const res = await fetch(`${API}/rating`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        alert("Rating submitted.");
        closeRatingModal();
      } else {
        const error = await res.json();
        alert(error.message || "Failed to submit rating.");
      }
    } catch (err) {
      alert("Error submitting rating.");
    }
  };

  const payNow = async (orderId) => {
    try {
      const res = await fetch(`${API}/orders/pay/${orderId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        alert("Payment successful.");
        setOrders((orders) =>
          orders.map((o) =>
            o.id === orderId ? { ...o, orderStatus: "paid" } : o
          )
        );
      } else {
        const error = await res.json();
        alert(error?.error || "Payment failed.");
      }
    } catch {
      alert("Payment failed.");
    }
  };

  const statusBadge = (status) => {
    const statusClasses = {
      pending: "bg-amber-100 text-amber-800",
      paid: "bg-blue-100 text-blue-800",
      received: "bg-green-100 text-green-800",
    };
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderOrderTabs = () => (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2 pb-2">
        {["All", "unpaid", "paid", "received"].map((t) => (
          <button
            key={t}
            onClick={() => setOrderTab(t)}
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              orderTab.toLowerCase() === t.toLowerCase()
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-4">
        {orders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 text-lg">
              No orders found
            </div>
          </div>
        )}
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded-xl p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              {order.product.mainImage && (
                <div className="flex-shrink-0">
                  <img
                    src={`http://localhost:5173/${order.product.mainImage}`}
                    alt={order.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer border dark:border-gray-700"
                    onClick={() => navigate(`/product/${order.product.id}`)}
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                  <div>
                    <h3
                      className="font-semibold text-lg cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => navigate(`/product/${order.product.id}`)}
                    >
                      {order.product.name}
                    </h3>
                    <div className="mt-1 text-gray-500 dark:text-gray-400">
                      Order ID: {order.id}
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-1">
                    <div className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
                      ${order.product.price.toFixed(2)}
                    </div>
                    <div className="flex gap-2">
                      {statusBadge(order.orderStatus)}
                      {order.receiveStatus && statusBadge(order.receiveStatus)}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex flex-wrap gap-2">
                  {order.orderStatus === "pending" && (
                    <button
                      onClick={() => payNow(order.id)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <HiOutlineCreditCard className="text-lg" />
                      Pay Now
                    </button>
                  )}

                  {order.orderStatus === "paid" && order.receiveStatus !== "received" && (
                    <button
                      onClick={() => confirmReceived(order.id)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <MdOutlineReceipt className="text-lg" />
                      Confirm Received
                    </button>
                  )}

                  {order.orderStatus === "paid" && order.receiveStatus === "received" && (
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                        <MdOutlineReceipt className="text-lg" />
                        Confirmed Received
                      </span>
                      <button
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                        onClick={() => openRatingModal(order.product)}
                      >
                        <FaStar className="text-yellow-300" />
                        Rate Product
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabs = () => {
    switch (tab) {
      case "posts":
        return (
          <div className="mt-6">
            <SellerProfile />
          </div>
        );
      case "orders":
        return renderOrderTabs();
      case "admin":
        return (
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">42</div>
              <div className="mt-2 text-gray-500 dark:text-gray-400">Total Orders</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-500">$1,284</div>
              <div className="mt-2 text-gray-500 dark:text-gray-400">Total Revenue</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-amber-500">87%</div>
              <div className="mt-2 text-gray-500 dark:text-gray-400">Conversion Rate</div>
            </div>
            <div className="md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Top Products</h3>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center justify-between border-b pb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                      <div>
                        <div className="font-medium">Product Name</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Category</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">ETB 129.99</div>
                      <div className="text-sm text-green-500">24 sold</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600 dark:text-indigo-400" />
      </div>
    );

  if (error) return <div className="text-center py-20 text-red-500 text-lg">{error}</div>;

  if (!user) return null;

  const userRole = user.role?.name;
  const isPrivilegedUser = ["seller", "admin", "manager"].includes(userRole);
  const tabs = [
    ...(isPrivilegedUser ? ["posts"] : []),
    "orders",
    ...(isPrivilegedUser ? ["admin"] : []),
  ];

  const tabIcons = {
    posts: <MdOutlineInventory className="text-lg" />,
    orders: <HiOutlineShoppingBag className="text-lg" />,
    admin: <MdDashboard className="text-lg" />,
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 px-4 sm:px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-10">
            <div className="flex items-start gap-5">
              <div className="relative">
                <FaUserCircle className="text-7xl text-indigo-600 dark:text-indigo-400" />
                <div className="absolute -bottom-2 -right-2 bg-indigo-500 text-white rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {userRole || "User"}
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{user.username}</h1>
                <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-300">
                  <span>{user.email}</span>
                  <button 
                    onClick={copyEmail} 
                    className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Copy email"
                  >
                    <FaCopy className="text-sm" />
                  </button>
                  {copySuccess && (
                    <span className="text-sm text-green-500 ml-1">{copySuccess}</span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm">
                    {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : "User"}
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">
                    24 Orders
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-sm transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <MdLightMode className="text-xl" /> : <MdDarkMode className="text-xl" />}
              </button>
              <button className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-700 mb-8">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 rounded-t-lg flex items-center gap-2 transition-colors ${
                  tab === t
                    ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-t border-l border-r border-gray-200 dark:border-gray-700 font-medium"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tabIcons[t]}
                {t === "admin" ? "Dashboard" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="mb-12">
            {renderTabs()}
          </div>
        </div>

        {/* Rating Modal */}
        <Modal
          isOpen={showModal}
          onRequestClose={closeRatingModal}
          contentLabel="Rate Product"
          className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl outline-none"
          overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          ariaHideApp={false}
        >
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <FaStar className="text-amber-400" />
              Rate {currentProduct?.name}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Share your experience with this product
            </p>
          </div>
          
          <div className="flex justify-center mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRatingValue(star)}
                className="p-2 focus:outline-none"
                aria-label={`Rate ${star} stars`}
              >
                <FaStar
                  className={`text-3xl transition-transform hover:scale-110 ${
                    star <= ratingValue ? "text-amber-400" : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </button>
            ))}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Feedback
              </label>
              <textarea
                placeholder="What did you like or dislike? Share details about your experience..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-700/50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                rows={4}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Add Photo (Optional)
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF (MAX. 5MB)</p>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setImageFile(e.target.files[0])} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={closeRatingModal}
              className="px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitRating}
              disabled={!ratingValue}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                ratingValue 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Submit Review
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}