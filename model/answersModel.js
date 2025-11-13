const mongoose = require("mongoose");

const submitAnswer = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    answers: [
      {
        q_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "questionaire",
          required: true,
        },
        userAnswer: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const submitAnswerModel = mongoose.model("answers", submitAnswer);

module.exports = submitAnswerModel;
