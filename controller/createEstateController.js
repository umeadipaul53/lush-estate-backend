const AppError = require("../utils/AppError");
const { estateModel } = require("../model/estateModel");

const createEstate = async (req, res, next) => {
  try {
    const { name, numberOfPlots } = req.body;

    // Basic input validation
    if (!name || !numberOfPlots) {
      return next(new AppError("Name and numberOfPlots are required", 400));
    }

    // Check if estate already exists
    const existingEstate = await estateModel.findOne({ name });

    if (existingEstate) {
      return next(
        new AppError(
          "This estate already exists and plots have been created",
          409
        )
      );
    }

    // Create new estate
    const newEstate = await estateModel.create({ name, numberOfPlots });

    // Send success response
    res
      .status(201)
      .json({ message: "Estate created successfully", data: newEstate });
  } catch (error) {
    next(error);
  }
};

module.exports = createEstate;
