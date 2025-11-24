const userModel = require("../model/userModel");
const { estateModel } = require("../model/estateModel");
const AppError = require("../utils/AppError");

const fetchUserStep = async (req, res, next) => {
  try {
    const email = req.user.email;
    const estateId = req.params.estateId;

    if (!estateId) {
      return next(new AppError("estateId is required", 400));
    }

    const user = await userModel.findOne({ email });

    if (!user) return next(new AppError("User not found", 404));

    if (!Array.isArray(user.currentSteps)) {
      return next(new AppError("User step progress is corrupted", 500));
    }

    // 🔎 Find user's progress for this estate
    const foundCurrent = user.currentSteps.find(
      (item) => item.estateId.toString() === estateId
    );

    if (!foundCurrent) {
      return next(new AppError("Estate current step not found for user", 404));
    }

    const { currentStep, stepStatus, queStatus } = foundCurrent;

    // 6️⃣ Fetch the estate
    const estate = await estateModel.findById(estateId);
    if (!estate) return next(new AppError("Estate not found", 404));

    // 7️⃣ Find the step data inside estate.steps
    const step = estate.steps.find((s) => s.stepNumber === currentStep);

    if (!step) return next(new AppError("Step not found", 404));

    res.status(200).json({
      status: "success",
      message: "User step fetched",
      data: {
        stepDetails: step,
        currentStep,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchUserStep;
