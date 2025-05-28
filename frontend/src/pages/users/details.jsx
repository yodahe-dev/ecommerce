import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, LayoutGroup, useDragControls } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { toast } from "react-toastify";

import ProductActions from "../component/ProductActions";
import ProductTabs from "../component/ProductTabs";
import ImageGallery from "../component/ImageGallery";
import ErrorState from "../component/ErrorState";
import LoadingSkeleton from "../component/LoadingSkeleton";
import PriceDisplay from "../component/PriceDisplay";

const API = "http://localhost:5000/api";
const BASE_URL = "http://localhost:5173";

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
          <ImageGallery
            images={images}
            selectedImage={selectedImage}
            setSelectedImage={setSelectedImage}
            dragControls={dragControls}
            handleDrag={handleDrag}
            handleImageNavigation={handleImageNavigation}
            productName={product.name}
          />

          {/* Details Section */}
          <div className="space-y-6">
            <h1 className="text-3xl font-semibold">{product.name}</h1>

            <PriceDisplay price={product.price} lastPrice={product.lastPrice} />

            <ProductActions
              isWishlisted={isWishlisted}
              toggleWishlists={toggleWishlists}
              shareProduct={shareProduct}
              handleBuyNow={handleBuyNow}
              totalWishlist={10} // Update if you have real data
            />

            <ProductTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              product={product}
              productId={id}
            />
          </div>
        </div>
      </LayoutGroup>
    </motion.div>
  );
}
