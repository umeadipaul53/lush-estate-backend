const Joi = require("joi");

const startJourneyValidator = Joi.object({
  estateId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .message("Invalid estateId format"),

  email: Joi.string().email().required(),

  name: Joi.string().allow("").optional(),

  phone: Joi.string()
    .custom((value, helpers) => {
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length < 7 || cleaned.length > 15) {
        return helpers.error("any.invalid");
      }
      return cleaned;
    })
    .message("Phone must be 7-15 digits")
    .optional(),
});

module.exports = startJourneyValidator;
