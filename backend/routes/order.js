const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { Order, Product, sequelize } = require('../models');
const { auth } = require('../middlewares/auth');
const router = express.Router();

const formatPhoneForChapa = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('9')) {
    return `+251${digits}`;
  }
  if (digits.length >= 10 && digits.length <= 15) {
    return `+${digits}`;
  }
  return phone;
};

router.post("/pay", async (req, res) => {
  const {
    email,
    amount,
    userId,
    productId,
    phone,
    additionalphone,
    address,
    notes,
    quantity
  } = req.body;

  const requiredFields = ['email', 'amount', 'userId', 'productId'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  if (missingFields.length > 0) {
    return res.status(400).json({ error: "Missing required fields", missing: missingFields });
  }

  if (isNaN(parseFloat(amount))) {
    return res.status(400).json({ error: "Invalid amount format" });
  }

  const tx_ref = uuidv4();
  const transaction = await sequelize.transaction();

  try {
    const order = await Order.create({
      userId,
      productId,
      quantity,
      totalAmount: parseFloat(amount),
      customerEmail: email,
      customerPhone: phone,
      shippingAddress: address,
      receiverPhone: additionalphone,
      notes,
      chapaTxRef: tx_ref,
      orderStatus: "pending",
      receiveStatus: "not_received"
    }, { transaction });

    const formattedPhone = formatPhoneForChapa(phone);

    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        tx_ref,
        first_name: "Customer",
        last_name: "User",
        phone_number: formattedPhone,
        return_url: `${process.env.CLIENT_URL}/payment-success`,
        callback_url: `${process.env.BASE_URL}/api/verify-payment`,
        customization: {
          title: "Checkout",
          description: "Chapa payment integration",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000
      }
    );

    if (response.data.status !== "success") {
      await transaction.rollback();
      return res.status(400).json({ error: response.data.message || "Failed to initialize payment" });
    }

    await transaction.commit();
    return res.json({
      checkout_url: response.data.data.checkout_url,
      orderId: order.id,
      tx_ref
    });
  } catch (err) {
    await transaction.rollback();
    console.error("Payment Error:", err.response?.data || err.message);

    let status = 500;
    let message = "Payment processing failed";

    if (err.response?.status === 401) message = "Invalid Chapa API credentials";
    else if (err.response?.status === 400) message = "Invalid payment request";

    return res.status(status).json({
      error: message,
      details: err.response?.data || err.message
    });
  }
});

async function verifyPayment(tx_ref) {
  try {
    const response = await axios.get(
      `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
        },
        timeout: 10000
      }
    );

    const data = response.data;

    // Debug logs
    console.log("Chapa verification response data:", JSON.stringify(data, null, 2));

    if (!data?.status || data.status !== 'success' || !data.data) {
      return { success: false, error: data?.message || "Invalid response from Chapa" };
    }

    const chapaStatus = data.data.status;

    // Log status value
    console.log("Chapa transaction status:", chapaStatus);

    let orderStatus = "pending";

    if (chapaStatus === "success") {
      orderStatus = "paid";
    } else if (["failed", "timeout", "cancelled"].includes(chapaStatus)) {
      orderStatus = "expired";
    }

    const [updatedCount, [updatedOrder]] = await Order.update(
      { orderStatus },
      {
        where: { chapaTxRef: tx_ref },
        returning: true
      }
    );

    if (updatedCount === 0) {
      return { success: false, error: "Order not found" };
    }

    return { success: true, status: orderStatus, order: updatedOrder };
  } catch (err) {
    console.error("Verification Error:", err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}


router.post("/verify-payment", async (req, res) => {
  const event = req.body?.event;
  const tx_ref = req.body?.tx_ref || req.body?.data?.tx_ref;

  if (!tx_ref || !event) {
    return res.status(400).json({ error: "Invalid webhook payload" });
  }

  if (event !== 'charge.success') {
    return res.status(200).json({ status: 'ignored', message: 'Non-success event ignored' });
  }

  const result = await verifyPayment(tx_ref);

  if (!result.success) {
    return res.status(400).json({ error: result.error || "Verification failed" });
  }

  res.status(200).json({
    status: result.status,
    message: `Order ${result.status === 'paid' ? 'completed' : 'failed'}`
  });
});


router.get("/verify-payment", async (req, res) => {
  const { tx_ref } = req.query;

  if (!tx_ref) {
    return res.status(400).json({ error: "Missing tx_ref parameter" });
  }

  const result = await verifyPayment(tx_ref);

  if (!result.success) {
    return res.status(400).json({ error: result.error || "Verification failed" });
  }

  res.status(200).json({
    status: result.status,
    orderId: result.order.id,
    message: `Order status: ${result.status}`
  });
});


router.get('/orders/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const where = { userId };
    const statusMap = {
      'received': { receiveStatus: 'received' },
      'paid': { orderStatus: 'paid' },
      'unpaid': { orderStatus: { [Op.in]: ['pending', 'expired'] } }
    };

    if (status && statusMap[status]) {
      Object.assign(where, statusMap[status]);
    }

    const orders = await Order.findAll({
      where,
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'mainImage', 'createdAt'],
      }],
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'quantity', 'totalAmount', 'orderStatus', 'receiveStatus', 'createdAt']
    });

    res.json(orders);
  } catch (err) {
    console.error("Order Fetch Error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/orders/confirm/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const [updatedCount] = await Order.update(
      {
        orderStatus: 'paid',
        receiveStatus: 'received'
      },
      {
        where: {
          id: orderId,
          orderStatus: 'paid'
        }
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Order not found or not paid' });
    }

    res.json({ message: 'Order confirmed as received' });
  } catch (err) {
    console.error("Confirmation Error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/orders/refund/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;

    const [updatedCount] = await Order.update(
      { receiveStatus: 'refunding' },
      {
        where: {
          id: orderId,
          orderStatus: 'paid',
          receiveStatus: 'received'
        }
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ error: 'Order not found or not eligible for refund' });
    }

    res.json({ message: 'Refund process initiated' });
  } catch (err) {
    console.error("Refund Error:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


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
      productId,
      soldCount
    });
  } catch (err) {
    console.error("Sold Count Error:", err);
    res.status(500).json({
      code: "SERVER_ERROR",
      error: err.message
    });
  }
  
});

module.exports = router;
