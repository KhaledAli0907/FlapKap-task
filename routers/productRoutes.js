const express = require("express");
const Product = require("../models/products.js");
const router = express.Router();
const authToken = require("../controllers/auth.js");

router.get("/", async (req, res) => {
  const info = await Product.find({});
  res.status(200).json(info);
});

// post new product
router.post("/", authToken, async (req, res) => {
  const { productName, stock, cost } = req.body;
  const sellerId = req.user._id;

  // if user logged in not a seller return error
  if (req.user.role !== "seller")
    return res.status(401).json({ message: "User not a seller" });

  console.log(productName, stock, cost);

  try {
    const productCreated = await Product.create({
      productName,
      sellerId,
      stock,
      cost,
    });
    if (!productCreated) throw new Error("Can not create product");
    console.log(productCreated);
    res.status(201).json({ message: "product created successfully" });
  } catch (err) {
    res.status(403).json({ message: err.message });
  }
});

// update product
router.patch("/:productId", authToken, async (req, res,next) => {
  const userId = req.user._id;
  const productId = req.params.productId;

  const product = await Product.findById(productId);
  // if logged in user not the seller to this product
  if (!product || product.sellerId.toString() !== userId)
    return res.status(403).json({
      message:
        "Unauthorized: Only this prodcut's seller can update this product",
    });

  // get the info from the request
  const {
    productName = product.productName,
    stock = product.stock,
    cost = product.cost,
  } = req.body;
  // find and update the product
  Product.findByIdAndUpdate(product.id, {
    productName,
    stock,
    sellerId: product.sellerId,
    cost,
  })
    .exec()
    .then((doc) => {
      // return error if cant complete the update
      if (!doc) return res.status(404).json({ message: "Product not found" });
      return res.status(200).json(doc);
    })
    .catch((err) => {
      next(err);
    });
});

router.delete("/:productId", authToken, async (req, res,next) => {
  const userId = req.user._id;
  const productId = req.params.productId;

  // get product data from database
  const product = await Product.findById(productId);
  // if logged in user not the seller to this product
  if (!product || product.sellerId.toString() !== userId)
    return res.status(403).json({
      message: "Unauthorized: Only this prodcut's seller can delete it",
    });

  Product.findByIdAndDelete(productId)
    .exec()
    .then((doc) => {
      if (!doc) return res.status(404).json({ message: "Product not found" });
      return res.status(200).json({ message: "Deleted Product", doc });
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;
