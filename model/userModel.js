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
    currentSteps: [
      {
        estateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Estate",
          required: true,
        },
        currentStep: { type: Number, default: 1 }, // Tracks progress
        stepStatus: {
          type: String,
          enum: ["completed", "pending"],
          default: "pending",
        },
        queStatus: {
          type: String,
          enum: ["completed", "pending"],
          default: "pending",
        },
        status: {
          type: String,
          required: true,
          enum: ["active", "pending"],
          default: "pending",
        },
      },
    ],

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
