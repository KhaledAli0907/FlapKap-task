require("dotenv").config();

// imports
const morgan = require("morgan");
const express = require("express");
const mongoose = require("mongoose");
const port = 5500;

// modules
const User = require("./models/users.js");

// Routes
const userRoutes = require("./routers/userRoutes.js");
const productRoutes = require("./routers/productRoutes.js");
const depositRoutes = require("./routers/depositRoute.js");
const loginRoute = require("./routers/loginRoute.js");
const buyRoute = require("./routers/buyRoute.js");

// functions
const authToken = require("./controllers/auth.js");
const log = require("console").log;
const app = express();

// connect to database
mongoose
  .connect("mongodb://localhost:27017")
  .then(() => console.log("DB Connected Successfully"))
  .catch((err) => console.log(`somehting went wrong with db ${err}`));

// express middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));

// routes
app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/deposit", depositRoutes);
app.use("/login", loginRoute);
app.use("/buy", buyRoute);

app.use((err, req, res, next) => {
  const statusCode = err?.statusCode || 500;
  res.status(statusCode).send({
    statusCode,
    message: err?.message || "internal server error",
    errors: err?.errors || [],
  });
});

app.post("/reset/:id", authToken, async (req, res) => {
  // validate user
  if (req.user.role !== "buyer" || req.user._id !== req.params.id)
    return res.status(403).json({ message: "login with the correct buyer" });

  const userId = req.user._id;
  // update user set deposit to 0
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { deposit: 0 },
    { new: true }
  );

  // return error if User not found or there's a problem in the update
  if (!updatedUser)
    return res.status(404).json({ message: "can't update user" });

  res.status(200).json({ message: "deposit reseted successfully" });
});

app.listen(port, () => {
  console.log(`Vendor API listening on port ${port}`);
});
