const questionaireModel = require("../model/questionaireModel");
const AppError = require("../utils/AppError");

const fetchAllQuestions = async (req, res, next) => {
  try {
    const questions = await questionaireModel.find();

    if (questions.length === 0) {
      return next(new AppError("No questions found", 404));
    }

    res.status(200).json({
      message: "All questions fetched successfully",
      data: {
        totalQuestions: questions.length,
        questions, // return all questions
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchAllQuestions;
