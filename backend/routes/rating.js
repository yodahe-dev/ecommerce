const express = require("express");
const router = express.Router();
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { Rating } = require("../models");

// Set allowed image types and max size
const allowedExt = [".png", ".jpg", ".jpeg", ".gif"];
const maxFileSize = 2 * 1024 * 1024; // 2MB

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../frontend/src/assets/rating"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, name);
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (.jpg, .png, .jpeg, .gif)"));
  }
};

// Multer upload config
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxFileSize },
});

// POST /api/rating
router.post("/rating", upload.single("image"), async (req, res) => {
  try {
    const { userId, productId, rating, feedback } = req.body;

    if (!userId || !productId || !rating) {
      return res.status(400).json({ message: "userId, productId, and rating are required" });
    }

    const ratingValue = parseInt(rating, 10);
    if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Set image path if file is uploaded
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/src/assets/rating/${req.file.filename}`;
    }

    const newRating = await Rating.create({
      userId,
      productId,
      rating: ratingValue,
      feedback: feedback || null,
      imageUrl,
    });

    return res.status(201).json(newRating);
  } catch (error) {
    console.error("Rating upload failed:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "Image too large. Max size is 2MB." });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
