const express = require('express');
const router = express.Router();
const { Post } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Create post with image upload
router.post('/newpost', upload.single('image'), async (req, res) => {
  try {
    const { title, description, userId, teamBoxId } = req.body;

    if (!title || (!userId && !teamBoxId)) {
      return res.status(400).json({ message: 'Title and userId or teamBoxId required' });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const post = await Post.create({
      title,
      image: imagePath,
      description,
      userId,
      teamBoxId,
    });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error creating post', error: err.message });
  }
});

// Update post
router.post('/updatepost', upload.single('image'), async (req, res) => {
  try {
    const { id, title, description } = req.body;

    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (req.file) {
      // delete old image if exists
      if (post.image && fs.existsSync('.' + post.image)) {
        fs.unlinkSync('.' + post.image);
      }
      post.image = `/uploads/${req.file.filename}`;
    }

    post.title = title || post.title;
    post.description = description || post.description;

    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Error updating post', error: err.message });
  }
});

// Delete post
router.post('/deletepost', async (req, res) => {
  try {
    const { id } = req.body;

    const post = await Post.findByPk(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.image && fs.existsSync('.' + post.image)) {
      fs.unlinkSync('.' + post.image);
    }

    await post.destroy();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting post', error: err.message });
  }
});

// Display all posts
router.post('/postdisplaying', async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching posts', error: err.message });
  }
});

module.exports = router;
