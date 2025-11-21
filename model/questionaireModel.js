const mongoose = require("mongoose");

const questionaireSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [
      {
        text: { type: String, required: true }, // e.g. "Option A"
        points: { type: Number, required: true }, // e.g. 10 points
      },
    ],
  },
  {
    timestamps: true,
  }
);

const questionaireModel = mongoose.model("questionaire", questionaireSchema);

module.exports = questionaireModel;
