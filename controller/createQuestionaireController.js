const AppError = require("../utils/AppError");
const questionaireModel = require("../model/questionaireModel");

const createQuestion = async (req, res, next) => {
  try {
    const { questionText, options } = req.body;

    // ✅ Validate input
    if (!questionText || typeof questionText !== "string") {
      return next(new AppError("Question text is required", 400));
    }

    // ✅ Optional: Prevent duplicate questions
    const existing = await questionaireModel.findOne({ questionText });
    if (existing)
      return next(new AppError("This question already exists", 400));

    if (
      !options ||
      !options.every(
        (opt) =>
          opt.text &&
          typeof opt.text === "string" &&
          typeof opt.points === "number"
      )
    )
      return next(
        new AppError(
          "Options must be an array of objects with 'text' (string) and 'points' (number)",
          400
        )
      );

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
