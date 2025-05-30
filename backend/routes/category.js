const express = require("express");
const router = express.Router();
const { Category } = require("../models");

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
    });
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
