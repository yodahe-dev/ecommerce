const express = require('express');
const router = express.Router();
const { product } = require('../models');

const createProduct = require('../controllers/Product/create');
const updateProduct = require('../controllers/Product/update');
const deleteProduct = require('../controllers/Product/delete');
const readProduct = require('../controllers/Product/read');

const upload = require('../middlewares/upload'); // add this

// Product routes
router.get('/products', readProduct.getAll); // All products
router.get('/products/seller/:sellerId', readProduct.getBySeller); // Products by seller

router.post('/products', upload.single('image'), createProduct); // 🔁 updated for image upload

router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
