const { Product } = require('../../models');

module.exports = async (req, res) => {
  const id = req.params.id;
  const { name, description, price, quantity } = req.body;

  try {
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;

    await product.save();

    res.status(200).json({ message: 'Product updated', product });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
