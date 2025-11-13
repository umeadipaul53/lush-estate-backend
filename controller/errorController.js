const AppError = require("../utils/AppError");

// Global Error Handling Middleware
function globalErrorHandler(err, req, res, next) {
  // If the error is an AppError we created
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      // Only include details if present
      ...(err.details ? { errors: err.details } : {}),
    });
  }

  // For unexpected errors (programming/unknown)
  console.error("❌ Unexpected Error:", err);

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
}

module.exports = globalErrorHandler;
