import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  motion,
  AnimatePresence,
  LayoutGroup,
  useDragControls,
} from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import ReactImageMagnify from "react-image-magnify";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiShare2,
  FiTruck,
  FiAlertCircle,
} from "react-icons/fi";
import { TbArrowsExchange } from "react-icons/tb";
import { toast } from "react-toastify";

const API = "http://localhost:5000/api";
const BASE_URL = "http://localhost:5173";

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const PriceDisplay = React.memo(({ price, lastPrice }) => {
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    if (price !== lastPrice) setFlip((f) => !f);
  }, [price, lastPrice]);

  const discount = lastPrice
    ? Math.round(((lastPrice - price) / lastPrice) * 100)
    : 0;

  return (
    <div className="flex items-center gap-3 mb-4 relative">
      <motion.div
        animate={{ rotateX: flip ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        className="origin-center"
      >
        <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "ETB",
          }).format(price)}
        </div>
      </motion.div>
      {lastPrice && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <p className="text-gray-500 line-through text-lg">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "ETB",
            }).format(lastPrice)}
          </p>
          <span className="absolute -top-4 right-0 text-xs bg-red-500 text-white px-2 py-1 rounded-full">
            {discount}% OFF
          </span>
        </motion.div>
      )}
    </div>
  );
});

const LoadingSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="max-w-7xl mx-auto p-4 md:p-8"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div className="aspect-[4/5] h-[600px] bg-gray-100 rounded-3xl animate-pulse" />
      </div>
      <div className="space-y-6">
        <div className="h-12 bg-gray-100 rounded-full w-3/4 animate-pulse" />
        <div className="h-8 bg-gray-100 rounded-full w-1/2 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-4 bg-gray-100 rounded-full animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

const ErrorState = ({ error, retry }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-7xl mx-auto p-8 text-center"
  >
    <div className="max-w-md mx-auto space-y-4">
      <FiAlertCircle className="text-red-500 text-5xl mx-auto" />
      <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
      <p className="text-gray-600">{error}</p>
      <button
        onClick={retry}
        className="mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  </motion.div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dragControls = useDragControls();
  const [activeTab, setActiveTab] = useState("details");

  useHotkeys("esc", () => navigate(-1));

  const fetchProduct = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/products/${id}`);
      setProduct(data);
      setError("");
    } catch (err) {
      setError("Failed to load product details. Please try again later.");
      toast.error("Failed to load product details");
    }
  }, [id]);

  // Check if product is liked by user on load
  const checkIfLiked = useCallback(async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      const { data } = await axios.post(`${API}/isLiked`, {
        userId,
        productId: id,
      });
      setIsWishlisted(data.liked);
    } catch {
      // ignore error here
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
    checkIfLiked();
  }, [fetchProduct, checkIfLiked]);

  const parsedExtraImages = useMemo(() => {
    if (!product) return [];
    try {
      const imagesArray = Array.isArray(product.extraImages)
        ? product.extraImages
        : JSON.parse(product.extraImages || "[]");
      return imagesArray.map((img) =>
        img.startsWith("http") ? img : `${BASE_URL}${img}`
      );
    } catch {
      return [];
    }
  }, [product]);

  const images = useMemo(() => {
    if (!product) return [];
    const main = product.imageUrl
      ? [
          product.imageUrl.startsWith("http")
            ? product.imageUrl
            : `${BASE_URL}${product.imageUrl}`,
        ]
      : [];
    return [...main, ...parsedExtraImages];
  }, [product, parsedExtraImages]);

  const handleImageNavigation = useCallback(
    (direction) => {
      setSelectedImage((prev) =>
        direction === "next"
          ? (prev + 1) % images.length
          : (prev - 1 + images.length) % images.length
      );
    },
    [images.length]
  );

  const handleDrag = useCallback(
    (event, info) => {
      if (info.offset.x > 50) handleImageNavigation("prev");
      if (info.offset.x < -50) handleImageNavigation("next");
    },
    [handleImageNavigation]
  );

  const handleBuyNow = () => {
    navigate(`/checkout/${id}`);
  };

  const toggleWishlists = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        toast.error("Please login first");
        return;
      }
      const url = isWishlisted ? `${API}/unlike` : `${API}/like`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId: id }),
      });

      if (!response.ok) {
        const err = await response.json();
        toast.error(err.message || "Something went wrong");
      } else {
        setIsWishlisted(!isWishlisted);
        toast.success(
          isWishlisted ? "Removed from wishlist" : "Added to wishlist"
        );
      }
    } catch (error) {
      toast.error("Server error");
    }
  };

  const shareProduct = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Product link copied to clipboard!");
  };

  if (error) return <ErrorState error={error} retry={fetchProduct} />;
  if (!product) return <LoadingSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 md:p-8"
    >
      <LayoutGroup>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery Section */}
          <div className="space-y-6">
            <div className="relative max-h-[600px] object-contain rounded-3xl overflow-hidden shadow-2xl dark:bg-slate-900 bg-white">
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDrag}
                dragControls={dragControls}
                className="w-full h-full cursor-grab active:cursor-grabbing"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedImage}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={imageVariants}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <ReactImageMagnify
                      {...{
                        smallImage: {
                          alt: product.name,
                          isFluidWidth: true,
                          src: images[selectedImage],
                        },
                        largeImage: {
                          src: images[selectedImage],
                          width: 1200,
                          height: 1800,
                        },
                        lensStyle: { backgroundColor: "rgba(0,0,0,.3)" },
                        enlargedImageContainerStyle: { zIndex: 9999 },
                        shouldUsePositiveSpaceLens: true,
                        enlargedImagePosition: "over",
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              <button
                className="absolute top-1/2 left-4 bg-white/80 rounded-full p-1 shadow-lg hover:bg-white dark:bg-black/60 dark:hover:bg-black"
                aria-label="Previous Image"
                onClick={() => handleImageNavigation("prev")}
              >
                <FiChevronLeft size={24} />
              </button>
              <button
                className="absolute top-1/2 right-4 bg-white/80 rounded-full p-1 shadow-lg hover:bg-white dark:bg-black/60 dark:hover:bg-black"
                aria-label="Next Image"
                onClick={() => handleImageNavigation("next")}
              >
                <FiChevronRight size={24} />
              </button>

              <div className="flex justify-center gap-3 mt-4 overflow-x-auto px-4">
                {images.map((img, i) => (
                  <motion.img
                    key={img}
                    src={img}
                    alt={`Thumbnail ${i + 1}`}
                    className={`w-16 h-16 rounded-xl object-cover cursor-pointer ${
                      selectedImage === i ? "ring-4 ring-orange-400" : ""
                    }`}
                    onClick={() => setSelectedImage(i)}
                    whileHover={{ scale: 1.05 }}
                    layoutId={`thumbnail-${i}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold">{product.name}</h1>

            <PriceDisplay price={product.price} lastPrice={product.lastPrice} />

            <div className="flex items-center gap-4">
              <button
                aria-label="Toggle Wishlist"
                onClick={toggleWishlists}
                className="rounded-lg border border-orange-400 p-3 flex items-center gap-2 text-orange-500 hover:bg-orange-100 transition"
              >
                <FiHeart
                  size={20}
                  className={isWishlisted ? "fill-orange-500 text-orange-600" : ""}
                />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
              <button
                aria-label="Share Product"
                onClick={shareProduct}
                className="rounded-lg border border-gray-300 p-3 flex items-center gap-2 hover:bg-gray-100 transition"
              >
                <FiShare2 size={20} />
                Share
              </button>
            </div>

            <div className="flex flex-wrap gap-4 items-center text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <FiTruck />
                <span>Free Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <TbArrowsExchange />
                <span>30 Days Return</span>
              </div>
            </div>

            <div>
              <div className="flex gap-6 border-b border-gray-300">
                <button
                  onClick={() => setActiveTab("details")}
                  className={`pb-2 ${
                    activeTab === "details"
                      ? "border-b-2 border-orange-500 font-semibold text-orange-500"
                      : "text-gray-500"
                  }`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`pb-2 ${
                    activeTab === "reviews"
                      ? "border-b-2 border-orange-500 font-semibold text-orange-500"
                      : "text-gray-500"
                  }`}
                >
                  Reviews
                </button>
              </div>
              <div className="pt-4 text-gray-700 max-h-64 overflow-y-auto">
                {activeTab === "details" && (
                  <p>{product.description || "No details available."}</p>
                )}
                {activeTab === "reviews" && (
                  <p>No reviews yet.</p>
                )}
              </div>
            </div>

            <button
              onClick={handleBuyNow}
              className="mt-6 w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
            >
              Buy Now
            </button>
          </div>
        </div>
      </LayoutGroup>
    </motion.div>
  );
}
