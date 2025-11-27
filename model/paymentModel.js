const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true,
    },

    PropertyName: { type: String, required: true },

    // Store consistently as NUMBER
    PropertyId: {
      type: Number,
      required: true,
      index: true,
    },

    EstateName: { type: String, required: true },
    EstateId: { type: String, required: true },

    AmountPending: { type: Number, required: true },
    PropertyPrice: { type: Number, required: true },
    NumberOfProperty: { type: Number, required: true },

    AccountStatus: { type: String, required: true },
    PaymentType: { type: String, required: true },

    payments: [
      {
        _id: false,
        TransactionId: { type: String, required: true },
        AmountPaid: { type: Number, required: true },
        PaymentCurrency: { type: String, required: true },
        PaymentMode: { type: String, required: true },
        paidAt: { type: Date, default: Date.now },
      },
    ],

    sytemapUserId: {
      type: Number,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Parent record duplicate prevention
paymentSchema.index({ sytemapUserId: 1, PropertyId: 1 }, { unique: true });

// Speed up searches by TransactionId inside payments[]
paymentSchema.index({ "payments.TransactionId": 1 });

const paymentModel = mongoose.model("payment", paymentSchema);
module.exports = paymentModel;
