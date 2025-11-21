const AppError = require("../../utils/AppError");
const userModel = require("../../model/userModel");
const paymentModel = require("../../model/paymentModel");

const payment = async (req, res, next) => {
  try {
    const payload = req.body;
    console.log("SYTEMAP Payment Webhook:", payload);

    const {
      PropertyId,
      UserId: sytemapUserId,
      TransactionId,
      AmountPaid,
      PaymentCurrency,
      PaymentMode,
    } = payload;

    // 🔍 Validate essential fields
    if (!PropertyId || !sytemapUserId || !TransactionId) {
      return next(new AppError("Invalid payload", 400));
    }

    // 🔍 Check if user exists
    const user = await userModel.findOne({ sytemapUserId });
    if (!user) return next(new AppError("UserId does not exist", 400));

    // ---------------------------------------------------
    // 🔥 FIND EXISTING PAYMENT RECORD (FAST due to indexes)
    // ---------------------------------------------------
    let paymentDoc = await paymentModel.findOne({
      sytemapUserId,
      PropertyId,
    });

    // ===================================================
    //     CASE 1: PAYMENT RECORD ALREADY EXISTS
    // ===================================================
    if (paymentDoc) {
      console.log("➡ Updating existing payment entry...");

      // Prevent duplicate TransactionId inside payments[]
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

      return res.status(200).json({ status: "ok", exists: true });
    }

    // ===================================================
    //     CASE 2: CREATE NEW PAYMENT DOCUMENT
    // ===================================================
    console.log("🆕 Creating new payment record...");

    await paymentModel.create({
      userId: user._id,
      PropertyName: payload.PropertyName,
      PropertyId: payload.PropertyId,
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

    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("SYTEMAP Payment Webhook Error:", error);

    // ---------------------------------------------------
    // 🔥 Handle duplicate compound-index errors
    // ---------------------------------------------------
    if (error.code === 11000) {
      console.log("⚠ Duplicate (user, property) record detected");
      return res.status(200).json({ status: "duplicate_parent_record" });
    }

    return next(new AppError("Internal Server Error", 500));
  }
};

module.exports = payment;
