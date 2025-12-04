const mongoose = require("mongoose");
const userModel = require("../model/userModel");
const AppError = require("../utils/AppError");

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid user ID format", 400));
    }
    // ✅ Delete in one step
    const user = await userModel.findByIdAndDelete(id);
    if (!user) {
      return next(new AppError("This user does not exist", 404));
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
      data: user, // returning deleted user for confirmation
    });
  } catch (error) {
    next(error);
  }
};

module.exports = deleteUser;
