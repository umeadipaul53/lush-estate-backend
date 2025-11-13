const userModel = require("../model/userModel");
const crypto = require("crypto");
const { stepModel } = require("../model/stepModel");
const tokenModel = require("../model/tokenModel");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/tokens");
const AppError = require("../utils/AppError");

const isProduction = process.env.NODE_ENV === "production";

const startJourney = async (req, res, next) => {
  try {
    const { email, name, phone } = req.body;

    if (!email) return next(new AppError("Email is required", 400));

    let user = await userModel.findOne({ email });
    let isNewUser = false;

    // 🧩 If user doesn’t exist → create it
    if (!user) {
      user = await userModel.create({
        email,
        name: name || "",
        phone: phone || "",
        currentStep: 1,
      });
      isNewUser = true;
    } else if (name && phone) {
      // 🧩 If user exists and frontend sent name + phone → update details

      if (phone !== user.phone) {
        const existingPhone = await userModel.findOne({ phone });
        if (existingPhone) {
          return next(new AppError("Phone number already exists", 400));
        }
      }

      user.name = name;
      user.phone = phone;
      await user.save();
    }

    // 🔐 Generate tokens
    const tokenId = crypto.randomUUID();
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, tokenId);

    await tokenModel.create({
      tokenId,
      token: refreshToken,
      userId: user._id,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 🧩 Get current step
    const step = await stepModel.findOne({ stepNumber: user.currentStep });
    if (!step) return next(new AppError("Step not found", 404));

    // 🧭 Build journey response flags
    let isStep = false;
    let isReserve = false;
    let isQuestion = false;

    if (user.queStatus === "completed") {
      isStep = true;
      isReserve = true;
      isQuestion = true;
    } else if (user.reserveStatus === "completed") {
      isStep = true;
      isReserve = true;
      isQuestion = false;
    } else if (user.stepStatus === "completed") {
      isStep = true;
      isReserve = false;
      isQuestion = false;
    }

    return res.status(200).json({
      message: `Welcome ${user.name || ""}`,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isStep,
        isReserve,
        isQuestion,
        step,
        isNewUser,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = startJourney;
