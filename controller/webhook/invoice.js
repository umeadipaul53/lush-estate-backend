const AppError = require("../../utils/AppError");
const userModel = require("../../model/userModel");
const invoiceModel = require("../../model/invoiceModel");

const invoice = async (req, res, next) => {
  try {
    const payload = req.body;

    if (!payload || Object.keys(payload).length === 0) {
      console.log("⚠️ Empty webhook payload received");
      return res.status(200).json({ status: "ok" });
    }

    console.log("====== SYTEMAP WEBHOOK RECEIVED ======");
    console.log("Headers:", req.headers);
    console.log("Payload:", payload);
    console.log("=======================================");

    const TransactionId = payload.TransactionId;

    if (!TransactionId) {
      console.log("⚠️ Missing TransactionId → Ignoring webhook");
      return res.status(200).json({ status: "ok" });
    }

    // Check duplicate invoice
    const existingTx = await invoiceModel.findOne({ TransactionId });

    if (existingTx) {
      console.log("🔁 Duplicate Transaction → Already processed");
      return res.status(200).json({ status: "ok" });
    }

    // Find user via sytemapUserId if available
    let user = null;
    if (payload.UserId) {
      user = await userModel.findOne({ sytemapUserId: payload.UserId });
    }

    // Create invoice
    await invoiceModel.create({
      userId: user?._id || null,
      PropertyName: payload.PropertyName || "Lush Estate",
      PropertyPrice: payload.PropertyPrice || 0,
      TransactionId: payload.TransactionId,
      sytemapUserId: payload.UserId || null,
      rawData: payload,
    });

    console.log("✅ Invoice saved successfully");

    // SYTEMAP must always get 200 OK
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("❌ SYTEMAP Invoice Webhook Error:", error);
    // Still return 200 because webhooks should not be retried due to server-side error
    return res.status(200).json({ status: "ok" });
  }
};

module.exports = invoice;
