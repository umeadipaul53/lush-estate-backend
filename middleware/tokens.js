const jwt = require("jsonwebtoken");

function generateAccessToken(user, expiresIn = "15m") {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn,
    }
  );
}

function generateRefreshToken(user, tokenId, expiresIn = "7d") {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      tokenId,
    },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn,
    }
  );
}

module.exports = { generateAccessToken, generateRefreshToken };
