const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  PropertyName: { type: String, required: true },
  TransactionId: { type: String, required: true, unique: true, trim: true },
  PropertyPrice: { type: Number, required: true },
  sytemapUserId: {
    type: Number,
    required: true,
    index: true, // 🔥 Used in most webhook queries
  },
  rawData: {
    type: Object, // stores full webhook payload
  },
});

const invoiceModel = mongoose.model("invoice", invoiceSchema);

module.exports = invoiceModel;
