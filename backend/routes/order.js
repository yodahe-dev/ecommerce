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

    order.orderStatus = 'expired';
    order.receiveStatus = 'received';
    await order.save();

    res.json({ message: 'Order confirmed received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/orders/refund/:orderId
router.post('/orders/refund/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.orderStatus !== 'paid' || order.receiveStatus !== 'not_received') {
      return res.status(400).json({ message: 'Cannot refund this order' });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    if (order.createdAt > sevenDaysAgo) {
      return res.status(400).json({ message: 'Refund only after 7 days' });
    }

    order.receiveStatus = 'refunding';
    await order.save();

    res.json({ message: 'Refund requested' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
