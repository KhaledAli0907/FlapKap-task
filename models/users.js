const mongo = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongo.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    // minlength: 8,
  },
  deposit: {
    type: Number,
    default: 0,
    min: 0,
  },
  role: {
    type: String,
    enum: ["seller", "buyer"],
    default: "buyer",
  },
});

userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();

  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

module.exports = mongo.model("User", userSchema);
