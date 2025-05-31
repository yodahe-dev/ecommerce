const express = require('express');
const router = express.Router();
const { Like } = require('../models'); // Adjust path if needed

// Check if user liked a product
router.post('/isLiked', async (req, res) => {
  const { userId, productId } = req.body;
  if (!userId || !productId) {
    return res.status(400).json({ message: 'Missing userId or productId' });
  }

  try {
    const liked = await Like.findOne({ where: { userId, productId } });
    res.json({ liked: !!liked });
  } catch (err) {
    console.error('Check like error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Like a product
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

    await Like.create({ userId, productId });

    // Get updated total likes
    const totalLikes = await Like.count({ where: { productId } });

    return res.status(201).json({ message: 'Product liked', totalLikes });
  } catch (err) {
    console.error('Add like error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlike a product
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

    // Get updated total likes
    const totalLikes = await Like.count({ where: { productId } });

    return res.status(200).json({ message: 'Product unliked', totalLikes });
  } catch (err) {
    console.error('Unlike error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total likes for a product
router.get('/totalLike/:productId', async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    return res.status(400).json({ message: 'Missing productId' });
  }

  try {
    const totalLikes = await Like.count({ where: { productId } });
    res.json({ totalLikes });
  } catch (err) {
    console.error('Get total likes error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
