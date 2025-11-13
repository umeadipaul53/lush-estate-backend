const { estateModel } = require("../model/estateModel");
const AppError = require("../utils/AppError");

const fetchAllEstates = async (req, res, next) => {
  try {
    const estates = await estateModel.find();

    if (estates.length === 0) {
      return next(new AppError("No Estate found", 404));
    }

    res.status(200).json({
      message: "All estates fetched successfully",
      data: {
        estates,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = fetchAllEstates;
