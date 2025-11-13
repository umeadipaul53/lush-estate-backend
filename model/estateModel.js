const mongoose = require("mongoose");

// --- Plot Schema ---
const plotSchema = new mongoose.Schema(
  {
    estate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      required: true,
    },
    plotNumber: {
      type: Number,
      required: true,
    },
    buyer: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: null,
      },
      name: { type: String, default: null },
      phone: { type: String, default: null },
      email: { type: String, default: null },
      address: { type: String, default: null },
      paymentPlan: {
        type: String,
        enum: ["Full Payment", "3 months", "6 months", "12 months"],
        default: null,
      },
    },
    plotSize: {
      type: Number,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ["available", "reserved", "sold"],
      default: "available",
    },
  },
  { timestamps: true }
);

const plotModel = mongoose.model("Plot", plotSchema);

// --- Estate Schema ---
const estateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    numberOfPlots: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { timestamps: true }
);

// --- Auto-generate plots after estate is saved ---
estateSchema.post("save", async function (doc, next) {
  try {
    const plots = [];
    for (let i = 1; i <= doc.numberOfPlots; i++) {
      plots.push({ estate: doc._id, plotNumber: i });
    }
    await plotModel.insertMany(plots);
    next();
  } catch (err) {
    console.error("Error generating plots:", err);
    next(err);
  }
});

const estateModel = mongoose.model("Estate", estateSchema);

module.exports = { estateModel, plotModel };
