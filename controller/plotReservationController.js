const { plotModel } = require("../model/estateModel");
const AppError = require("../utils/AppError");
const userModel = require("../model/userModel");

const plotReservation = async (req, res, next) => {
  try {
    const { selectedPlots, paymentPlan } = req.body;
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) return next(new AppError("Account not found", 404));

    const reservedPlots = [];

    for (const plotNumber of selectedPlots) {
      const checkPlot = await plotModel.findOne({ plotNumber });

      if (!checkPlot)
        return next(
          new AppError(
            `Plot ${plotNumber} does not exist, kindly select another plot`,
            404
          )
        );

      if (checkPlot.status !== "available")
        return next(
          new AppError(
            `Plot ${plotNumber} has been reserved or sold already, kindly select another plot`,
            400
          )
        );

      checkPlot.buyer = {
        userId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        paymentPlan: paymentPlan,
      };

      checkPlot.status = "reserved";
      reservedPlots.push(checkPlot);
    }

    await Promise.all(reservedPlots.map((plot) => plot.save()));

    user.reserveStatus = "completed";
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Plots reserved successfully",
      data: reservedPlots,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = plotReservation;
