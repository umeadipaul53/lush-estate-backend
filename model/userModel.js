const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    sytemapUserId: {
      type: Number,
      unique: true,
      sparse: true,
    },
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    stepStatus: {
      type: String,
      required: true,
      enum: ["completed", "pending"],
      default: "pending",
    },
    reserveStatus: {
      type: String,
      required: true,
      enum: ["completed", "pending"],
      default: "pending",
    },
    queStatus: {
      type: String,
      required: true,
      enum: ["completed", "pending"],
      default: "pending",
    },
    currentStep: { type: Number, default: 1 }, // Tracks progress
    role: {
      type: String,
      required: true,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
