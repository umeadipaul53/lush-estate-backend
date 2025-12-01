const AppError = require("../utils/AppError");
const userQuestionaire = require("../model/userQuestionaireModel");
const mongoose = require("mongoose");

const checkQuestionaireAccess = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { estateId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(estateId)) {
      return next(new AppError("Invalid estateId", 400));
    }

    const checkAccess = await userQuestionaire.findOne({
      userId,
      estateId,
    });

    if (checkAccess) {
      return res.status(200).json({
        message:
          "We detected that you have submitted your questionnaire responses for this estate before and multiple submissions are not allowed.",
        proceed: false,
      });
    }

    return res.status(200).json({
      message: "Response not submitted",
      proceed: true,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = checkQuestionaireAccess;
