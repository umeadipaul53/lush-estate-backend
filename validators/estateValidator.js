const joi = require("joi");

const validateEstate = joi.object({
  name: joi.string().trim().required(),
  numberOfPlots: joi.number().integer().min(1).required(),
});

module.exports = validateEstate;
