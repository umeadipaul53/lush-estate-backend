const express = require("express");
const admin = express.Router();
const validateEstate = require("../validators/estateValidator");
const {
  createEstate,
  getEstate,
  getAllEstates,
} = require("../controller/createEstateController");
const authorizeRoles = require("../middleware/role");
const authenticateToken = require("../middleware/auth");
const validate = require("../middleware/validate");
const adminLogin = require("../controller/loginController");
const validateLogin = require("../validators/loginValidator");
const createQuestion = require("../controller/createQuestionaireController");
const questionSchema = require("../validators/questionireValidator");

admin.route("/login").post(validate(validateLogin), adminLogin);
admin
  .route("/create-estate")
  .post(authenticateToken, authorizeRoles("admin"), createEstate);

admin
  .route("/add-questionaire")
  .post(
    authenticateToken,
    authorizeRoles("admin"),
    validate(questionSchema),
    createQuestion
  );

module.exports = admin;
