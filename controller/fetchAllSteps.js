const { estateModel } = require("../model/estateModel");
const AppError = require("../utils/AppError");

const fetchAllStep = async (req, res, next) => {
  try {
    const { estateId } = req.params; // FIXED

    const estate = await estateModel.findById(estateId);
    if (!estate) return next(new AppError("Estate not found", 404));

    if (!estate.steps || estate.steps.length === 0) {
      return next(new AppError("No steps found for this estate", 404));
    }

    res.status(200).json({
      message: "All steps fetched successfully",
      data: {
        totalSteps: estate.steps.length,
        steps: estate.steps,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchAllStep;
