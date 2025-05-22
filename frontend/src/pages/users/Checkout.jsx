import React, { useState, useEffect } from "react";

const Checkout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [deliveryAllowed, setDeliveryAllowed] = useState(false);
  const [message, setMessage] = useState("");

  // Reverse geocode function using OpenStreetMap
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
      alert("Geolocation is not supported by your browser");
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
          setMessage("Delivery is coming soon in your area.");
        } else {
          setDeliveryAllowed(true);
          setMessage("");
        }

        setAddress(addr);
        setLoadingLocation(false);
      },
      () => {
        alert("Failed to get location");
        setLoadingLocation(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone) {
      alert("Phone number is required");
      return;
    }
    if (!deliveryAllowed) {
      alert("Delivery not available in your area");
      return;
    }
    // submit the order or continue checkout flow here
    alert("Order placed!");
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 py-8 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Checkout</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700"
          >
            {darkMode ? "Light" : "Dark"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium" htmlFor="phone">
              Phone number <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 9xx xxx xxx"
              required
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="email">
              Email (optional)
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium" htmlFor="address">
              Address <span className="text-red-500">*</span>
            </label>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your delivery address"
              rows={3}
              required
              className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <button
            type="button"
            onClick={shareLocation}
            disabled={loadingLocation}
            className="w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:bg-blue-400"
          >
            {loadingLocation ? "Getting Location..." : "Use My Current Location"}
          </button>

          {coords && (
            <div className="text-sm mt-2">
              <strong>Coordinates:</strong> {coords.lat.toFixed(4)},{" "}
              {coords.lng.toFixed(4)}
            </div>
          )}

          {message && (
            <div className="mt-3 text-center text-red-500 font-medium">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={!deliveryAllowed}
            className={`w-full py-2 rounded font-semibold ${
              deliveryAllowed
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-gray-400 cursor-not-allowed text-gray-700"
            }`}
          >
            Place Order
          </button>
        </form>

        {!deliveryAllowed && address && (
          <p className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            Delivery available only in Addis Ababa.
          </p>
        )}
      </div>
    </div>
  );
};

export default Checkout;
