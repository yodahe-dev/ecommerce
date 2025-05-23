import React, { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

const Checkout = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [deliveryAllowed, setDeliveryAllowed] = useState(false);
  const [message, setMessage] = useState("");

  const [notes, setNotes] = useState([]);
  const [inputNote, setInputNote] = useState("");

  // Product info
  const [productId, setProductId] = useState(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState(0);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [productError, setProductError] = useState("");

  // Get userId from localStorage
  const userId = localStorage.getItem("user_id") || "";

  useEffect(() => {
    const url = window.location.href;
    const match = url.match(/\/checkout\/([a-zA-Z0-9\-]+)/);
    if (match && match[1]) {
      const id = match[1];
      setProductId(id);

      setLoadingProduct(true);
      fetch(`${API}/products/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch product");
          return res.json();
        })
        .then((data) => {
          setProductName(data.name || "Unknown Product");
          setProductPrice(data.price || 0);
          setLoadingProduct(false);
        })
        .catch(() => {
          setProductName("Unknown Product");
          setProductPrice(0);
          setProductError("Failed to load product data");
          setLoadingProduct(false);
        });
    }
  }, []);

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

  const makePayment = async () => {
    if (!productId) return alert("Product not selected");
    if (!userId) return alert("User not logged in");

    const payload = {
      userId,
      productId,
      productName,
      amount: productPrice,
      phone,
      email,
      address,
      notes,
    };

    try {
      const res = await fetch(`${API}/payment/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert("Payment initiation failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      alert("Error starting payment");
      console.error(error);
    }
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
    makePayment();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full rounded-lg shadow-md p-6 bg-gray-300 dark:bg-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Checkout</h2>
        </div>

        {loadingProduct && <p>Loading product...</p>}
        {productError && <p className="text-red-600">{productError}</p>}

        {!loadingProduct && !productError && productName && (
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold">{productName}</h3>
            <p className="text-lg">Price: {productPrice} ETB</p>
          </div>
        )}

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
              Email Receiver (optional)
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
            <label className="block mb-1 font-medium">Order Notes (optional)</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {notes.map((note) => (
                <span
                  key={note}
                  className="bg-gray-200 dark:bg-gray-600 text-sm px-2 py-1 rounded-full flex items-center"
                >
                  {note}
                  <button
                    type="button"
                    onClick={() => removeNote(note)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                placeholder="e.g. black, size XL, no onions"
                className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <button
                type="button"
                onClick={addNote}
                className="px-4 py-2 bg-gray-600 text-white rounded"
              >
                Add
              </button>
            </div>
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
              <strong>Coordinates:</strong> {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
            </div>
          )}

          {message && (
            <div className="mt-3 text-center text-red-500 font-medium">{message}</div>
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
            Pay Now
          </button>
        </form>

        {!deliveryAllowed && address && (
          <p className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            Delivery available only in Addis Ababa <br /> (coming soon in all Ethiopian regions).
          </p>
        )}
      </div>
    </div>
  );
};

export default Checkout;
