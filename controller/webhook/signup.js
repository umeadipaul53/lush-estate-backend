const AppError = require("../../utils/AppError");
const userModel = require("../../model/userModel");

const signup = async (req, res, next) => {
  try {
    const payload = req.body;

    console.log("SYTEMAP Signup Webhook:", payload);

    const name = `${payload.Firstname} ${payload.Lastname}`;
    const email = payload.Email;

    // Check if user already exists
    let user = await userModel.findOne({ email });

    if (!user) {
      // Create new user
      user = await userModel.create({
        sytemapUserId: payload.BaseUserId,
        name,
        phone: payload.Mobile,
        email,
        currentStep: 1,
      });
    } else {
      // If user exists but sytemapUserId missing → update it
      if (!user.sytemapUserId) {
        user.sytemapUserId = payload.BaseUserId;
        await user.save();
      }
    }

    // Always respond immediately with 200 so SYTEMAP considers webhook successful
    return res.status(200).json({ status: "ok" });
  } catch (error) {
    console.error("SYTEMAP Signup Webhook Error:", error);
    return next(new AppError("Internal Server Error", 500));
  }
};

module.exports = signup;
