const questionaireModel = require("../model/questionaireModel");
const AppError = require("../utils/AppError");
const { estateModel } = require("../model/estateModel");

const fetchAllQuestions = async (req, res, next) => {
  try {
    const estateId = req.params.estateId;

    if (!estateId) {
      return next(new AppError("estateId is required", 400));
    }

    // 🔍 Ensure the estate actually exists
    const estate = await estateModel.findById(estateId);
    if (!estate) {
      return next(new AppError("Estate not found", 404));
    }

    // 📝 Fetch questions
    const questions = await questionaireModel.find({ estateId });

    if (questions.length === 0) {
      return next(new AppError("No questions found for this estate", 404));
    }

    res.status(200).json({
      status: "success",
      message: "All questions for this estate fetched successfully",
      data: {
        totalQuestions: questions.length,
        questions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchAllQuestions;
