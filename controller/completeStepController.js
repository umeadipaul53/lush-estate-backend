const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const { userStepProgressModel } = require("../model/stepModel");
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
      return next(new AppError("estateId is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(estateId)) {
      return next(new AppError("Invalid estateId format", 400));
    }

    const user = await userModel.findOne({ email });
    if (!user) return next(new AppError("User not found", 404));

    const foundCurrent = user.currentSteps.find(
      (item) => item.estateId.toString() === estateId.toString()
    );

    if (!foundCurrent) {
      return next(new AppError("Estate current step not found for user", 404));
    }

    let currentStepValue = foundCurrent.currentStep;
    let stepStatusValue = foundCurrent.stepStatus;

    const estate = await estateModel.findById(estateId);
    if (!estate) return next(new AppError("Estate doesnt exist", 404));

    const step = estate.steps.find((s) => s.stepNumber === stepNumber);
    if (!step) return next(new AppError(`Step ${stepNumber} not found`, 404));

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

    if (currentStepValue !== stepNumber) {
      return next(
        new AppError(`You must complete step ${currentStepValue} first.`, 400)
      );
    }

    progress.completedSteps.push({
      step: stepNumber,
      completedAt: new Date(),
    });
    await progress.save();

    const newStep = stepNumber + 1;
    const nextStep = estate.steps.find((s) => s.stepNumber === newStep);

    if (nextStep) {
      foundCurrent.currentStep = nextStep.stepNumber;
      foundCurrent.stepStatus = "pending";
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

    foundCurrent.currentStep = stepNumber;
    foundCurrent.stepStatus = "completed";
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
