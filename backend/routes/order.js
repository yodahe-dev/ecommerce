const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Order, Product } = require('../models');
const { auth } = require('../middlewares/auth');

// GET /api/orders/:userId?status=paid|unpaid|received
router.get('/orders/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    const where = { userId };

    if (status) {
      if (status === 'received') {
        where.receiveStatus = 'received';
      } else if (status === 'paid') {
        where.orderStatus = 'paid';
      } else if (status === 'unpaid') {
        where.orderStatus = 'pending';
      }
    }

    const orders = await Order.findAll({
      where,
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'mainImage', 'createdAt'],
      }],
      order: [['createdAt', 'DESC']],
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders/confirm/:orderId
router.post('/orders/confirm/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.orderStatus = 'paid';
    order.receiveStatus = 'received';
    await order.save();

    res.json({ message: 'Order confirmed received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders/refund/:orderId

router.post('/orders/confirm/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.orderStatus !== 'paid') {
      return res.status(400).json({ error: 'Order not paid yet' });
    }

    order.receiveStatus = 'received';
    await order.save();

    res.json({ message: 'Order marked as received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Fixed sold count endpoint - using uppercase Order model
router.get("/product/:productId/sold-count", async (req, res) => {
  try {
    const { productId } = req.params;

    const soldCount = await Order.count({
      where: {
        productId,
      }
    });

    res.json({
      code: "SOLD_COUNT_FOUND",
      message: "Sold count retrieved",
      productId,
      soldCount
    });
  } catch (error) {
    console.error("Error fetching sold count:", error);
    res.status(500).json({
      code: "SERVER_ERROR",
      message: "Internal server error"
    });
  }
});





module.exports = router;
