const express = require("express");
const User = require("../models/users.js");
const router = express.Router();
const authToken = require("../controllers/auth");

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
// router.use(morgan("tiny"));

router.get("/all", async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    if (users) res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// router.get("/:id", authToken,async (req, res) => {
//   const user = await User.findById(req.params.id);
//   res.send(user);
// });

router.get("/", authToken, async (req, res) => {
  const user = await User.findOne({ username: req.user.username });
  res.json(user);
});

// create a new user
router.post("/", async (req, res) => {
  const { username, password, role = "buyer" } = req.body;

  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const userCreated = await User.create({ username, password, role });
    if (!userCreated)
      return res.status(403).json({ message: "Can't create user" });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate username error
      res.status(409).json({ message: "Username already exists" });
    } else {
      res.status(500).json({ message: `Error creating user ${err.message}` });
    }
  }
});

// update user
router.patch("/:id", authToken, (req, res, next) => {
  if (req.params.id !== req.user._id)
    return res.status(403).json({ message: "Unauthorized User" });

  User.findByIdAndUpdate(req.params.id, {
    username: req.body.username,
  })
    .exec()
    .then((doc) => {
      if (!doc) return res.status(404).end();
      return res.status(200).json(doc);
    })
    .catch((err) => next(err));
});

router.delete("/:id", authToken, (req, res, next) => {
  // check if user is authorized
  if (req.params.id !== req.user._id)
    return res.status(403).json({ message: "Unauthorized to Delete User" });

  // delete the user
  User.findByIdAndDelete(req.params.id)
    .exec()
    .then((doc) => {
      if (!doc) return res.status(404).end();
      return res.status(200).json(doc);
    })
    .catch((err) => next(err));
});

module.exports = router;
