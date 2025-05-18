const express = require("express");
const router = express.Router();
const { Cart, Product } = require("../models");

// Add to cart
router.post("/", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    let item = await Cart.findOne({
      where: { userId, productId, status: "active" },
    });

    if (item) {
      item.quantity += quantity || 1;
      await item.save();
    } else {
      item = await Cart.create({
        userId,
        productId,
        quantity: quantity || 1,
      });
    }

    res.status(201).json(item);
  } catch (err) {
    console.error("Error adding to cart:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all cart items for a user (with product info)
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const items = await Cart.findAll({
      where: { userId, status: "active" },
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price", "imageUrl"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(items);
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update cart quantity
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json(cartItem);
  } catch (err) {
    console.error("Error updating cart item:", err);
    res.status(500).json({ error: "Server error" });
  }
});


// Delete a cart item by ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await cartItem.destroy();
    res.json({ message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    res.status(500).json({ error: "Server error" });
  }
});


module.exports = router;
