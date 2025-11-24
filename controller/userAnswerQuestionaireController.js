const userQuestionaire = require("../model/userQuestionaireModel");
const questionaireModel = require("../model/questionaireModel");
const userModel = require("../model/userModel");
const AppError = require("../utils/AppError");
const { estateModel } = require("../model/estateModel");

const answerQuestionaire = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { questionsIdArray, answersArray, estateId } = req.body;

    // Validate arrays
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

    // Check user
    const user = await userModel.findById(userId);
    if (!user) return next(new AppError("Account not found", 404));

    // Check estate
    const estate = await estateModel.findById(estateId);
    if (!estate) return next(new AppError("Estate not found", 404));

    // 🔐 PREVENT MULTIPLE SUBMISSIONS
    const existingSubmission = await userQuestionaire.findOne({
      userId,
      estateId,
    });

    if (existingSubmission) {
      return next(
        new AppError(
          "You have already submitted the questionnaire for this estate",
          400
        )
      );
    }

    // Fetch all questions
    const questions = await questionaireModel.find({
      _id: { $in: questionsIdArray },
      estateId: estateId,
    });

    if (questions.length !== questionsIdArray.length) {
      return next(new AppError("One or more questions not found", 404));
    }

    const responses = [];
    let totalScore = 0;

    for (let i = 0; i < questionsIdArray.length; i++) {
      const questionId = questionsIdArray[i];
      const answerText = answersArray[i].text;

      const question = questions.find((q) => q._id.toString() === questionId);

      const matchedOption = question.options.find(
        (opt) => opt.text === answerText
      );

      if (!matchedOption) {
        return next(
          new AppError(
            `Invalid answer for "${question.questionText}". Option "${answerText}" does not exist.`,
            400
          )
        );
      }

      responses.push({
        questionId,
        selectedAnswer: {
          text: matchedOption.text,
          points: matchedOption.points,
        },
      });

      totalScore += matchedOption.points;
    }

    // Save questionnaire answers
    const saved = await userQuestionaire.create({
      userId,
      estateId,
      responses,
      totalScore,
    });

    // Update user currentSteps -> queStatus
    const foundCurrent = user.currentSteps.find(
      (item) => item.estateId.toString() === estateId
    );

    if (!foundCurrent) {
      return next(
        new AppError(
          "Estate questionnaire status not found in user's progress",
          404
        )
      );
    }

    foundCurrent.queStatus = "completed";
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Answers submitted successfully",
      totalScore,
      data: saved,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = answerQuestionaire;
