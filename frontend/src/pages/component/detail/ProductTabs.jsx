import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReviewsTab from "./review";

const ProductTabs = ({ 
  product, 
  productId, 
  reviews, 
  totalReviews, 
  reviewLoading 
}) => {
  const [activeTab, setActiveTab] = useState("details");
  
  const tabs = [
    { id: "details", label: "Product Details" },
    { id: "specs", label: "Technical Specs" },
    { id: "reviews", label: `Reviews (${totalReviews || 0})` }
  ];

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  // Parse specs safely
  const parsedSpecs = useMemo(() => {
    if (!product?.specs) return [];
    try {
      return Array.isArray(product.specs) 
        ? product.specs 
        : JSON.parse(product.specs || "[]");
    } catch (error) {
      console.error("Error parsing specs:", error);
      return [];
    }
  }, [product]);

  return (
    <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row gap-2 border-b border-gray-200 dark:border-gray-700 px-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "text-orange-600 dark:text-orange-400"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 dark:bg-orange-400"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={tabVariants}
            transition={{ duration: 0.25 }}
            className="p-6"
          >
            {activeTab === "details" && (
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                  Product Overview
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {product.description || "No product details available."}
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Technical Specifications
                </h3>
                {parsedSpecs.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {parsedSpecs.map((item, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-center rounded text-sm text-gray-800 dark:text-gray-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No specifications available.
                  </p>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                  Customer Reviews
                </h3>
                <ReviewsTab 
                  productId={productId} 
                  reviews={reviews} 
                  totalReviews={totalReviews}
                  loading={reviewLoading}
                />
              </div>
            )}

            {reviewLoading && (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default React.memo(ProductTabs);