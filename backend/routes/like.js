const express = require('express');
const router = express.Router();
const { Like } = require('../models'); // Adjust path if needed

router.post("/isLiked", async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const liked = await Like.findOne({ where: { userId, productId } });
    res.json({ liked: !!liked });
  } catch (err) {
    console.error("Check like error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Add to wishlist
router.post('/like', async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'Missing userId or productId' });
  }

  try {
    const existing = await Like.findOne({ where: { userId, productId } });
    if (existing) {
      return res.status(409).json({ message: 'Already liked' });
    }

    const like = await Like.create({ userId, productId });
    return res.status(201).json({ message: 'Product liked', data: like });
  } catch (err) {
    console.error('Add like error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Remove from wishlist
router.post('/unlike', async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ message: 'Missing userId or productId' });
  }

  try {
    const removed = await Like.destroy({ where: { userId, productId } });
    if (!removed) {
      return res.status(404).json({ message: 'Like not found' });
    }

    return res.status(200).json({ message: 'Product unliked' });
  } catch (err) {
    console.error('Unlike error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
