const AppError = require("../utils/AppError");
const questionaireModel = require("../model/questionaireModel");
const { estateModel } = require("../model/estateModel");

const createQuestion = async (req, res, next) => {
  try {
    const { questionText, options, estateId } = req.body;

    // 🔍 Validate question text
    if (!questionText || typeof questionText !== "string") {
      return next(new AppError("Question text is required", 400));
    }

    // 🔍 Validate estate ID
    if (!estateId) {
      return next(new AppError("Estate ID is required", 400));
    }

    const estate = await estateModel.findById(estateId);
    if (!estate) return next(new AppError("Estate not found", 404));

    // 🔍 Validate options
    if (!Array.isArray(options) || options.length === 0) {
      return next(
        new AppError(
          "Options must be a non-empty array of objects with 'text' and 'points'",
          400
        )
      );
    }

    const validOptions = options.every(
      (opt) =>
        opt &&
        typeof opt.text === "string" &&
        opt.text.trim() !== "" &&
        typeof opt.points === "number"
    );

    if (!validOptions) {
      return next(
        new AppError(
          "Each option must contain 'text' (string) and 'points' (number)",
          400
        )
      );
    }

    // ❗ Prevent duplicate questions per estate
    const existing = await questionaireModel.findOne({
      questionText,
      estateId,
    });
    if (existing) {
      return next(
        new AppError("This question already exists for this estate", 400)
      );
    }

    // 📌 Create question
    const newQuestion = await questionaireModel.create({
      estateId,
      questionText,
      options,
    });

    res.status(200).json({
      message: "Question created successfully",
      data: newQuestion,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = createQuestion;
