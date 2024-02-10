const express = require("express");
const User = require("../models/users.js");
const router = express.Router();
const authToken = require("../controllers/auth");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/", authToken, async (req, res) => {
  // if user isn't buyer early return with error
  if (req.user.role !== "buyer")
    return res
      .status(401)
      .json({ message: "only buyers are allowed to deposit" });

  // get id from request
  const userId = req.user._id;
  let coinsObj;
  try {
    // get the coins array from th body
    const validCoins = [5, 10, 20, 50, 100];
    coinsObj = req.body.coins;

    // if the body is empty or not an array throw an error
    if (!coinsObj || !Array.isArray(coinsObj))
      throw new Error("Invalid request body: coins must be an array");

    // if elemn't of array not numbers or positive numbers throw an error
    if (!coinsObj.every((coin) => typeof coin === "number" && coin > 0))
      throw new Error("all coins must be non negative numbers");

    // if every coin not valid throw an error
    if (!coinsObj.every((coin) => validCoins.includes(coin)))
      throw new Error(
        "Invalid coin denominations. Only 5, 10, 20, 50, and 100 cent coins are accepted."
      );
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  // calculate total amount
  const totalAmount = coinsObj.reduce((sum, coin) => sum + coin, 0);
  // update this user with with total amount
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { deposit: totalAmount } },
      { new: true }
    );
    // if user not found send error
    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    // else send success message
    res
      .status(200)
      .json({ message: `Deposit: ${totalAmount} cents successfully` });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error updating user deposit\nerror: ${err.message}` });
  }
});

module.exports = router;
