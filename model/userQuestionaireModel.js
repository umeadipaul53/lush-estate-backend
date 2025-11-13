const mongoose = require("mongoose");

const userQuestionaireSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  responses: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questionaire",
        required: true,
      },
      selectedAnswer: String,
    },
  ],
});

const userQuestionaire = mongoose.model(
  "userResponses",
  userQuestionaireSchema
);

module.exports = userQuestionaire;
