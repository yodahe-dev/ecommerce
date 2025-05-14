const express = require('express');
const router = express.Router();
const multer = require('multer');
const createProduct = require('../controllers/Product/create');
const updateProduct = require('../controllers/Product/update');
const deleteProduct = require('../controllers/Product/delete');
const readProduct = require('../controllers/product/read');

// Set up multer middleware to handle image uploads
const upload = multer({ dest: 'public/images/' }); // Destination folder for images

router.get('/products', readProduct.getAll); // list for all products for all users
router.get('/products/seller/:sellerId', readProduct.getBySeller);

router.post('/products', upload.single('image'), createProduct); // Accept one image with field name 'image'
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
