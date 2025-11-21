const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
      index: true, // 🔥 Fast user lookups
    },

    PropertyName: { type: String, required: true },
    PropertyId: {
      type: String,
      required: true,
      index: true, // 🔥 Speeds up property-based queries
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
      index: true, // 🔥 Used in most webhook queries
    },
  },
  {
    timestamps: true,
  }
);

/**
 * 🔥 Index to prevent duplicate payment entries for same user + property
 * This allows:
 * - same user → multiple payments
 * - same property → multiple users
 * - BUT prevents duplicate "payment record" for same user & property combination
 */
paymentSchema.index({ sytemapUserId: 1, PropertyId: 1 }, { unique: true });

const paymentModel = mongoose.model("payment", paymentSchema);
module.exports = paymentModel;
