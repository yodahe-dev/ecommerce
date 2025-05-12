const { Product, User, Role } = require('../../models');

module.exports = async (req, res) => {
  const {
    name,
    description,
    price,
    quantity,
    imageUrl,
    isDiscounted,
    lastPrice,
    currentPrice,
    userId,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User must log in" });
  }

  try {
    const user = await User.findOne({
      where: { id: userId },
      include: [{ model: Role, as: 'role', attributes: ['name'] }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedRoles = ['seller', 'admin', 'manager'];
    const userRole = user.role?.name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "You are not allowed to create products" });
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      quantity,
      imageUrl,
      isDiscounted,
      lastPrice,
      currentPrice,
      userId,
    });

    return res.status(201).json(newProduct);
  } catch (err) {
    console.error('Create product failed:', err);
    return res.status(500).json({
      message: 'Internal server error. Failed to create product.',
      error: err.message,
    });
  }
};
