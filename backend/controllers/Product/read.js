const { Product, User, Role } = require('../../models');
const { Op, fn, col, where: whereFn } = require('sequelize');

// Format product for response
const formatProduct = (product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  lastPrice: product.lastPrice,
  imageUrl: product.mainImage, // ✅ fixed line
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
  seller: {
    username: product.user?.username,
    email: product.user?.email,
  },
});

module.exports = {
  // GET /products?search=term&sortBy=createdAt&order=DESC
  getAll: async (req, res) => {
    try {
      const { search = '', sortBy = 'createdAt', order = 'DESC', limit, offset } = req.query;

      const where =
        search.trim() !== ''
          ? {
              [Op.or]: [
                whereFn(fn('LOWER', col('Product.name')), {
                  [Op.like]: `%${search.toLowerCase()}%`,
                }),
                whereFn(fn('LOWER', col('Product.description')), {
                  [Op.like]: `%${search.toLowerCase()}%`,
                }),
              ],
            }
          : {};

      const queryOptions = {
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['username', 'email'],
          },
        ],
        order: [[sortBy, order.toUpperCase()]],
      };

      if (limit) queryOptions.limit = parseInt(limit);
      if (offset) queryOptions.offset = parseInt(offset);

      const products = await Product.findAll(queryOptions);

      res.json(products.map(formatProduct));
    } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).json({ message: 'Something went wrong while fetching products' });
    }
  },

  // GET /products/seller/:sellerId
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

      if (user.role?.name !== 'seller') {
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
        products: products.map(formatProduct),
      });
    } catch (err) {
      console.error('Error fetching seller data:', err);
      res.status(500).json({ message: 'Failed to fetch seller data' });
    }
  },
};
