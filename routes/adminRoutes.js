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
const fetchAllUsers = require("../controller/fetchAllUsers");
const fetchAllTourReq = require("../controller/fetchAllTourReq");
const settleTourReq = require("../controller/settleTourReq");
const deleteUser = require("../controller/deleteUserAccount");
const fetchAllQuestionsCount = require("../controller/fetchAllQuestionsAdmin");
const handleChangeAdminPassword = require("../controller/changePassword");
const changeAdminPasswordSchema = require("../validators/passwordValidator");

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
admin
  .route("/fetch-all-users")
  .get(authenticateToken, authorizeRoles("admin"), fetchAllUsers);
admin
  .route("/fetch-all-tours")
  .get(authenticateToken, authorizeRoles("admin"), fetchAllTourReq);
admin
  .route("/settle-tours/:id")
  .patch(authenticateToken, authorizeRoles("admin"), settleTourReq);
admin
  .route("/delete-user/:id")
  .delete(authenticateToken, authorizeRoles("admin"), deleteUser);
admin
  .route("/fetch-all-questions")
  .get(authenticateToken, authorizeRoles("admin"), fetchAllQuestionsCount);
admin
  .route("/change-password")
  .patch(
    authenticateToken,
    authorizeRoles("admin"),
    validate(changeAdminPasswordSchema),
    handleChangeAdminPassword
  );

module.exports = admin;
