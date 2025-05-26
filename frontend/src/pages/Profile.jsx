import React, { useState, useEffect } from "react";
import { FaUserCircle, FaSpinner, FaCopy, FaStar } from "react-icons/fa";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { getProfile } from "../api";

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
          // Show only orders with orderStatus exactly "pending"
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
          o.id === orderId
            ? { ...o, orderStatus: "expired", receiveStatus: "received" }
            : o
        )
      );
    } else {
      alert("Failed to confirm receipt");
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
    if (!ratingValue || !currentProduct) return alert("Please select a rating.");

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

  const renderOrderTabs = () => (
    <div className="mt-6">
      <div className="flex gap-4 border-b pb-2">
        {["All", "unpaid", "paid", "received"].map((t) => (
          <button
            key={t}
            onClick={() => setOrderTab(t)}
            className={`px-3 py-1 rounded ${
              orderTab === t
                ? "bg-indigo-600 text-white"
                : "text-gray-600 hover:text-indigo-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="mt-4 space-y-4">
        {orders.length === 0 && <div>No orders found</div>}
        {orders.map((order) => (
          <div
            key={order.id}
            className="border rounded p-4 bg-white dark:bg-gray-800 shadow"
          >
            <div className="flex justify-between items-center">
              <h3
                className="font-semibold text-lg cursor-pointer hover:underline"
                onClick={() => navigate(`/product/${order.product.id}`)}
              >
                {order.product.name}
              </h3>
              {order.product.mainImage && (
                <img
                  src={`http://localhost:5173/${order.product.mainImage}`}
                  alt=""
                  className="w-16 h-16 object-cover rounded cursor-pointer"
                  onClick={() => navigate(`/product/${order.product.id}`)}
                />
              )}
              <div className="ml-4 flex gap-2">
                <span className="px-2 py-1 rounded text-sm bg-gray-200">
                  {order.orderStatus}
                </span>
                <span className="px-2 py-1 rounded text-sm bg-gray-300">
                  {order.receiveStatus || "pending"}
                </span>
              </div>
            </div>
            <div className="mt-3">
              {order.orderStatus === "paid" && (
                <button
                  onClick={() => confirmReceived(order.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  Confirm Received
                </button>
              )}
              {order.orderStatus === "expired" && order.receiveStatus === "received" && (
                <div className="flex items-center gap-4">
                  <span className="text-green-600 font-semibold">Confirmed Received</span>
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => openRatingModal(order.product)}
                  >
                    Rate Product
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTabs = () => {
    switch (tab) {
      case "posts":
        return <div className="mt-6">User posts or listings</div>;
      case "orders":
        return renderOrderTabs();
      case "reviews":
        return <div className="mt-6">Give and manage reviews</div>;
      case "admin":
        return (
          <div className="mt-6 space-y-2">
            <div>Total orders: ...</div>
            <div>Most sold product: ...</div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin text-3xl text-indigo-600" />
      </div>
    );

  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  if (!user) return null;

  const userRole = user.role?.name;
  const isPrivilegedUser = ["seller", "admin", "manager"].includes(userRole);
  const tabs = [
    ...(isPrivilegedUser ? ["posts"] : []),
    "orders",
    "reviews",
    ...(isPrivilegedUser ? ["admin"] : []),
  ];

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-4 sm:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <FaUserCircle className="text-6xl text-indigo-600 dark:text-indigo-400" />
            <div>
              <h1 className="text-2xl font-semibold">{user.username}</h1>
              <div className="flex items-center gap-2 text-sm mt-1 text-gray-500 dark:text-gray-400">
                <span>{user.email}</span>
                <button onClick={copyEmail} title="Copy email">
                  <FaCopy />
                </button>
                {copySuccess && (
                  <span className="text-green-500 ml-2">{copySuccess}</span>
                )}
              </div>
              <div className="text-sm mt-1">
                Role: <span className="font-medium">{userRole || "N/A"}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            {darkMode ? <MdLightMode /> : <MdDarkMode />}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b pb-2 mb-6">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1 rounded ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              {t === "admin" ? "Dashboard" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        {renderTabs()}

        {/* Review Modal */}
        <Modal
          isOpen={showModal}
          onRequestClose={closeRatingModal}
          contentLabel="Rate Product"
          className="max-w-md mx-auto mt-24 p-6 bg-white rounded shadow-lg outline-none"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <h2 className="text-xl font-bold mb-4">Rate {currentProduct?.name}</h2>
          <div className="flex gap-1 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`cursor-pointer text-2xl ${
                  star <= ratingValue ? "text-yellow-400" : "text-gray-300"
                }`}
                onClick={() => setRatingValue(star)}
              />
            ))}
          </div>
          <textarea
            placeholder="Leave feedback (optional)"
            className="w-full border rounded p-2 mb-3"
            rows={3}
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <button onClick={closeRatingModal} className="px-3 py-1 bg-gray-300 rounded">
              Cancel
            </button>
            <button onClick={submitRating} className="px-3 py-1 bg-indigo-600 text-white rounded">
              Submit
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
