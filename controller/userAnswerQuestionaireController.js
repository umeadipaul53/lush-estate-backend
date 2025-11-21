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

    // Fetch all questions at once
    const questions = await questionaireModel.find({
      _id: { $in: questionsIdArray },
    });

    if (questions.length !== questionsIdArray.length) {
      return next(new AppError("One or more questions not found", 404));
    }

    const responses = [];
    let totalScore = 0;

    for (let i = 0; i < questionsIdArray.length; i++) {
      const questionId = questionsIdArray[i];
      const selectedAnswerText = answersArray[i].text;

      const question = questions.find((q) => q._id.toString() === questionId);

      const matchedOption = question.options.find(
        (opt) => opt.text === selectedAnswerText
      );

      if (!matchedOption) {
        return next(
          new AppError(
            `Invalid answer for question "${question.questionText}". Selected answer "${selectedAnswerText}" is not among the valid options.`,
            400
          )
        );
      }

      const selectedAnswer = {
        text: matchedOption.text,
        points: matchedOption.points,
      };

      totalScore += matchedOption.points;

      responses.push({
        questionId,
        selectedAnswer,
      });
    }

    // Save or update user responses in userQuestionaire
    const saved = await userQuestionaire.findOneAndUpdate(
      { userId },
      { responses, totalScore },
      { new: true, upsert: true }
    );

    user.queStatus = "completed";
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Answers submitted successfully",
      data: saved,
      totalScore,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = answerQuestionaire;
