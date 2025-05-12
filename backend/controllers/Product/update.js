const { Product, User, Role } = require('../../models');

module.exports = async (req, res) => {
  const { 
    name, description, price, quantity,
    imageUrl, isDiscounted, lastPrice, currentPrice,
    userId 
  } = req.body;
  const productId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "User must log in" });
  }

  try {
    // find user and role
    const user = await User.findOne({
      where: { id: userId },
      include: [{ model: Role, as: 'role', attributes: ['name'] }]
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const allowedRoles = ['seller', 'admin', 'manager'];
    const userRole = user.role?.name;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "Not allowed to update products" });
    }

    // find product
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // if seller, ensure they own it
    if (userRole === 'seller' && product.userId !== userId) {
      return res.status(403).json({ message: "You can only update your own products" });
    }

    // update fields
    await product.update({
      name, description, price, quantity,
      imageUrl, isDiscounted, lastPrice, currentPrice
    });

    return res.json(product);
  } catch (err) {
    console.error('Update product failed:', err);
    return res.status(500).json({
      message: 'Internal server error. Failed to update product.',
      error: err.message
    });
  }
};
