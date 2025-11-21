const AppError = require("../utils/AppError");
const crypto = require("crypto");

const RAW_PUBLIC_KEY = process.env.SYTEMAP_PUBLIC_KEY;
const PUBLIC_KEY = RAW_PUBLIC_KEY.includes("\\n")
  ? RAW_PUBLIC_KEY.replace(/\\n/g, "\n")
  : RAW_PUBLIC_KEY;

const HMAC_SECRET = process.env.SYTEMAP_HMAC_SECRET;

module.exports = (req, res, next) => {
  const signature = req.headers["x-signature"];

  if (!signature) {
    console.log("❌ Missing X-Signature header");
    return next(new AppError("Invalid signature", 400));
  }

  const rawBody = req.body; // Buffer
  let hmacValid = false;
  let rsaValid = false;

  // -------------------------
  // 1️⃣ HMAC SHA-256 verification
  // -------------------------
  if (HMAC_SECRET) {
    const expectedHmac = crypto
      .createHmac("sha256", HMAC_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expectedHmac === signature) {
      hmacValid = true;
      console.log("✅ HMAC signature verified");
    }
  }

  // -------------------------
  // 2️⃣ RSA verification
  // -------------------------
  try {
    rsaValid = crypto.verify(
      "RSA-SHA256",
      rawBody,
      PUBLIC_KEY,
      Buffer.from(signature, "base64")
    );

    if (rsaValid) {
      console.log("✅ RSA signature verified");
    }
  } catch (err) {
    rsaValid = false;
  }

  // -------------------------
  // Final decision
  // -------------------------
  if (!hmacValid && !rsaValid) {
    console.log("❌ Signature verification failed");
    return next(new AppError("Invalid signature", 400));
  }

  // Convert buffer to JSON
  try {
    req.body = JSON.parse(rawBody.toString());
  } catch (err) {
    return next(new AppError("Invalid JSON", 400));
  }

  next();
};
