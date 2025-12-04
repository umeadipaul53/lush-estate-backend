const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const AppError = require("../utils/AppError");

const handleChangeAdminPassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    // ✅ Basic validation
    if (!oldPassword || !newPassword) {
      return next(new AppError("Both old and new passwords are required", 400));
    }

    // ✅ Find admin user
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppError("Admin account not found", 404));
    }

    // ✅ Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return next(new AppError("Old password is incorrect", 403));
    }

    // ✅ Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // ✅ Update and save
    user.password = hashedPassword;
    await user.save();

    // ✅ Optional: force logout all sessions
    // user.tokens = []; await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = handleChangeAdminPassword;
