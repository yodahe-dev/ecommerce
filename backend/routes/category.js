const express = require("express");
const router = express.Router();
const { Product, User, Role, Category } = require("../models");

// Only admin, manager, seller can create/update/delete
const checkPermission = async (userId) => {
  const user = await User.findOne({
    where: { id: userId },
    include: [{ model: Role, as: "role" }],
  });

  if (!user) return { error: "User not found" };
  if (!["admin", "manager", "seller"].includes(user.role?.name)) {
    return { error: "Not allowed" };
  }

  return { user };
};

// CREATE
router.post("/", async (req, res) => {
  const { name, description, price, lastPrice, imageUrl, userId, categoryId } = req.body;
  if (!userId) return res.status(400).json({ message: "userId required" });

  const { error } = await checkPermission(userId);
  if (error) return res.status(403).json({ message: error });

  try {
    const newProduct = await Product.create({
      name,
      description,
      price,
      lastPrice,
      imageUrl,
      userId,
      categoryId,
    });
    res.status(201).json(newProduct);
  } catch (err) {
    console.error("Create failed:", err);
    res.status(500).json({ message: "Create failed", error: err.message });
  }
});

// READ (all)
router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, as: "category", attributes: ["name"] },
        { model: User, as: "user", attributes: ["name"] },
      ],
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
});

// READ (single)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: "category" }],
    });

    if (!product) return res.status(404).json({ message: "Not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  const { userId, name, price, description, lastPrice, imageUrl, categoryId } = req.body;

  const { error } = await checkPermission(userId);
  if (error) return res.status(403).json({ message: error });

  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price ?? product.price;
    product.lastPrice = lastPrice ?? product.lastPrice;
    product.imageUrl = imageUrl || product.imageUrl;
    product.categoryId = categoryId || product.categoryId;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  const { userId } = req.body;

  const { error } = await checkPermission(userId);
  if (error) return res.status(403).json({ message: error });

  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Not found" });

    await product.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
});

module.exports = router;
