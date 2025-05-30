const express = require('express');
const { Product, User, Role, Category } = require('../models');
const validator = require('validator');
const upload = require('../middlewares/upload');
const { Op, fn, col, where: whereFn } = require('sequelize');

const router = express.Router();

// helper to format product
const formatProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  lastPrice: product.lastPrice,
  imageUrl: product.mainImage,
  extraImages: product.extraImages,
  specs: product.sizes,
  shippingPrice: product.shippingPrice,
  condition: product.condition,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  seller: {
    username: product.user?.username,
    email: product.user?.email,
  },
  categoryId: product.categoryId
});

// create
router.post('/products', upload, async (req, res) => {
  const {
    name,
    description,
    price,
    lastPrice,
    userId,
    sizes,
    quantity,
    condition,
    categoryId  // Added categoryId
  } = req.body;

  if (!userId) return res.status(400).json({ message: 'User must log in' });

  if (!name || typeof name !== 'string' || name.length > 100)
    return res.status(400).json({ message: 'Invalid product title' });

  if (!description || typeof description !== 'string' || description.length > 2000)
    return res.status(400).json({ message: 'Invalid product description' });

  const parsedPrice = parseFloat(price);
  const parsedQuantity = parseInt(quantity, 10); // Changed to integer
  const parsedLastPrice = lastPrice ? parseFloat(lastPrice) : null;

  if (isNaN(parsedPrice) || parsedPrice <= 0)  // Changed to <= 0
    return res.status(400).json({ message: 'Invalid price' });
  if (isNaN(parsedQuantity) || parsedQuantity <= 0)
    return res.status(400).json({ message: 'Invalid quantity' });
  if (parsedLastPrice !== null && isNaN(parsedLastPrice))
    return res.status(400).json({ message: 'Invalid last price' });
    
  // Validate categoryId
  if (!categoryId) 
    return res.status(400).json({ message: 'Category is required' });
  
  try {
    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) 
      return res.status(400).json({ message: 'Invalid category' });

    const user = await User.findOne({
      where: { id: userId },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowedRoles = ['seller', 'admin', 'manager'];
    if (!allowedRoles.includes(user.role?.name))
      return res.status(403).json({ message: 'Not allowed to create products' });

    const mainImage = req.files?.main?.[0]?.filename || '';
    const extraImages = req.files?.extra?.map((file) => file.filename) || [];

    const product = await Product.create({
      name: validator.escape(name.trim()),
      description: validator.escape(description.trim()),
      price: parsedPrice,
      quantity: parsedQuantity,
      lastPrice: parsedLastPrice,
      mainImage: `/src/assets/products/${mainImage}`,
      extraImages: extraImages.map((f) => `/src/assets/products/${f}`),
      userId,
      sizes: sizes ? JSON.parse(sizes) : null,
      shippingPrice: 200, // fixed shipping price
      condition: condition || 'other',  // Default to 'other'
      categoryId  // Added categoryId
    });

    res.status(201).json(product);
  } catch (err) {
    console.error('Create product failed:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// get all
router.get('/products', async (req, res) => {
  try {
    const { search = '', sortBy = 'createdAt', order = 'DESC', limit, offset } = req.query;

    const where =
      search.trim() !== ''
        ? {
            [Op.or]: [
              whereFn(fn('LOWER', col('Product.name')), { [Op.like]: `%${search.toLowerCase()}%` }),
              whereFn(fn('LOWER', col('Product.description')), { [Op.like]: `%${search.toLowerCase()}%` }),
            ],
          }
        : {};

    const options = {
      where,
      include: [
        { model: User, as: 'user', attributes: ['username', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }  // Added category
      ],
      order: [[sortBy, order.toUpperCase()]],
    };

    if (limit) options.limit = parseInt(limit);
    if (offset) options.offset = parseInt(offset);

    const products = await Product.findAll(options);
    res.json(products.map(formatProduct));
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// get by id
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, as: 'user', attributes: ['username', 'email'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }  // Added category
      ],
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(formatProduct(product));
  } catch (err) {
    console.error('Error fetching product by ID:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// get by seller
router.get('/products/seller/:sellerId', async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.params.sellerId },
      include: [{ model: Role, as: 'role' }],
    });

    if (!user) return res.status(404).json({ message: 'Seller not found' });
    if (user.role?.name !== 'seller') return res.status(403).json({ message: 'User is not a seller' });

    const products = await Product.findAll({
      where: { userId: req.params.sellerId },
      include: [{ model: Category, as: 'category', attributes: ['id', 'name'] }],  // Added category
      order: [['createdAt', 'DESC']],
    });

    res.json({
      seller: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
      },
      totalProducts: products.length,
      products: products.map(formatProduct),
    });
  } catch (err) {
    console.error('Error fetching seller data:', err);
    res.status(500).json({ message: 'Failed to fetch seller data' });
  }
});

// update
router.put('/products/:id', async (req, res) => {
  const {
    name,
    description,
    price,
    quantity,
    lastPrice,
    sizes,
    condition,
    mainImage,
    extraImages,
    categoryId  // Added categoryId
  } = req.body;
  const id = req.params.id;

  if (!name || typeof name !== 'string' || name.length > 100)
    return res.status(400).json({ message: 'Invalid product title' });

  if (!description || typeof description !== 'string' || description.length > 2000)
    return res.status(400).json({ message: 'Invalid product description' });

  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // Validate category if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) 
        return res.status(400).json({ message: 'Invalid category' });
    }

    product.name = name;
    product.description = description;
    product.price = price;
    product.quantity = quantity;
    product.lastPrice = lastPrice;
    product.sizes = sizes;
    product.condition = condition || 'other';
    
    // Update categoryId if provided
    if (categoryId) product.categoryId = categoryId;

    // optional: update images
    if (mainImage) product.mainImage = mainImage;
    if (extraImages) product.extraImages = extraImages;

    await product.save();

    res.status(200).json({ message: 'Product updated', product });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete
router.delete('/products/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.destroy();
    res.status(200).json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;