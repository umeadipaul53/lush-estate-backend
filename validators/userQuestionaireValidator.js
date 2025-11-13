const Joi = require("joi");
const objectIdPattern = /^[0-9a-fA-F]{24}$/; // MongoDB ObjectId pattern

const answerQuestionaireSchema = Joi.object({
  questionsIdArray: Joi.array()
    .items(
      Joi.string()
        .pattern(objectIdPattern)
        .message("Each question ID must be a valid MongoDB ObjectId")
    )
    .min(1)
    .required()
    .messages({
      "array.base": "questionsIdArray must be an array",
      "array.min": "At least one question ID is required",
      "any.required": "questionsIdArray is required",
    }),

  answersArray: Joi.array()
    .items(
      Joi.string()
        .trim()
        .min(1)
        .message("Each answer must be a non-empty string")
    )
    .min(1)
    .required()
    .messages({
      "array.base": "answersArray must be an array",
      "array.min": "At least one answer is required",
      "any.required": "answersArray is required",
    }),
});

module.exports = answerQuestionaireSchema;
