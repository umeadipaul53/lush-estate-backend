const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  createdAt: { type: Date, default: Date.now, expires: "7d" }, // optional auto-expiry
});

const tokenModel = mongoose.model("authToken", tokenSchema);

module.exports = tokenModel;
