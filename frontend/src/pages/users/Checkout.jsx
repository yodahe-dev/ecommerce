import React, { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

// Convert decimal degrees to DMS string
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

// Simple phone validator for Ethiopia: starts with 9 and 9 digits total
const isValidPhone = (phone) => /^9\d{8}$/.test(phone);

const Checkout = () => {
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

  const userId = localStorage.getItem("user_id") || "";

  useEffect(() => {
    const url = window.location.href;
    const match = url.match(/\/checkout\/([a-zA-Z0-9\-]+)/);
    if (match && match[1]) {
      const id = match[1];
      setProductId(id);
      fetch(`${API}/products/${id}`)
        .then((res) => res.json())
        .then(setProduct)
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

    const payload = {
      userId,
      productId,
      productName: product?.name,
      amount: product?.price,
      phone,
      address,
      notes,
      additionalphone: receiverPhone,
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
        alert("Payment failed: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Payment error");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !isValidPhone(phone) ||
      !isValidPhone(receiverPhone) ||
      !deliveryAllowed ||
      !address
    )
      return;
    makePayment();
  };

  const isFormValid =
    isValidPhone(phone) && isValidPhone(receiverPhone) && deliveryAllowed && address;

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-100 dark:bg-gray-900 flex justify-center items-start">
      <div className="w-full max-w-xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">
          Complete Your Order
        </h2>

        {product && (
          <div className="mb-6 text-center">
            <img
              src={product.imageUrl || "https://via.placeholder.com/300"}
              alt={product.name}
              className="mx-auto rounded shadow h-48 object-cover"
            />
            <h3 className="text-xl font-semibold mt-3 text-gray-900 dark:text-gray-100">
              {product.name}
            </h3>
            <p className="text-lg text-green-700 dark:text-green-400">
              Price: {product.price} ETB
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 font-medium text-gray-800 dark:text-gray-200">
              Your Telbirr Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="9XXXXXXXX"
              required
              className={`w-full p-2 bg-transparent rounded border ${
                isValidPhone(phone)
                  ? "border-green-500"
                  : "border-red-500"
              } focus:outline-none`}
            />
            {!isValidPhone(phone) && phone.length > 0 && (
              <p className="text-red-600 text-sm mt-1">
                Enter valid Ethiopian phone starting with 9, 9 digits total
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-800 dark:text-gray-200">
              Receiver's Phone Number
            </label>
            <input
              type="tel"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              placeholder="9XXXXXXXX"
              required
              className={`bg-transparent w-full p-2 rounded border ${
                isValidPhone(receiverPhone)
                  ? "border-green-500"
                  : "border-red-500"
              } focus:outline-none`}
            />
            {!isValidPhone(receiverPhone) && receiverPhone.length > 0 && (
              <p className="text-red-600 text-sm mt-1">
                Enter valid Ethiopian phone starting with 9, 9 digits total
              </p>
            )}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-800 dark:text-gray-200">
              Order Notes (optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputNote}
                onChange={(e) => setInputNote(e.target.value)}
                placeholder="Add a note"
                className="bg-transparent flex-1 p-2 rounded border focus:outline-none"
              />
              <button
                type="button"
                onClick={addNote}
                disabled={!inputNote.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-blue-300"
              >
                Add
              </button>
            </div>
            {notes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {notes.map((n) => (
                  <div
                    key={n}
                    className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 flex items-center gap-2"
                  >
                    <span>{n}</span>
                    <button
                      type="button"
                      onClick={() => removeNote(n)}
                      className="text-red-600 dark:text-red-400 font-bold"
                      aria-label={`Remove note ${n}`}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={shareLocation}
            disabled={loadingLocation}
            className="w-full py-2 rounded bg-indigo-600 text-white font-semibold disabled:bg-indigo-400"
          >
            {loadingLocation ? "Locating..." : "Use My Current Location"}
          </button>

          {coords && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded border text-gray-700 dark:text-gray-200">
              <p>
                Latitude: {coords.lat.toFixed(6)} / {decimalToDMS(coords.lat, "lat")}
              </p>
              <p>
                Longitude: {coords.lng.toFixed(6)} / {decimalToDMS(coords.lng, "lng")}
              </p>
              <p className="mt-1 italic text-sm">{address}</p>
            </div>
          )}

          {message && (
            <div className="text-red-600 font-semibold text-center mt-2">{message}</div>
          )}

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-3 rounded font-semibold mt-4 ${
              isFormValid ? "bg-green-600 text-white" : "bg-gray-400 text-gray-700 cursor-not-allowed"
            }`}
          >
            Pay Now
          </button>
        </form>

        {!deliveryAllowed && address && (
          <p className="text-center text-gray-500 mt-6 text-sm dark:text-gray-400">
            Delivery available only in Addis Ababa.<br />More cities coming soon.
          </p>
        )}
      </div>
    </div>
  );
};

export default Checkout;
