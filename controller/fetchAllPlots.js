const { plotModel } = require("../model/estateModel");
const AppError = require("../utils/AppError");

const fetchAllPlots = async (req, res, next) => {
  try {
    const plots = await plotModel.find();

    if (plots.length === 0) {
      return next(new AppError("No Plots found", 404));
    }

    res.status(200).json({
      message: "All Plots fetched successfully",
      data: {
        totalPlots: plots.length,
        plots, // return all plots
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchAllPlots;
