const { Product, User, Role } = require('../../models');

module.exports = async (req, res) => {
  const { name, description, price, lastPrice, userId } = req.body;

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
    if (!allowedRoles.includes(user.role?.name)) {
      return res.status(403).json({ message: "You are not allowed to create products" });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/src/assets/${req.file.filename}`; // URL path relative to frontend public folder
    }

    const newProduct = await Product.create({
      name,
      description,
      price,
      lastPrice,
      imageUrl,
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
