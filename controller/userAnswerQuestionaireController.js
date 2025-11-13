const userQuestionaire = require("../model/userQuestionaireModel");
const questionaireModel = require("../model/questionaireModel");
const userModel = require("../model/userModel");
const AppError = require("../utils/AppError");

const answerQuestionaire = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questionsIdArray, answersArray } = req.body;

    // Validate input lengths
    if (!Array.isArray(questionsIdArray) || !Array.isArray(answersArray)) {
      return next(
        new AppError("questionsIdArray and answersArray must be arrays", 400)
      );
    }

    if (questionsIdArray.length !== answersArray.length) {
      return next(
        new AppError("questionsIdArray and answersArray length must match", 400)
      );
    }

    // Check user existence
    const user = await userModel.findById(userId);
    if (!user) return next(new AppError("Account not found", 404));

    const responses = [];

    for (let i = 0; i < questionsIdArray.length; i++) {
      const questionId = questionsIdArray[i];
      const selectedAnswer = answersArray[i];

      // Fetch the question
      const question = await questionaireModel.findById(questionId);
      if (!question) {
        return next(
          new AppError(`Question with ID ${questionId} not found`, 404)
        );
      }

      // Validate that the selected answer is one of the available options
      if (!question.options.includes(selectedAnswer)) {
        return next(
          new AppError(
            `Invalid answer for question "${question.questionText}". Selected answer "${selectedAnswer}" is not among the valid options.`,
            400
          )
        );
      }

      responses.push({
        questionId,
        selectedAnswer,
      });
    }

    // Save or update user responses in userQuestionaire
    const saved = await userQuestionaire.create({
      userId,
      responses,
    });

    user.queStatus = "completed";
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Answers submitted successfully",
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = answerQuestionaire;
