const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const questionSchema = Joi.object({
  estateId: Joi.string().custom(objectId).required(),
  questionText: Joi.string().required().messages({
    "string.base": "Question text must be a string",
    "string.empty": "Question text is required",
    "any.required": "Question text is required",
  }),

  options: Joi.array().items(Joi.string().trim().required()).min(1).messages({
    "array.base": "Options must be an array",
    "array.min": "At least one option is required",
    "string.empty": "Each option must be a non-empty string",
  }),
});

module.exports = questionSchema;
