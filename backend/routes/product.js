const express = require('express');
const router = express.Router();
const { product } = require('../models');

const createProduct = require('../controllers/Product/create');
const updateProduct = require('../controllers/Product/update');
const deleteProduct = require('../controllers/Product/delete');
const readProduct = require('../controllers/product/read');

router.get('/products', readProduct.getAll);//list for all products for all users
router.get('/products/seller/:sellerId', readProduct.getBySeller);


router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

module.exports = router;
