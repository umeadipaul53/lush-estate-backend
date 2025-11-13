const AppError = require("../utils/AppError");
const questionaireModel = require("../model/questionaireModel");

const createQuestion = async (req, res, next) => {
  try {
    const { questionText, options } = req.body;

    // ✅ Optional: Prevent duplicate questions
    const existing = await questionaireModel.findOne({ questionText });
    if (existing)
      return next(new AppError("This question already exists", 400));

    const newQuestion = await questionaireModel.create({
      questionText,
      options,
    });

    if (!newQuestion)
      return next(
        new AppError("Could not save question, something went wrong", 400)
      );

    res.status(200).json({
      message: "Question created",
      data: newQuestion,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = createQuestion;
