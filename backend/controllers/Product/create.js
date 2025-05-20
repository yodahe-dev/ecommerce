const { Product, User, Role } = require('../../models');
const validator = require('validator');

module.exports = async (req, res) => {
  const {
    name,
    description,
    price,
    lastPrice,
    userId,
    sizes,
    shippingPrice,
    condition,
  } = req.body;

  if (!userId) return res.status(400).json({ message: 'User must log in' });

  // Validate and sanitize name
  if (!name || typeof name !== 'string' || name.length > 100) {
    return res.status(400).json({ message: 'Invalid product title' });
  }
  const cleanName = validator.escape(name.trim());

  // Validate and sanitize description
  if (!description || typeof description !== 'string' || description.length > 2000) {
    return res.status(400).json({ message: 'Invalid product description' });
  }
  const cleanDescription = validator.escape(description.trim());

  // Validate price
  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ message: 'Invalid price' });
  }

  const parsedLastPrice = parseFloat(lastPrice);
  if (!isNaN(parsedLastPrice) && parsedLastPrice < 0) {
    return res.status(400).json({ message: 'Invalid last price' });
  }

  const parsedShippingPrice = parseFloat(shippingPrice);
  if (!isNaN(parsedShippingPrice) && parsedShippingPrice < 0) {
    return res.status(400).json({ message: 'Invalid shipping price' });
  }

  try {
    const user = await User.findOne({
      where: { id: userId },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowedRoles = ['seller', 'admin', 'manager'];
    if (!allowedRoles.includes(user.role?.name)) {
      return res.status(403).json({ message: 'Not allowed to create products' });
    }

    const mainImage = req.files?.main?.[0]?.filename || '';
    const extraImages = req.files?.extra?.map(file => file.filename) || [];

    const newProduct = await Product.create({
      name: cleanName,
      description: cleanDescription,
      price: parsedPrice,
      lastPrice: !isNaN(parsedLastPrice) ? parsedLastPrice : null,
      mainImage: `/src/assets/products/${mainImage}`,
      extraImages: extraImages.map(f => `/src/assets/products/${f}`),
      userId,
      sizes: sizes ? JSON.parse(sizes) : null,
      shippingPrice: !isNaN(parsedShippingPrice) ? parsedShippingPrice : null,
      condition,
    });

    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product failed:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
