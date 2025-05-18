const { Product, User, Role } = require('../../models');

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
      name,
      description,
      price,
      lastPrice,
      mainImage: `/src/assets/products/${mainImage}`,
      extraImages: extraImages.map(f => `/src/assets/${f}`),
      userId,
      sizes: sizes ? JSON.parse(sizes) : null,
      shippingPrice,
      condition,
    });

    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product failed:', err);
    return res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
