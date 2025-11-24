const userModel = require("../model/userModel");
const { stepModel, userStepProgressModel } = require("../model/stepModel");
const AppError = require("../utils/AppError");

const completeStep = async (req, res, next) => {
  try {
    const stepNumber = Number(req.params.stepNumber);
    if (isNaN(stepNumber)) {
      return next(new AppError("Invalid step number", 400));
    }

    const email = req.user.email;
    const estateId = req.body.estateId;

    if (!estateId) {
      return next(new AppError("estateId is required in request body", 400));
    }

    const user = await userModel.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    const step = await stepModel.findOne({ stepNumber });
    if (!step) return next(new AppError(`Step ${stepNumber} not found`, 404));

    // Find or create user progress for this estate
    let progress = await userStepProgressModel.findOne({
      user: user._id,
      estate: estateId,
    });

    if (!progress) {
      progress = await userStepProgressModel.create({
        user: user._id,
        estate: estateId,
        completedSteps: [],
      });
    }

    // Check if this step is already completed
    const alreadyCompleted = progress.completedSteps.some(
      (s) => s.step.toString() === step._id.toString()
    );

    if (alreadyCompleted) {
      return res.status(200).json({
        status: "success",
        message: `Step ${stepNumber} already completed.`,
        data: {
          nextStep:
            user.currentStep <= stepNumber ? stepNumber + 1 : user.currentStep,
          finalStep: user.stepStatus === "completed",
        },
      });
    }

    // Prevent skipping steps
    if (user.currentStep !== stepNumber) {
      return next(
        new AppError(`You must complete step ${user.currentStep} first.`, 400)
      );
    }

    // Mark this step as completed
    progress.completedSteps.push({
      step: step._id,
      completedAt: new Date(),
    });
    await progress.save();

    // Move to the next step
    const nextStep = await stepModel.findOne({ stepNumber: stepNumber + 1 });

    if (nextStep) {
      user.currentStep = nextStep.stepNumber;
      await user.save();

      return res.status(201).json({
        status: "success",
        message: `Step ${stepNumber} completed. Next step activated.`,
        data: {
          nextStep: nextStep.stepNumber,
          finalStep: false,
        },
      });
    }

    // No more steps — journey completed
    user.currentStep = stepNumber;
    user.stepStatus = "completed";
    await user.save();

    return res.status(200).json({
      status: "success",
      message: "All steps completed. Journey complete.",
      data: { nextStep: null, finalStep: true },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = completeStep;
