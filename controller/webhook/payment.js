const AppError = require("../../utils/AppError");
const userModel = require("../../model/userModel");
const paymentModel = require("../../model/paymentModel");
const estateModel = require("../../model/estateModel");

const payment = async (req, res, next) => {
  try {
    const payload = req.body;

    console.log("====== SYTEMAP PAYMENT WEBHOOK ======");
    console.log("Headers:", req.headers);
    console.log("Payload:", payload);
    console.log("=====================================");

    // Extract & normalize fields
    const {
      PropertyId,
      UserId: sytemapUserId,
      TransactionId,
      AmountPaid,
      PaymentCurrency,
      PaymentMode,
    } = payload;

    // Convert PropertyId to number always
    const normalizedPropertyId = Number(PropertyId);

    // 🔍 Validate required fields
    if (!normalizedPropertyId || !sytemapUserId || !TransactionId) {
      return next(new AppError("Invalid payload", 400));
    }

    // 🔍 Ensure user exists
    const user = await userModel.findOne({ sytemapUserId });
    if (!user) return next(new AppError("UserId does not exist", 400));

    // ---------------------------------------------------
    // 🔥 FAST: Find parent payment record
    // ---------------------------------------------------
    let paymentDoc = await paymentModel.findOne({
      sytemapUserId,
      PropertyId: normalizedPropertyId,
    });

    // ===================================================
    //   CASE 1: Parent record exists → Add new payment
    // ===================================================
    if (paymentDoc) {
      console.log("➡ Updating existing payment entry...");

      // Prevent duplicate transaction inside array
      const alreadyExists = paymentDoc.payments.some(
        (p) => p.TransactionId === TransactionId
      );

      if (!alreadyExists) {
        paymentDoc.payments.push({
          TransactionId,
          AmountPaid,
          PaymentCurrency,
          PaymentMode,
        });

        await paymentDoc.save();
      }

      return res.status(200).json({ status: "ok", updated: true });
    }

    // ===================================================
    //   CASE 2: Create a new parent payment document
    // ===================================================
    console.log("🆕 Creating new payment record...");

    await paymentModel.create({
      userId: user._id,
      PropertyName: payload.PropertyName,
      PropertyId: normalizedPropertyId,
      EstateName: payload.EstateName,
      EstateId: payload.EstateId,
      AmountPending: payload.AmountPending,
      PropertyPrice: payload.PropertyPrice,
      NumberOfProperty: payload.NumberOfProperty,
      AccountStatus: payload.AccountStatus,
      PaymentType: payload.PaymentType,
      sytemapUserId,
      payments: [
        {
          TransactionId,
          AmountPaid,
          PaymentCurrency,
          PaymentMode,
        },
      ],
    });

    return res.status(200).json({ status: "ok", created: true });
  } catch (error) {
    console.error("SYTEMAP Payment Webhook Error:", error);

    // Duplicate parent record (unique index)
    if (error.code === 11000) {
      console.log("⚠ Duplicate (user, property) parent record detected");
      return res.status(200).json({ status: "duplicate_parent_record" });
    }

    return next(new AppError("Internal Server Error", 500));
  }
};

module.exports = payment;
