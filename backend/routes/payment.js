const express = require('express');
const router = express.Router();
const { Payment, Order, User } = require('../models');
const fetch = require('node-fetch');

const VALID_ORDER_STATUSES = ['pending', 'paid', 'expired'];

router.post('/payment/initiate', async (req, res) => {
  try {
    const {
      userId,
      productId,
      productName,
      amount,
      phone,
      address,
      email,
      notes,
      additionalphone,
    } = req.body;

    if (!userId || !productId || !amount || !phone || !address || !additionalphone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    const chapaTxRef = `tx-${Date.now()}`;
    const payment = await Payment.create({
      chapaTxRef,
      amount,
      currency: 'ETB',
      status: 'initiated',
    });

    const newStatus = 'pending';

    // Check if pending order already exists for this user and product
    let order = await Order.findOne({
      where: {
        userId,
        productId,
        orderStatus: newStatus,
      },
    });

    if (order) {
      // Update existing order
      order.quantity += 1;
      order.paymentId = payment.id;
      order.notes = notes;
      order.address = address;
      order.phone = phone;
      order.additionalphone = additionalphone;
      order.orderStatus = newStatus; // ensure status is valid
      await order.save();
    } else {
      // Create new order
      order = await Order.create({
        userId,
        productId,
        paymentId: payment.id,
        orderStatus: newStatus, // only 'pending' here
        receiveStatus: 'not_received',
        quantity: 1,
        notes,
        address,
        phone,
        additionalphone,
      });
    }

    const payload = {
      public_key: process.env.CHAPA_PUBLIC_KEY,
      tx_ref: chapaTxRef,
      amount: amount.toString(),
      currency: 'ETB',
      redirect_url: `${process.env.CLIENT_URL}/payment-complete?orderId=${order.id}`,
      customer: {
        email: email || 'noemail@example.com',
        phone_number: phone,
        name: user.username || 'Customer',
      },
      customization: {
        title: productName || 'Order Payment',
        description: Array.isArray(notes) && notes.length ? notes.join(', ') : 'Payment for order',
      },
    };

    const chapaRes = await fetch('https://api.chapa.co/v1/transaction/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const chapaData = await chapaRes.json();

    if (chapaData.status !== 'success') {
      console.error('Chapa error:', chapaData);
      return res.status(500).json({ message: 'Failed to initialize payment', details: chapaData });
    }

    await payment.update({ rawResponse: chapaData });

    return res.json({ checkout_url: chapaData.data.checkout_url });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
