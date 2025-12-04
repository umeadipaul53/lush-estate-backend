const mongoose = require("mongoose");
const tourRequestModel = require("../model/tourModel");
const AppError = require("../utils/AppError");

const settleTourReq = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid tour ID format", 400));
    }

    const tour = await tourRequestModel.findById(id);

    if (!tour) {
      return next(new AppError("This tour does not exist", 404));
    }

    if (tour.status === "attended") {
      return res.status(200).json({
        status: "success",
        message: "This tour request was already marked as attended.",
      });
    }

    tour.status = "attended";
    await tour.save();

    res.status(200).json({
      status: "success",
      message: "This tour request has been processed.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = settleTourReq;
