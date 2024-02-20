/* eslint-disable no-undef */
const express = require("express");
const User = require("../models/users.js");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.post("/", async (req, res) => {
  const username = req.body.username;
  const user = await User.findOne({ username: username }).lean();

  if (user == null)
    return res.status(400).json({ message: "Can not find user" });

  try {
    const isCorrectPass = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (isCorrectPass) {
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);

      res
        .json({ accessToken: accessToken, message: "successful login" })
        .status(200);
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (err) {
    res.status(500).json(err.message);
  }
});

module.exports = router;
