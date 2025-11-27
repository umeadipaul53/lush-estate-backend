const express = require("express");
const admin = express.Router();
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
const { validateFetchEstate } = require("../validators/estateValidator");

admin.route("/login").post(validate(validateLogin), adminLogin);
admin
  .route("/create-estate")
  .post(authenticateToken, authorizeRoles("admin"), createEstate);
admin
  .route("/fetch-estate/:estateName")
  .get(
    authenticateToken,
    authorizeRoles("admin"),
    validate(validateFetchEstate),
    getEstate
  );
admin
  .route("/fetch-all-estates")
  .get(authenticateToken, authorizeRoles("admin"), getAllEstates);
admin
  .route("/add-questionaire")
  .post(
    authenticateToken,
    authorizeRoles("admin"),
    validate(questionSchema),
    createQuestion
  );

module.exports = admin;
