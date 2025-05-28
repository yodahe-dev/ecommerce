import React from "react";
import { motion } from "framer-motion";

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

export default LoadingSkeleton;
