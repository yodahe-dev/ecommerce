const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const zxcvbn = require('zxcvbn');
const { User, Role } = require('../models'); // Adjust if paths differ

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Configure multer for profile avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../frontend/src/assets/profile-avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${randomName}${ext}`);
  },
});

const avatarFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedTypes = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];

  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (PNG, JPG, GIF, WEBP)'), false);
  }
};

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('avatar');

// Profile update endpoint
router.put('/profileUpadte', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    avatarUpload(req, res, async (err) => {
      if (err instanceof multer.MulterError || err) {
        return res.status(400).json({ error: err.message });
      }

      const { username, bio, oldPassword, newPassword, shopName } = req.body;
      const user = await User.findByPk(decoded.id, { include: { model: Role, as: 'role' } });

      if (!user) return res.status(404).json({ error: 'User not found' });

      // Prevent email and role updates
      if (req.body.email || req.body.role) {
        return res.status(400).json({ error: 'Email and role cannot be updated' });
      }

      // Handle avatar
      let avatarUrl = user.avatarUrl;
      if (req.file) {
        avatarUrl = `/src/assets/products/${req.file.filename}`;
      }

      // Handle password change
      if (oldPassword && newPassword) {
        const isValid = await bcrypt.compare(oldPassword, user.password);
        if (!isValid) {
          return res.status(400).json({ error: 'Current password is incorrect' });
        }

        const passwordStrength = zxcvbn(newPassword);
        if (passwordStrength.score < 3) {
          return res.status(400).json({ error: 'Password is too weak. Use a stronger one.' });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
      }

      // Update fields
      user.username = username || user.username;
      user.bio = bio || user.bio;
      user.avatarUrl = avatarUrl;

      if (user.role?.name === 'seller' && shopName) {
        user.shopName = shopName;
      }

      await user.save();

      const updatedUser = await User.findByPk(user.id, {
        attributes: ['id', 'username', 'avatarUrl', 'bio', 'shopName'],
        include: {
          model: Role,
          as: 'role',
          attributes: ['name']
        }
      });

      res.json(updatedUser);
    });
  } catch (error) {
    console.error('Profile update error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }

    res.status(500).json({ error: 'Profile update failed' });
  }
});

module.exports = router;
