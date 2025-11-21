const AppError = require("../../utils/AppError");
const userModel = require("../../model/userModel");
const invoiceModel = require("../../model/invoiceModel");

const invoice = async (req, res, next) => {
  try {
    const payload = req.body;

    console.log("SYTEMAP Signup Webhook:", payload);

    const TransactionId = payload.TransactionId;

    const tx = await invoiceModel.findOne({ TransactionId });

    if (tx) {
      console.log("Duplicate Transaction → Already processed");
      return res.status(200).json({ status: "duplicate" });
    }

    let user = null;

    // fetch user sytemap userId
    if (payload.UserId) {
      user = await userModel.findOne({ sytemapUserId: payload.UserId });
    }

    await invoiceModel.create({
      userId: user?._id || null,
      PropertyName: payload.PropertyName || "Lush Estate",
      TransactionId,
      PropertyPrice: payload.PropertyPrice || 0,
      sytemapUserId: payload.UserId,
      rawData: payload,
    });

    // Always respond immediately with 200 so SYTEMAP considers webhook successful
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("SYTEMAP Invoice Webhook Error:", error);
    return next(new AppError("Internal Server Error", 500));
  }
};

module.exports = invoice;
