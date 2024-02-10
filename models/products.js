const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (value) => Number.isInteger(value),
      message: "Amount must be an integer",
    },
  },
  cost: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: (value) => Number.isInteger(value),
      message: "Amount must be an integer",
    },
  },
});

module.exports = mongoose.model("Product", productSchema);
