const userModel = require("../model/userModel");
const { stepModel } = require("../model/stepModel");
const AppError = require("../utils/AppError");

const fetchUserStep = async (req, res, next) => {
  try {
    const email = req.user.email;

    const user = await userModel.findOne({ email });

    if (!user) return next(new AppError("User not found", 404));

    const step = await stepModel.findOne({ stepNumber: user.currentStep });

    res.status(200).json({
      message: "User step fetched",
      data: {
        stepDetails: step,
        currentStep: user.currentStep,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchUserStep;
