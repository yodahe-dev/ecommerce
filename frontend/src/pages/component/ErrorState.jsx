import React from "react";
import { motion } from "framer-motion";
import { FiAlertCircle } from "react-icons/fi";

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

export default ErrorState;
