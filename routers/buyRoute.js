const express = require("express");
const User = require("../models/users.js");
const products = require("../models/products.js");
const Purchase = require("../models/purchase.js");
const calcChange = require("../controllers/change.js");
const authToken = require("../controllers/auth.js");

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/", async (req, res) => {
  const trancactions = await Purchase.find();
  res.status(200).json(trancactions);
});

router.post("/", authToken, async (req, res) => {
  // get varables;
  const user = req.user;
  const userId = user._id;
  const { productId, amount } = req.body;
  let totalCost;
  try {
    if (!productId || !amount || typeof amount !== "number" || amount < 0)
      throw new Error(
        "Invalid request body: Please provide a valid product ID and positive amount."
      );

    if (!user || user.role !== "buyer")
      throw new Error("Unauthorized access: Only buyers can purchase products");

    // Find the product in database and validate
    let product;
    try {
      product = await products.findById(productId);
    } catch (err) {
      throw new Error("Product not found: ");
    }
    if (product.stock < amount) throw new Error("out of stock");

    // calculate total cost
    totalCost = product.cost * amount;
    console.log(`deposit: ${user.deposit}`);
    if (user.deposit < totalCost)
      throw new Error("Not enough balance in your account");

    const timeStamp = Date();
    await Promise.all([
      // update product tabel
      products.findByIdAndUpdate(
        productId,
        { $inc: { stock: -amount } },
        { new: true }
      ),
      // Create purchase row
      Purchase.create({ userId, productId, amount, totalCost, timeStamp }),
    ]);

    // update user with new amount
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $inc: { deposit: -totalCost } },
      { new: true }
    );
    // calculate change
    console.log(updatedUser.deposit, totalCost);
    const change = updatedUser.deposit - totalCost;
    console.log("change " + change);
    const coinChange = calcChange(change);
    console.log(coinChange);
    // send response
    res.status(200).json({
      message: "Purchase completed successfully!",
      totalSpent: totalCost,
      productsPurchased: [{ name: product.name, amount }],
      change: coinChange,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
