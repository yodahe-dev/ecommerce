
const express = require("express");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const { Payment } = require("../models");

const router = express.Router();

router.post("/pay", async (req, res) => {
  const { email, amount } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ error: "Missing email or amount" });
  }

  const tx_ref = uuidv4();

  try {
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      {
        amount,
        currency: "ETB",
        email,
        tx_ref,
        return_url: `${process.env.CLIENT_URL}/payment-success`,
        callback_url: `${process.env.CLIENT_URL}/api/verify-payment`,
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
      }
    );

    // Chapa API error (but still 200 OK)
    if (response.data.status !== "success") {
      return res.status(400).json({
        error: response.data.message || "Failed to initialize payment",
      });
    }

    await Payment.create({
      chapaTxRef: tx_ref,
      amount,
      status: "initiated",
      rawResponse: response.data,
    });

    return res.json({
      checkout_url: response.data.data.checkout_url,
    });
  } catch (err) {
    console.error("Chapa Error:", err.response?.data || err.message);
    return res.status(500).json({
      error: "Payment request failed. Check Chapa credentials.",
    });
  }
});

module.exports = router;
