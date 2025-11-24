const Joi = require("joi");

const startJourneyValidator = Joi.object({
  estateId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Invalid estateId format"),

  email: Joi.string().email().required(),

  name: Joi.string().allow("").optional(),

  phone: Joi.string()
    .pattern(/^[0-9]{7,15}$/)
    .message("Phone must be 7-15 digits")
    .allow("")
    .optional(),
});

module.exports = startJourneyValidator;
