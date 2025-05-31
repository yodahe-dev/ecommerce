import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, LayoutGroup } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "react-toastify";

import ProductActions from "../component/detail/ProductActions";
import ProductTabs from "../component/detail/ProductTabs";
import ImageGallery from "../component/detail/ImageGallery";
import ErrorState from "../component/ErrorState";
import LoadingSkeleton from "../component/detail/LoadingSkeleton";
import PriceDisplay from "../component/detail/PriceDisplay";

const API = "http://localhost:5000/api";
const BASE_URL = "http://localhost:5173";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [soldCount, setSoldCount] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalWish, setTotalWish] = useState(0);
  const [activeTab, setActiveTab] = useState("details");
  const [reviewLoading, setReviewLoading] = useState(true);

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

  const fetchSoldCount = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/product/${id}/sold-count`);
      setSoldCount(data.soldCount || 0);
    } catch {
      setSoldCount(0);
    }
  }, [id]);

  // Unified review fetching function
  const fetchReviewData = useCallback(async () => {
    setReviewLoading(true);
    try {
      // Get full reviews
      const reviewsResponse = await axios.get(`${API}/rating/${id}`);
      setReviews(reviewsResponse.data.reviews || []);
      setTotalReviews(reviewsResponse.data.totalRatings || 0);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast.error("Failed to load reviews");
      setReviews([]);
      setTotalReviews(0);
    } finally {
      setReviewLoading(false);
    }
  }, [id]);

  const checkIfLiked = useCallback(async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) return setIsWishlisted(false);
      
      const { data } = await axios.post(`${API}/isLiked`, {
        userId,
        productId: id,
      });
      setIsWishlisted(data.liked);
    } catch {
      setIsWishlisted(false);
    }
  }, [id]);

  const fetchTotalLikes = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/totalLike/${id}`);
      setTotalWish(data.totalLikes || 0);
    } catch {
      setTotalWish(0);
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.allSettled([
        fetchProduct(),
        fetchTotalLikes(),
        fetchSoldCount(),
        fetchReviewData(),
      ]);
      await checkIfLiked();
    };

    fetchData();
  }, [
    id,
    fetchProduct,
    fetchTotalLikes,
    fetchSoldCount,
    fetchReviewData,
    checkIfLiked
  ]);

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
    (_, info) => {
      if (info.offset.x > 50) handleImageNavigation("prev");
      if (info.offset.x < -50) handleImageNavigation("next");
    },
    [handleImageNavigation]
  );

  const handleBuyNow = () => navigate(`/checkout/${id}`);

  const toggleWishlists = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        toast.error("Please login first");
        return;
      }

      const url = isWishlisted ? `${API}/unlike` : `${API}/like`;
      const { data } = await axios.post(url, { userId, productId: id });

      setIsWishlisted(!isWishlisted);
      setTotalWish(data.totalLikes);
      toast.success(
        isWishlisted ? "Removed from wishlist" : "Added to wishlist"
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error");
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
          <ImageGallery
            images={images}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            handleDrag={handleDrag}
            handleImageNavigation={handleImageNavigation}
            productName={product.name}
          />

          <div className="space-y-6">
            <h1 className="text-3xl font-semibold">{product.name}</h1>
            <PriceDisplay price={product.price} lastPrice={product.lastPrice} />

            <ProductActions
              isWishlisted={isWishlisted}
              toggleWishlists={toggleWishlists}
              shareProduct={shareProduct}
              handleBuyNow={handleBuyNow}
              totalWish={totalWish}
              totalSold={soldCount}
              totalReviews={totalReviews}
              productId={id}
            />

            <ProductTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              product={product}
              productId={id}
              reviews={reviews}
              totalReviews={totalReviews}
              reviewLoading={reviewLoading}
            />
          </div>
        </div>
      </LayoutGroup>
    </motion.div>
  );
}