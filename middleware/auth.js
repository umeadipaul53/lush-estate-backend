const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return next(new AppError("no token provided", 403));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return next(
          new AppError("Token expired", 401, { expiredAt: err.expiredAt })
        );
      }

      return next(new AppError("Token invalid", 403, { message: err.message }));
    }

    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
