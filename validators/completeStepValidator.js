const Joi = require("joi");
const mongoose = require("mongoose");

const objectId = (value, helpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error("any.invalid");
  }
  return value;
};

const submitStepSchema = Joi.object({
  estateId: Joi.string().custom(objectId).required(),
  stepNumber: Joi.number().integer().min(1).required(),
  email: Joi.string().email().required(),
});

module.exports = submitStepSchema;
