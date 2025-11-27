const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const answerQuestionaireSchema = Joi.object({
  estateId: Joi.string().custom(objectId).required(),

  questionsIdArray: Joi.array()
    .items(Joi.string().custom(objectId).required())
    .min(1)
    .required()
    .messages({
      "array.base": "questionsIdArray must be an array",
      "array.min": "At least one question ID is required",
      "any.required": "questionsIdArray is required",
    }),

  answersArray: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().trim().required().messages({
          "string.empty": "Answer text is required",
          "any.required": "Answer text is required",
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
      "array.base": "answersArray must be an array of objects",
      "array.min": "At least one answer is required",
      "any.required": "answersArray is required",
    }),
});

module.exports = answerQuestionaireSchema;
