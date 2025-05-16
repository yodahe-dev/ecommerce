const { Product, User, Role } = require('../../models');

module.exports = {
  getAll: async (req, res) => {
    try {
      const products = await Product.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json(products);
    } catch (err) {
      console.error('Error getting products:', err);
      res.status(500).json({ message: 'Failed to get products' });
    }
  },

  getBySeller: async (req, res) => {
    const { sellerId } = req.params;

    try {
      const user = await User.findOne({
        where: { id: sellerId },
        include: [{ model: Role, as: 'role' }],
      });

      if (!user) {
        return res.status(404).json({ message: 'Seller not found' });
      }

      if (user.role.name !== 'seller') {
        return res.status(403).json({ message: 'User is not a seller' });
      }

      const products = await Product.findAll({
        where: { userId: sellerId },
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
        products,
      });
    } catch (err) {
      console.error('Error getting seller profile:', err);
      res.status(500).json({ message: 'Failed to get seller profile' });
    }
  },
};
