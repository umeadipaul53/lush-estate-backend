const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const crypto = require("crypto");
const tokenModel = require("../model/tokenModel");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/tokens");
const AppError = require("../utils/AppError");
const { estateModel } = require("../model/estateModel");

const isProduction = process.env.NODE_ENV === "production";

const startJourney = async (req, res, next) => {
  try {
    const { estateId, email, name, phone } = req.body;

    if (!email) return next(new AppError("Email is required", 400));
    if (!estateId) return next(new AppError("Estate ID is required", 400));

    // Validate estateId type
    if (!mongoose.Types.ObjectId.isValid(estateId)) {
      return next(new AppError("Invalid estateId", 400));
    }

    let user = await userModel.findOne({ email });
    let isNewUser = false;

    // 1️⃣ CREATE USER IF NOT EXIST
    if (!user) {
      user = await userModel.create({
        email,
        name: name || "",
        phone: phone || "",
        currentSteps: [
          {
            estateId,
            currentStep: 1,
            stepStatus: "pending",
            queStatus: "pending",
            status: "pending",
          },
        ],
      });
      isNewUser = true;
    }

    // 2️⃣ UPDATE USER DETAILS IF PROVIDED
    else if (name && phone) {
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

    // 3️⃣ CHECK IF estateId ALREADY EXISTS IN user.currentSteps
    const hasEstate = user.currentSteps.some(
      (item) => item.estateId.toString() === estateId
    );

    if (!hasEstate) {
      user.currentSteps.push({
        estateId,
        currentStep: 1,
        stepStatus: "pending",
        queStatus: "pending",
        status: "pending",
      });
      await user.save();
    }

    // 4️⃣ CREATE TOKENS
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

    // 5️⃣ GET CURRENT STEP FOR THIS ESTATE
    const foundCurrent = user.currentSteps.find(
      (item) => item.estateId.toString() === estateId
    );

    const userCurrentStep = foundCurrent ? foundCurrent.currentStep : 1;

    // 6️⃣ FETCH THE ESTATE
    const estate = await estateModel.findById(estateId);
    if (!estate) return next(new AppError("Estate not found", 404));

    // 7️⃣ FIND THE STEP INSIDE estate.steps
    const step = estate.steps.find((s) => s.stepNumber === userCurrentStep);

    if (!step) return next(new AppError("Step not found", 404));

    return res.status(200).json({
      message: `Welcome ${user.name || ""}`,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
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
