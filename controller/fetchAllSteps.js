const { stepModel } = require("../model/stepModel");
const AppError = require("../utils/AppError");

const fetchAllStep = async (req, res, next) => {
  try {
    const steps = await stepModel.find();

    if (steps.length === 0) {
      return next(new AppError("No steps found", 404));
    }

    res.status(200).json({
      message: "All steps fetched successfully",
      data: {
        totalSteps: steps.length,
        steps, // return all steps
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchAllStep;
