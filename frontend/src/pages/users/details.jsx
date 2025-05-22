import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence, LayoutGroup, useDragControls } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import ReactImageMagnify from "react-image-magnify";
import { 
  FiChevronLeft, 
  FiChevronRight, 
  FiHeart, 
  FiShare2, 
  FiTruck,
  FiShield,
  FiPlus,
  FiMinus,
  FiAlertCircle
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
            <div key={i} className="h-4 bg-gray-100 rounded-full animate-pulse" />
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
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const dragControls = useDragControls();
  const [activeTab, setActiveTab] = useState("details");

  useHotkeys("esc", () => navigate(-1));

  const fetchProduct = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/products/${id}`);
      setProduct(data);
    } catch (err) {
      setError("Failed to load product details. Please try again later.");
      toast.error("Failed to load product details");
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

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

  const toggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(!isWishlisted ? "Added to wishlist" : "Removed from wishlist");
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
                          width: 2000,
                          height: 2000,
                        },
                        enlargedImageContainerStyle: { zIndex: 50 },
                        lensStyle: {
                          backgroundColor: "rgba(255,255,255,0.2)",
                          cursor: "zoom-in",
                        },
                        imageStyle: { transition: "transform 0.3s ease-out" },
                      }}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation("prev")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black transition-all"
                  >
                    <FiChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => handleImageNavigation("next")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black transition-all"
                  >
                    <FiChevronRight size={20} />
                  </button>
                </>
              )}

              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={toggleWishlist}
                  className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <FiHeart
                    size={20}
                    className={isWishlisted ? "text-red-500 fill-current" : "text-gray-800"}
                  />
                </button>
                <button
                  onClick={shareProduct}
                  className="p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                >
                  <FiShare2 size={20} className="text-gray-800" />
                </button>
              </div>
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((src, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    whileHover={{ scale: 1.05 }}
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
                      loading="lazy"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="space-y-6 sticky top-8">
            <div className="flex items-start justify-between">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">{product.name}</h1>
            </div>

            <PriceDisplay price={product.price} lastPrice={product.lastPrice} />

            {product.condition && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">Condition</span>
                <span className="font-medium capitalize">{product.condition}</span>
               
              </div>
            )}
            {/* on next version will be available this is mvp so no need on the vesion*/}
            {/* <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full dark:bg-gray-800">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 hover:bg-gray-200 rounded-full dark:hover:bg-gray-900"
                >
                  <FiMinus size={18} />
                </button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1 hover:bg-gray-200 rounded-full dark:hover:bg-gray-900"
                >
                  <FiPlus size={18} />
                </button>
              </div>
              <span className="text-sm text-gray-500 dark:text-white">
                {product.stock} items available
              </span>
            </div> */}

            <div className="flex gap-4">
              <button
                onClick={handleBuyNow}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-lg font-medium transition-transform hover:scale-[1.02] active:scale-95"
              >
                Buy Now
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3 dark:bg-gray-800">
                <FiTruck className="text-orange-500 text-2xl" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-gray-500">Delivery in 3-5 days</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3 dark:bg-gray-800">
                <TbArrowsExchange className="text-orange-500 text-2xl" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-sm text-gray-500">-day return policy</p>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <div className="flex gap-6">
                {["details", "specs", "reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 px-1 capitalize ${
                      activeTab === tab
                        ? "border-b-2 border-orange-500 font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {activeTab === "details" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              )}

            {activeTab === "specs" && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-4"
  >
    {Array.isArray(product.specs) && product.specs.length > 0 ? (
      <div>
        <h3 className="text-lg font-semibold mb-3">Available Options</h3>
        <ul className="flex flex-wrap gap-3">
          {product.specs.map((item, idx) => (
            <li
              key={idx}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 cursor-pointer hover:bg-orange-500 hover:text-white transition"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <p className="text-gray-500 italic">No specifications available.</p>
    )}
  </motion.div>
)}


              {activeTab === "reviews" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {product.reviews?.map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="font-medium text-orange-500">
                            {review.author[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{review.author}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`${
                                  i < review.rating
                                    ? "text-orange-500"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </LayoutGroup>
    </motion.div>
  );
}
