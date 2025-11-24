const userModel = require("../model/userModel");
const { stepModel, userStepProgressModel } = require("../model/stepModel");
const AppError = require("../utils/AppError");
const { estateModel } = require("../model/estateModel");

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

    // 5️⃣ GET CURRENT STEP FOR THIS ESTATE
    const foundCurrent = user.currentSteps.find(
      (item) => item.estateId.toString() === estateId
    );

    if (!foundCurrent)
      return next(new AppError("Estate current step not found for user", 404));

    const estateIdValue = foundCurrent?.estateId;
    const currentStepValue = foundCurrent?.currentStep;
    const stepStatusValue = foundCurrent?.stepStatus;

    const estate = await estateModel.findById(estateId);
    if (!estate) return next(new AppError("Estate doesnt exist", 404));

    const step = estate.steps.find((s) => s.stepNumber === stepNumber);
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
      (s) => s.step === stepNumber
    );

    if (alreadyCompleted) {
      return res.status(200).json({
        status: "success",
        message: `Step ${stepNumber} already completed.`,
        data: {
          nextStep:
            currentStepValue <= stepNumber ? stepNumber + 1 : currentStepValue,
          finalStep: stepStatusValue === "completed",
        },
      });
    }

    // Prevent skipping steps
    if (currentStepValue !== stepNumber) {
      return next(
        new AppError(`You must complete step ${stepStatusValue} first.`, 400)
      );
    }

    // Mark this step as completed
    progress.completedSteps.push({
      step: stepNumber,
      completedAt: new Date(),
    });
    await progress.save();

    // Move to the next step
    const newStep = stepNumber + 1;
    const nextStep = estate.steps.find((s) => s.stepNumber === newStep);

    if (nextStep) {
      currentStepValue = nextStep.stepNumber;
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
    currentStepValue = stepNumber;
    stepStatusValue = "completed";
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
