import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PriceDisplay = ({ price, lastPrice }) => {
  const [flip, setFlip] = useState(false);
  const [pricePulse, setPricePulse] = useState(false);

  useEffect(() => {
    if (price !== lastPrice) {
      setFlip(f => !f);
      setPricePulse(true);
      const timeout = setTimeout(() => setPricePulse(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [price, lastPrice]);

  const discount = lastPrice 
    ? Math.round(((lastPrice - price) / lastPrice) * 100)
    : 0;

  return (
    <motion.div 
      className="flex flex-col space-y-2 md:flex-row md:items-center md:space-y-0 md:gap-4 relative group"
      initial={false}
      animate={flip ? "flipped" : "normal"}
      variants={{
        flipped: { rotateX: 360 },
        normal: { rotateX: 0 }
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Current Price */}
      <motion.div
        className="relative overflow-hidden"
        animate={pricePulse ? "pulse" : "normal"}
        variants={{
          pulse: { 
            scale: 1.05,
            color: ["#ff3c00", "#ff6d00", "#ff3c00"]
          },
          normal: { scale: 1 }
        }}
      >
        <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-orange-500 via-red-500 to-amber-500 bg-clip-text text-transparent 
                       bg-[length:200%_auto] animate-gradient-shimmer">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "ETB",
          }).format(price)}
        </div>
        
        {/* Animated price change indicator */}
        {pricePulse && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-4 right-0 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full"
          >
            Updated
          </motion.span>
        )}
      </motion.div>

      {/* Original Price & Discount */}
      {lastPrice && (
        <motion.div 
          className="relative flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <p className="text-gray-500 dark:text-gray-400 line-through text-lg md:text-xl font-medium">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "ETB",
            }).format(lastPrice)}
          </p>
          
          <motion.span
            className="text-xs md:text-sm font-bold bg-gradient-to-br from-red-600 to-amber-600 text-white px-3 py-1 rounded-full 
                      shadow-lg hover:shadow-red-200/40 dark:hover:shadow-red-900/20 transition-shadow duration-200 cursor-help"
            title={`You save ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "ETB",
            }).format(lastPrice - price)}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {discount}% OFF
            {/* Animated sparkles */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-sparkle"
                  style={{
                    top: Math.random() * 100 + '%',
                    left: Math.random() * 100 + '%',
                    width: '2px',
                    height: '2px',
                    background: 'rgba(255,255,255,0.8)',
                    transform: 'rotate(45deg)'
                  }}
                />
              ))}
            </div>
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default React.memo(PriceDisplay);