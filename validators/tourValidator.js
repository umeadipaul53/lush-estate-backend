const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const tourRequestValidation = Joi.object({
  estateId: Joi.string().custom(objectId).required(),
  date: Joi.date().min("now").required().messages({
    "date.base": "Date must be a valid date",
    "date.min": "Date cannot be in the past",
    "any.required": "Date is required",
  }),

  time: Joi.string()
    .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .required()
    .messages({
      "string.pattern.base": "Time must be in HH:MM format (24-hour clock)",
      "any.required": "Time is required",
    }),
});

module.exports = tourRequestValidation;
