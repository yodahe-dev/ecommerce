const express = require("express");
const router = express.Router();
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { Rating, User } = require("../models");

// Configuration constants
const UPLOAD_CONFIG = {
  allowedExtensions: [".png", ".jpg", ".jpeg", ".gif"],
  maxFileSize: 2 * 1024 * 1024, // 2MB
  uploadPath: path.join(__dirname, "../../frontend/src/assets/rating")
};

// Secure file naming
const generateFileName = (ext) => 
  crypto.randomBytes(16).toString("hex") + ext.toLowerCase();

// File validation
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname);
  if (UPLOAD_CONFIG.allowedExtensions.includes(ext.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error(`Allowed file types: ${UPLOAD_CONFIG.allowedExtensions.join(", ")}`));
  }
};

// Configure Multer
const storage = multer.diskStorage({
  destination: UPLOAD_CONFIG.uploadPath,
  filename: (req, file, cb) => cb(null, generateFileName(path.extname(file.originalname)))
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: UPLOAD_CONFIG.maxFileSize }
});

// Rating submission endpoint
router.post("/rating", upload.single("image"), async (req, res) => {
  try {
    const { userId, productId, rating, feedback } = req.body;

    // Validation
    if (!userId || !productId || !rating) {
      return res.status(400).json({ 
        code: "MISSING_FIELDS",
        message: "Required fields: userId, productId, rating"
      });
    }

    const ratingValue = parseInt(rating, 10);
    if (isNaN(ratingValue)) {
      return res.status(400).json({
        code: "INVALID_RATING",
        message: "Rating must be a number"
      });
    }

    if (ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({
        code: "RATING_RANGE",
        message: "Rating must be between 1-5"
      });
    }

    // Process image
    const imageUrl = req.file ? `/src/assets/rating/${req.file.filename}` : null;

    // Find existing rating with user association
    const existingRating = await Rating.findOne({ 
      where: { userId, productId },
      include: {
        model: User,
        as: 'user',
        attributes: ["id", "username"]
      }
    });

    if (existingRating) {
      // Update existing rating
      const updatedFeedback = [
        feedback?.trim(),
        existingRating.feedback?.trim()
      ].filter(Boolean).join("\n\n");

      await existingRating.update({
        rating: ratingValue,
        feedback: updatedFeedback || null,
        imageUrl: imageUrl || existingRating.imageUrl
      });

      return res.json({
        code: "RATING_UPDATED",
        message: "Rating updated successfully",
        rating: {
          ...existingRating.get({ plain: true }),
          user: {
            id: existingRating.user.id,
            name: existingRating.user.username
          }
        }
      });
    }

    // Create new rating
    const newRating = await Rating.create({
      userId,
      productId,
      rating: ratingValue,
      feedback: feedback?.trim() || null,
      imageUrl
    });

    // Fetch user details with association
    const user = await User.findByPk(userId, {
      attributes: ["id", "username"],
      raw: true
    });

    res.status(201).json({
      code: "RATING_CREATED",
      message: "Rating submitted successfully",
      rating: { 
        ...newRating.get({ plain: true }),
        user: {
          id: user.id,
          name: user.username
        }
      }
    });

  } catch (error) {
    console.error("Rating submission error:", error);

    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        code: "FILE_TOO_LARGE",
        message: `Maximum file size is ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`
      });
    }

    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
});

// Get ratings endpoint
router.get("/rating/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    const ratings = await Rating.findAll({
      where: { productId },
      include: {
        model: User,
        as: 'user',
        attributes: ["id", "username"]
      },
      attributes: ["id", "rating", "feedback", "imageUrl", "createdAt"],
      order: [["createdAt", "DESC"]]
    });

    if (!ratings.length) {
      return res.json({
        code: "NO_RATINGS",
        message: "No ratings found for this product",
        productId,
        averageRating: 0,
        totalRatings: 0,
        reviews: []
      });
    }

    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;

    // Format response with user name
    const formattedReviews = ratings.map(rating => ({
      ...rating.get({ plain: true }),
      user: {
        id: rating.user.id,
        name: rating.user.username
      }
    }));

    res.json({
      code: "RATINGS_FOUND",
      message: `${totalRatings} ratings found`,
      productId,
      averageRating: Number(averageRating.toFixed(2)),
      totalRatings,
      reviews: formattedReviews
    });

  } catch (error) {
    console.error("Ratings fetch error:", error);
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
});

module.exports = router;