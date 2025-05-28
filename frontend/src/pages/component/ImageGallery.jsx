import React, { useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from "react-icons/fi";

const imageVariants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.02 }
};

const ImageGallery = ({
  images,
  selectedImage,
  setSelectedImage,
  handleImageNavigation,
  handleDrag,
  dragControls,
  productName,
}) => {
  const [scale, setScale] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const handleThumbnailScroll = useCallback((index) => {
    const container = document.getElementById('thumbnails-container');
    const thumbnail = document.getElementById(`thumbnail-${index}`);
    if (container && thumbnail) {
      const { offsetLeft: thumbLeft, clientWidth: thumbWidth } = thumbnail;
      const containerWidth = container.clientWidth;
      const scrollTo = thumbLeft - (containerWidth - thumbWidth) / 2;
      container.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }, []);

  const zoomIn = () => {
    setScale(s => {
      const newScale = Math.min(s + 0.5, 3);
      centerImage(newScale);
      return newScale;
    });
  };

  const zoomOut = () => {
    setScale(s => {
      const newScale = Math.max(s - 0.5, 1);
      centerImage(newScale);
      return newScale;
    });
  };

  const centerImage = (newScale) => {
    if (!containerRef.current || !imageRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();
    
    const offsetX = (containerRect.width - imageRect.width * newScale) / 2;
    const offsetY = (containerRect.height - imageRect.height * newScale) / 2;
    
    setPosition({
      x: offsetX,
      y: offsetY
    });
  };

  const handleDragImage = (event, info) => {
    if (scale === 1) return;
    
    setPosition({
      x: position.x + info.delta.x,
      y: position.y + info.delta.y
    });
  };

  React.useEffect(() => {
    handleThumbnailScroll(selectedImage);
    if (scale !== 1) setScale(1);
  }, [selectedImage, handleThumbnailScroll]);

  return (
    <div className="relative group max-h-[700px] rounded-3xl overflow-hidden shadow-2xl dark:bg-slate-900 bg-white">
      <motion.div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden"
        drag={scale === 1 ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDrag}
        dragControls={dragControls}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={selectedImage}
            ref={imageRef}
            className="w-full h-full origin-center"
            style={{
              scale: scale,
              x: position.x,
              y: position.y
            }}
            drag={scale > 1}
            onDrag={handleDragImage}
            dragConstraints={{
              left: -((imageRef.current?.offsetWidth || 0) * (scale - 1)) / 2,
              right: ((imageRef.current?.offsetWidth || 0) * (scale - 1)) / 2,
              top: -((imageRef.current?.offsetHeight || 0) * (scale - 1)) / 2,
              bottom: ((imageRef.current?.offsetHeight || 0) * (scale - 1)) / 2
            }}
            dragTransition={{ power: 0, timeConstant: 200 }}
          >
            <motion.img
              src={images[selectedImage]}
              alt={productName}
              className="w-full h-full object-contain"
              variants={imageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, i) => (
            <motion.div
              key={i}
              className={`h-1.5 rounded-full ${
                selectedImage === i ? 'bg-white w-6' : 'bg-white/50 w-3'
              }`}
              initial={false}
              animate={{ width: selectedImage === i ? 24 : 12 }}
              transition={{ type: 'spring', stiffness: 300 }}
            />
          ))}
        </div>
      </motion.div>

      <motion.button
        className="absolute top-1/2 left-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-xl hover:shadow-2xl transform transition-all hover:-translate-x-1 dark:bg-black/80 dark:hover:bg-black"
        aria-label="Previous Image"
        onClick={() => handleImageNavigation("prev")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiChevronLeft size={28} className="text-gray-800 dark:text-gray-200" />
      </motion.button>
      <motion.button
        className="absolute top-1/2 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-xl hover:shadow-2xl transform transition-all hover:translate-x-1 dark:bg-black/80 dark:hover:bg-black"
        aria-label="Next Image"
        onClick={() => handleImageNavigation("next")}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FiChevronRight size={28} className="text-gray-800 dark:text-gray-200" />
      </motion.button>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <motion.button
          className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-xl hover:shadow-2xl dark:bg-black/80"
          onClick={zoomIn}
          disabled={scale >= 3}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiZoomIn size={24} />
        </motion.button>
        <motion.button
          className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-xl hover:shadow-2xl dark:bg-black/80"
          onClick={zoomOut}
          disabled={scale <= 1}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiZoomOut size={24} />
        </motion.button>
      </div>

      <div 
        id="thumbnails-container"
        className="flex space-x-3 mt-4 px-4 pb-2 overflow-x-auto scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {images.map((img, i) => (
          <motion.div
            key={img}
            id={`thumbnail-${i}`}
            className="relative flex-shrink-0"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img
              src={img}
              alt={`Thumbnail ${i + 1}`}
              className={`w-20 h-20 rounded-xl object-cover cursor-pointer transition-all ${
                selectedImage === i 
                  ? 'ring-4 ring-orange-400 scale-105 shadow-lg' 
                  : 'opacity-80 hover:opacity-100'
              }`}
              onClick={() => setSelectedImage(i)}
              loading="lazy"
            />
            {selectedImage === i && (
              <motion.div
                className="absolute inset-0 bg-black/30 rounded-xl"
                layoutId="thumbnail-highlight"
                transition={{ type: 'spring', stiffness: 500 }}
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(ImageGallery);