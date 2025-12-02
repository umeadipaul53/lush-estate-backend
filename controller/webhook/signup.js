const AppError = require("../../utils/AppError");
const userModel = require("../../model/userModel");
const { estateModel } = require("../../model/estateModel");

const signup = async (req, res, next) => {
  try {
    const payload = req.body;

    console.log("====== SYTEMAP SIGNUP WEBHOOK ======");
    console.log("Headers:", req.headers);
    console.log("Body:", payload);
    console.log("=====================================");

    const name = `${payload.Firstname || ""} ${payload.Lastname || ""}`.trim();
    const email = payload.Email;
    const phone = payload.Mobile;
    const sytemapUserId = payload.BaseUserId || payload.UserId;

    if (!email || !sytemapUserId) {
      console.log("⚠️ Invalid signup payload → Ignoring webhook");
      return res.status(200).json({ status: "ok" });
    }

    // Fetch estates once (fast)
    const estates = await estateModel.find().select("_id estateName");

    if (!estates.length) {
      console.log(
        "⚠️ No estate created at this time, try again later → Ignoring webhook"
      );
      return res.status(200).json({ status: "ok" });
    }

    // ====================================================
    // 🔍 CHECK IF USER EXISTS
    // ====================================================
    let user = await userModel.findOne({ email });

    // ====================================================
    //    CASE 1 → CREATE NEW USER
    // ====================================================
    if (!user) {
      console.log("🆕 Creating new user from SYTEMAP...");

      const stepsForAllEstates = estates.map((estate) => ({
        estateId: estate._id,
        currentStep: 1,
        stepStatus: "pending",
        queStatus: "pending",
        status: "pending",
      }));

      await userModel.create({
        sytemapUserId,
        name,
        phone,
        email,
        currentSteps: stepsForAllEstates,
      });

      return res.status(200).json({ status: "ok", created: true });
    }

    // ====================================================
    //    CASE 2 → UPDATE EXISTING USER
    // ====================================================
    console.log("➡ Updating existing user...");

    // Assign missing sytemapUserId
    if (!user.sytemapUserId) {
      user.sytemapUserId = sytemapUserId;
    }

    // Add any missing estates to user.currentSteps
    const existingEstateIds = new Set(
      user.currentSteps.map((cs) => cs.estateId.toString())
    );

    estates.forEach((estate) => {
      if (!existingEstateIds.has(estate._id.toString())) {
        user.currentSteps.push({
          estateId: estate._id,
          currentStep: 1,
          stepStatus: "pending",
          queStatus: "pending",
          status: "pending",
        });
      }
    });

    await user.save();

    return res.status(200).json({ status: "ok", updated: true });
  } catch (error) {
    console.error("SYTEMAP Signup Webhook Error:", error);

    // Sytemap requires the REAL error to be returned
    return res.status(200).json({
      status: "error",
      message: error.message,
      // stack: error.stack, // Optional: comment this out if too sensitive
      raw: error.toString(),
    });
  }
};

module.exports = signup;
