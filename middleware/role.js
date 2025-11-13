const AppError = require("../utils/AppError");

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Access denied. Role not allowed.", 403));
    }

    next();
    console.log("user role", req.user.role);
  };
}

module.exports = authorizeRoles;
