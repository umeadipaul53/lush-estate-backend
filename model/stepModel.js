const mongoose = require("mongoose");

const userStepProgressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    estate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      required: true,
    },
    completedSteps: [
      {
        step: { type: Number, required: true },
        completedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

userStepProgressSchema.index({ user: 1, step: 1 }, { unique: true }); // ensures one record per step per user

const userStepProgressModel = mongoose.model(
  "UserStepProgress",
  userStepProgressSchema
);

module.exports = { userStepProgressModel };
