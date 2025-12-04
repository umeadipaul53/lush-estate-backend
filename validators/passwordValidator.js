const Joi = require("joi");
const passwordRule = require("./passwordRule");

const changeAdminPasswordSchema = Joi.object({
  newPassword: passwordRule.required(),
  oldPassword: passwordRule.required(),
});

module.exports = changeAdminPasswordSchema;
