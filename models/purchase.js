const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  productId: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
  },
  totalCost: {
    type: Number,
  },
  timeStamp: {
    type: String,
  },
});

module.exports = mongoose.model("Purchase", purchaseSchema);
