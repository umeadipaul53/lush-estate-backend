const mongoose = require("mongoose");

const stepSchema = new mongoose.Schema(
  {
    stepNumber: { type: Number, unique: true },
  },
  { timestamps: true }
);

stepSchema.pre("save", async function (next) {
  if (this.isNew && !this.stepNumber) {
    const lastStep = await mongoose
      .model("steps")
      .findOne()
      .sort({ stepNumber: -1 });
    this.stepNumber = lastStep ? lastStep.stepNumber + 1 : 1;
  }
  next();
});

const stepModel = mongoose.model("steps", stepSchema);

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
        step: { type: mongoose.Schema.Types.ObjectId, ref: "steps" },
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

module.exports = { stepModel, userStepProgressModel };
