const Joi = require("joi");

const plotReservationSchema = Joi.object({
  selectedPlots: Joi.array()
    .items(
      Joi.number().integer().min(1).messages({
        "number.base": "Each plot number must be a valid number",
        "number.integer": "Each plot number must be an integer",
        "number.min": "Plot number must be at least 1",
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "plotsArray must be an array of numbers",
      "array.min": "At least one plot must be selected",
      "any.required": "plotsArray is required",
    }),

  paymentPlan: Joi.string()
    .valid("Full Payment", "3 months", "6 months", "12 months")
    .required()
    .messages({
      "any.only":
        "Payment option must be one of 'Full Payment', '3 months', '6 months', or '12 months'",
      "any.required": "Payment option is required",
    }),
});

module.exports = plotReservationSchema;
