const { stepModel } = require("../model/stepModel");
const AppError = require("../utils/AppError");

const createStep = async (req, res, next) => {
  try {
    const newStep = await stepModel.create({});

    if (!newStep) return next(new AppError("Step not created", 404));

    res.status(200).json({ message: "Step created", newStep });
  } catch (error) {
    next(error);
  }
};

module.exports = createStep;
