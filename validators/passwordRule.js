const Joi = require("joi");

const passwordRule = Joi.string()
  .min(6)
  .pattern(
    /^(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/
  )
  .messages({
    "string.pattern.base":
      "Password must contain at least one uppercase letter, one symbol, letters, and numbers",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
  });

module.exports = passwordRule;
