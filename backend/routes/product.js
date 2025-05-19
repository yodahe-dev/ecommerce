const express = require('express');
const router = express.Router();

const createProduct = require('../controllers/Product/create');
const updateProduct = require('../controllers/Product/update');
const deleteProduct = require('../controllers/Product/delete');
const readProduct = require('../controllers/Product/read');

const upload = require('../middlewares/upload'); // already correct

// Routes
router.get('/products', readProduct.getAll);
router.get('/products/:id', readProduct.getById);
router.get('/products/seller/:sellerId', readProduct.getBySeller);

// ✅ Fix: use .post with upload (already set up as .fields)
router.post('/products', upload, createProduct);

router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
