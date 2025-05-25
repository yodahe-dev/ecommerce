const express = require("express");
const router = express.Router();
const { Rating, User, Product } = require("../models"); // Adjust path if needed
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// Setup multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/reviews/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

const upload = multer({ storage });

// Middleware to check user auth (simple stub, replace with your auth)
const authMiddleware = (req, res, next) => {
  // Assume user is authenticated and user ID is in req.user.id
  // Replace with your real auth logic
  req.user = { id: "user-uuid-here" };
  next();
};

// Create new rating/review
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { rating, feedback, productId } = req.body;

    if (!productId || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate rating
    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    const newRating = await Rating.create({
      userId: req.user.id,
      productId,
      rating: ratingNum,
      feedback,
      imageUrl: req.file ? `/uploads/reviews/${req.file.filename}` : null,
    });

    res.status(201).json(newRating);
  } catch (error) {
    console.error("Error creating rating:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Optionally add GET to fetch ratings by product
router.get("/product/:productId", async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      where: { productId: req.params.productId },
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(ratings);
  } catch (error) {
    console.error("Error fetching ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
