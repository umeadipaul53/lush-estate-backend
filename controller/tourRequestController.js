const tourRequestModel = require("../model/tourModel");
const AppError = require("../utils/AppError");
const userModel = require("../model/userModel");
const { sendEmail } = require("../email/email_services");
const { estateModel } = require("../model/estateModel");
const mongoose = require("mongoose");

const createTourRequest = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const { date, time, estateId } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!date || !time) {
      return next(new AppError("Please select a date and time", 400));
    }

    if (!estateId) {
      return next(new AppError("Estate ID is required", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(estateId)) {
      return next(new AppError("Invalid Estate ID", 400));
    }

    // Check estate
    const estate = await estateModel.findById(estateId);
    if (!estate) return next(new AppError("Estate not found", 404));

    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Check if user already made a tour request for this estate
    const existingRequest = await tourRequestModel.findOne({
      user: userId,
      estateId,
    });

    if (existingRequest) {
      return next(
        new AppError(
          "You have already made a tour request for this estate. You cannot make another one.",
          400
        )
      );
    }

    // Create tour request
    const tour = await tourRequestModel.create({
      user: userId,
      estateId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      date,
      time,
    });

    const tehlexEmail = "vincenttehlex18@gmail.com";
    const subject = "Tour Request";

    // Send notification email
    const sentMail = await sendEmail({
      to: tehlexEmail,
      subject,
      templateName: "tour", // must exist in templates
      variables: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        date,
        time,
        subject,
        year,
      },
    });

    if (!sentMail) {
      console.error("❌ Failed to send tour notification email.");
      return next(new AppError("Failed to send tour notification email", 500));
    }

    return res.status(201).json({
      status: "success",
      message: "Tour request submitted successfully",
      data: tour,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = createTourRequest;
