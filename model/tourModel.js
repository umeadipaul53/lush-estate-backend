const mongoose = require("mongoose");

const tourRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    estateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["pending", "attended"],
      default: "pending", // fallback
    },
  },
  { timestamps: true }
);

const tourRequestModel = mongoose.model("tourRequest", tourRequestSchema);

module.exports = tourRequestModel;
