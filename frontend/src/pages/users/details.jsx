import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import ReactImageMagnify from "react-image-magnify";
import { FiHeart, FiShare2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { FaHeart, FaTruck, FaShieldAlt, FaShoppingCart } from "react-icons/fa";

const API = "http://localhost:5000/api";

const imageVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

const PriceDisplay = React.memo(({ price, lastPrice }) => {
  const [flip, setFlip] = useState(false);
  useEffect(() => {
    if (price !== lastPrice) setFlip(f => !f);
  }, [price]);
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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useHotkeys("esc", () => navigate(-1));

  useEffect(() => {
    axios
      .get(`${API}/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => setError("Failed to load product."));
  }, [id]);

  // Combine main image + extraImages into one array
  const images = useMemo(() => {
    if (!product) return [];
    const main = product.imageUrl ? [product.imageUrl] : [];
    const extras = Array.isArray(product.extraImages)
      ? product.extraImages
      : [];
    return [...main, ...extras];
  }, [product]);

  const handleNextImage = useCallback(() => {
    setSelectedImage(i => (i + 1) % images.length);
  }, [images.length]);

  const handlePreviousImage = useCallback(() => {
    setSelectedImage(i => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const handleBuyNow = () => navigate(`/checkout/${id}?quantity=${quantity}`);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!product) return <p>Loading...</p>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-4 md:p-8"
    >
      <LayoutGroup>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-6">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={imageVariants}
                  transition={{ duration: 0.2 }}
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
                        width: 2400,
                        height: 2400,
                      },
                      enlargedImageContainerStyle: { zIndex: 50 },
                      lensStyle: { backgroundColor: "rgba(255,255,255,0.2)" },
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePreviousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
                  >
                    <FiChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full"
                  >
                    <FiChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 ${
                      idx === selectedImage
                        ? "border-orange-500"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={src}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6 sticky top-8">
            <h1 className="text-4xl font-bold">{product.name}</h1>
            <PriceDisplay price={product.price} lastPrice={product.lastPrice} />
            <p className="text-gray-700">{product.description}</p>
            <div className="flex gap-4">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-orange-500 text-white py-3 rounded"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </LayoutGroup>
    </motion.div>
  );
}
