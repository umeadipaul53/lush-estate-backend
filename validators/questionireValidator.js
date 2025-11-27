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
  options: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required().messages({
          "string.empty": "Option text is required",
          "any.required": "Option text is required",
        }),
        points: Joi.number().required().messages({
          "number.base": "Points must be a number",
          "any.required": "Points are required",
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Options must be an array of objects",
      "array.min": "At least one option is required",
    }),
});

module.exports = questionSchema;
