const AppError = require("../../utils/AppError");
const userModel = require("../../model/userModel");
const paymentModel = require("../../model/paymentModel");
const { estateModel } = require("../../model/estateModel");

const payment = async (req, res, next) => {
  try {
    const payload = req.body;

    console.log("====== SYTEMAP PAYMENT WEBHOOK ======");
    console.log("Headers:", req.headers);
    console.log("Payload:", payload);
    console.log("=====================================");

    // Extract body fields safely
    const {
      PropertyId,
      UserId: sytemapUserId,
      TransactionId,
      AmountPaid,
      PaymentCurrency,
      PaymentMode,
    } = payload || {};

    // Convert to number safely
    const normalizedPropertyId = Number(PropertyId);

    // Validate essential fields
    if (!normalizedPropertyId || !sytemapUserId || !TransactionId) {
      console.log("⚠️ Invalid payload → Missing essential fields");
      return res.status(200).json({ status: "ok" });
    }

    // Ensure user exists
    const user = await userModel.findOne({ sytemapUserId: sytemapUserId });
    if (!user) {
      console.log("⚠️ User not found → Ignoring webhook");
      return res.status(200).json({ status: "ok" });
    }

    // Look for existing (user + property) payment record
    let paymentDoc = await paymentModel.findOne({
      sytemapUserId: sytemapUserId,
      PropertyId: normalizedPropertyId,
    });

    // ============================================
    // CASE 1: Parent record exists → Append payment
    // ============================================
    if (paymentDoc) {
      console.log("➡ Updating existing payment entry...");

      // Ensure payments array exists
      if (!Array.isArray(paymentDoc.payments)) {
        paymentDoc.payments = [];
      }

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

        paymentDoc.AmountPending = payload.AmountPending;

        await paymentDoc.save();
      }

      return res.status(200).json({ status: "ok", updated: true });
    }

    // ============================================
    // CASE 2: Create new parent payment entry
    // ============================================
    console.log("🆕 Creating new payment record...");

    await paymentModel.create({
      userId: user._id,
      PropertyName: payload.PropertyName,
      PropertyId: normalizedPropertyId,
      EstateName: payload.EstateName,
      EstateId: Number(payload.EstateId),
      AmountPending: payload.AmountPending,
      PropertyPrice: payload.PropertyPrice,
      NumberOfProperty: payload.NumberOfProperty,
      AccountStatus: payload.AccountStatus,
      PaymentType: payload.PaymentType,
      sytemapUserId: sytemapUserId,
      payments: [
        {
          TransactionId,
          AmountPaid,
          PaymentCurrency,
          PaymentMode,
        },
      ],
    });

    // Update user step if estate exists
    const findEstate = await estateModel.findOne({
      estateName: payload.EstateName,
    });

    if (!findEstate) {
      console.log("⚠️ Estate not found → Skipping step update");
      return res.status(200).json({ status: "ok", created: true });
    }

    const estateId = findEstate._id;

    const foundCurrent = user.currentSteps.find(
      (item) => item.estateId.toString() === estateId.toString()
    );

    if (foundCurrent) {
      foundCurrent.status = "active";
      await user.save();
    }

    return res.status(200).json({ status: "ok", created: true });
  } catch (error) {
    console.error("SYTEMAP Payment Webhook Error:", error);

    // Handle unique index duplicate (if it exists)
    if (error.code === 11000) {
      console.log("⚠ Duplicate (user + property) parent record");
      return res.status(200).json({ status: "duplicate_parent_record" });
    }

    return next(new AppError("Internal Server Error", 500));
  }
};

module.exports = payment;
