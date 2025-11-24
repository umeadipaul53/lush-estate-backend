const mongoose = require("mongoose");

const userQuestionaireSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    estateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estate",
      required: true,
    },
    responses: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "questionaire",
          required: true,
        },
        selectedAnswer: {
          text: { type: String, required: true },
          points: { type: Number, required: true },
        },
      },
    ],
    totalScore: { type: Number, required: true, default: 0, min: 0 },
  },
  {
    timestamps: true,
  }
);

// Optional: index for faster user lookups
userQuestionaireSchema.index({ userId: 1 });

const userQuestionaire = mongoose.model(
  "userResponses",
  userQuestionaireSchema
);

module.exports = userQuestionaire;
