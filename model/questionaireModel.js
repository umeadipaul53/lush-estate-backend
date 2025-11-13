const mongoose = require("mongoose");

const questionaireSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [{ type: String }], // e.g. ["A", "B", "C", "D"]
  },
  {
    timestamps: true,
  }
);

const questionaireModel = mongoose.model("questionaire", questionaireSchema);

module.exports = questionaireModel;
