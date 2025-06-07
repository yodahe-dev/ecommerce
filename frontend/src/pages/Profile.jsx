import { useState, useEffect, useRef, Fragment } from "react";
import { FaUserCircle, FaSpinner, FaCopy, FaStar } from "react-icons/fa";
import { 
  MdDarkMode, 
  MdLightMode, 
  MdOutlineInventory, 
  MdOutlineReceipt, 
  MdDashboard,
  MdClose
} from "react-icons/md";
import { HiOutlineShoppingBag, HiOutlineCreditCard } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { getProfile } from "../api";
import SellerProfile from "./component/profile/Post";

const API = "http://localhost:5000/api";

export default function Profile({ token, darkMode, setDarkMode }) {
  const [user, setUser] = useState(null);
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
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: "",
    bio: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
    shopName: ""
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [editError, setEditError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const avatarInputRef = useRef(null);
  const navigate = useNavigate();
  const [tab, setTab] = useState("orders");

  useEffect(() => {
    if (user) {
      if (user.role?.name === "seller") {
        setTab("posts");
      } else {
        setTab("orders");
      }
    }
  }, [user]);

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
          setEditFormData({
            username: res.username,
            bio: res.bio || "",
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
            shopName: res.shopName || ""
          });
          setAvatarPreview(
            res.avatarUrl 
              ? `${API}${res.avatarUrl}` 
              : null
          );
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
      const res = await fetch(`${API}/pay/${orderId}`, {
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

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerAvatarInput = () => {
    avatarInputRef.current.click();
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    setIsUpdating(true);
    
    if (editFormData.newPassword && editFormData.newPassword !== editFormData.confirmPassword) {
      setEditError("New passwords do not match");
      setIsUpdating(false);
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("username", editFormData.username);
      formData.append("bio", editFormData.bio);
      
      if (editFormData.oldPassword) 
        formData.append("oldPassword", editFormData.oldPassword);
      
      if (editFormData.newPassword) 
        formData.append("newPassword", editFormData.newPassword);
      
      if (avatarInputRef.current.files[0]) 
        formData.append("avatar", avatarInputRef.current.files[0]);
      
      if (user.role?.name === "seller") 
        formData.append("shopName", editFormData.shopName || "");
      
      // FIXED: Correct endpoint to match backend
      const res = await fetch(`${API}/users/profileUpadte`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        
        // Update avatar preview with new URL
        const newAvatar = updatedUser.avatarUrl 
          ? `${API}${updatedUser.avatarUrl}`
          : null;
        
        setUser(updatedUser);
        setAvatarPreview(newAvatar);
        setShowEditProfileModal(false);
        alert("Profile updated successfully!");
      } else {
        const error = await res.json();
        setEditError(error.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      setEditError("Network error. Please try again later.");
    } finally {
      setIsUpdating(false);
    }
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
              {order.product.imageUrl ? (
                <div className="flex-shrink-0">
                  <img
                    src={order.product.imageUrl}
                    alt={order.product.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg cursor-pointer border dark:border-gray-700"
                    onClick={() => navigate(`/product/${order.product.id}`)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.parentNode.innerHTML = `
                        <div class="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg border dark:border-gray-700">
                          <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                      `;
                    }}
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 flex items-center justify-center rounded-lg border dark:border-gray-700">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"></path>
                  </svg>
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
                      {order.product.price} ETB
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
       return "admin"
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
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt="Avatar" 
                    className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500"
                  />
                ) : (
                  <FaUserCircle className="text-7xl text-indigo-600 dark:text-indigo-400" />
                )}
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
                {user.bio && (
                  <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-lg">
                    {user.bio}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm">
                    {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : "User"}
                  </div>
                  {user.shopName && (
                    <div className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm">
                      {user.shopName}
                    </div>
                  )}
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
        <Transition appear show={showModal} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={closeRatingModal}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-bold leading-6 text-gray-900 dark:text-white flex items-center gap-2"
                      >
                        <FaStar className="text-amber-400" />
                        Rate {currentProduct?.name}
                      </Dialog.Title>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                        onClick={closeRatingModal}
                      >
                        <MdClose className="h-6 w-6" />
                      </button>
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
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
}