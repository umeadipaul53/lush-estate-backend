const mongoose = require("mongoose");

const purchaseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    amount: { type: Number, required: true },
    paymentProofUrl: { type: String, required: true },
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const purchaseModel = mongoose.model("purchase", purchaseSchema);

module.exports = purchaseModel;
