const express = require('express');
const router = express.Router();
const { Payment, Order, User } = require('../models');
const fetch = require('node-fetch');

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

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ message: 'Invalid userId' });
    }

    // Create payment
    const chapaTxRef = `tx-${Date.now()}`;
    const payment = await Payment.create({
      chapaTxRef,
      amount,
      currency: 'ETB',
      status: 'initiated',
    });

    // Create order with all required fields
    const order = await Order.create({
      userId,
      productId,
      paymentId: payment.id,
      orderStatus: 'pending',
      notes,
      address,
      phone,
      addtionalphone: additionalphone, // typo in DB model: `addtionalphone`
    });

    // Prepare payload for Chapa
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

    // Call Chapa API
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
      return res.status(500).json({ message: 'Failed to initialize payment', details: chapaData });
    }

    // Update payment with full response
    await payment.update({ rawResponse: chapaData });

    return res.json({ checkout_url: chapaData.data.checkout_url });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
