const { Product } = require('../../models');

module.exports = async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.destroy();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Failed to delete product:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
