import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import ReactImageMagnify from "react-image-magnify";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

const ImageGallery = ({
  images,
  selectedImage,
  setSelectedImage,
  handleImageNavigation,
  handleDrag,
  dragControls,
  productName,
}) => (
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
            smallImage={{
              alt: productName,
              isFluidWidth: true,
              src: images[selectedImage],
            }}
            largeImage={{
              src: images[selectedImage],
              width: 1200,
              height: 1800,
            }}
            lensStyle={{ backgroundColor: "rgba(0,0,0,.3)" }}
            enlargedImageContainerStyle={{ zIndex: 9999 }}
            shouldUsePositiveSpaceLens
            enlargedImagePosition="over"
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
);

export default ImageGallery;
