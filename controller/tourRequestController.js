const tourRequestModel = require("../model/tourModel");
const AppError = require("../utils/AppError");
const userModel = require("../model/userModel");
const { sendEmail } = require("../email/email_services");

const createTourRequest = async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const { date, time } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!date || !time) {
      return next(new AppError("Please select a date and time", 400));
    }

    // Check if user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const tour = await tourRequestModel.create({
      user: userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      date,
      time,
    });

    const tehlexEmail = "vincenttehlex18@gmail.com";

    // Send the email using Resend
    const sentMail = await sendEmail({
      to: tehlexEmail,
      subject: "Tour Request",
      templateName: "tour", // must exist as 'templates/tour.mjml'
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

    // Optional: handle success/failure
    if (!sentMail) {
      console.error("❌ Failed to send tour notification email.");
      return next(new AppError("Failed to send tour notification email", 400));
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
