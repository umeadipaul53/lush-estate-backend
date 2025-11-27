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

    if (!mongoose.Types.ObjectId.isValid(estateId)) {
      return next(new AppError("Invalid estateId", 400));
    }

    // 🔥 Fetch ALL estates
    const estates = await estateModel.find().select("_id");
    if (!estates || estates.length === 0) {
      return next(new AppError("No estates found in the system", 404));
    }

    let user = await userModel.findOne({ email });
    let isNewUser = false;

    // ---------------------------------------------------------
    // 1️⃣ CREATE USER IF NOT FOUND — ADD ALL ESTATES STEPS
    // ---------------------------------------------------------
    if (!user) {
      const stepsForAllEstates = estates.map((es) => ({
        estateId: es._id,
        currentStep: 1,
        stepStatus: "pending",
        queStatus: "pending",
        status: "pending",
      }));

      user = await userModel.create({
        email,
        name: name || "",
        phone: phone || "",
        currentSteps: stepsForAllEstates,
      });

      isNewUser = true;
    }

    // ---------------------------------------------------------
    // 2️⃣ UPDATE USER DETAILS IF PROVIDED
    // ---------------------------------------------------------
    else if (name || phone) {
      if (phone && phone !== user.phone) {
        const existingPhone = await userModel.findOne({ phone });
        if (existingPhone) {
          return next(new AppError("Phone number already exists", 400));
        }
      }

      if (name) user.name = name;
      if (phone) user.phone = phone;
    }

    // ---------------------------------------------------------
    // 3️⃣ ENSURE USER HAS CURRENT STEPS FOR ALL ESTATES
    // ---------------------------------------------------------
    const existingEstateIds = user.currentSteps.map((cs) =>
      cs.estateId.toString()
    );

    estates.forEach((es) => {
      if (!existingEstateIds.includes(es._id.toString())) {
        user.currentSteps.push({
          estateId: es._id,
          currentStep: 1,
          stepStatus: "pending",
          queStatus: "pending",
          status: "pending",
        });
      }
    });

    await user.save();

    // ---------------------------------------------------------
    // 4️⃣ GENERATE TOKENS
    // ---------------------------------------------------------
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
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ---------------------------------------------------------
    // 5️⃣ GET CURRENT STEP FOR REQUESTED estateId
    // ---------------------------------------------------------
    const foundCurrent = user.currentSteps.find(
      (item) => item.estateId.toString() === estateId
    );

    const userCurrentStep = foundCurrent ? foundCurrent.currentStep : 1;

    // ---------------------------------------------------------
    // 6️⃣ FETCH REQUESTED ESTATE
    // ---------------------------------------------------------
    const estate = await estateModel.findById(estateId);
    if (!estate) return next(new AppError("Estate not found", 404));

    // ---------------------------------------------------------
    // 7️⃣ GET THE STEP INFO FROM estate.steps
    // ---------------------------------------------------------
    const step = estate.steps.find((s) => s.stepNumber === userCurrentStep);

    if (!step) return next(new AppError("Step not found", 404));

    // ---------------------------------------------------------
    // 8️⃣ RESPONSE
    // ---------------------------------------------------------
    return res.status(200).json({
      message: `Welcome ${user.name || ""}`,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        step,
        isNewUser,
        currentProgress: foundCurrent,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = startJourney;
