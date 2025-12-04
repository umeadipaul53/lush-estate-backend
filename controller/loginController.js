const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const isProduction = process.env.NODE_ENV === "production";
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middleware/tokens");
const tokenModel = require("../model/tokenModel");
const AppError = require("../utils/AppError");

const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    //bcrypt is used to compare the plain password with the salted password from DB
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(
        new AppError(
          "The password does not match the user account or the account does not exist. Please verify both the email address and password and try again.",
          401
        )
      );
    }

    //generate token id for the user
    const newTokenId = crypto.randomUUID();

    //generate access and refresh token for the user
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user, newTokenId);

    try {
      const saved = await tokenModel.create({
        tokenId: newTokenId,
        token: refreshToken,
        userId: user._id,
      });
      console.log("✅ Saved token:", saved);
    } catch (err) {
      console.error("❌ Token save error:", err);
      return next(err);
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      partitioned: isProduction ? true : false, // ⭐ REQUIRED ⭐
      path: "/", // more flexible for refresh endpoint
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = adminLogin;
