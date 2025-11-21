const express = require("express");
const auth = express.Router();
const authorizeRoles = require("../middleware/role");
const authenticateToken = require("../middleware/auth");
const validate = require("../middleware/validate");
const startJourney = require("../controller/startController");
const completeStep = require("../controller/completeStepController");
const submitStepSchema = require("../validators/completeStepValidator");
const plotReservation = require("../controller/plotReservationController");
const plotReservationSchema = require("../validators/plotReservationValidator");
const answerQuestionaire = require("../controller/userAnswerQuestionaireController");
const answerQuestionaireSchema = require("../validators/userQuestionaireValidator");
const fetchUserStep = require("../controller/userStepController");
const fetchAllStep = require("../controller/fetchAllSteps");
const adminLogin = require("../controller/loginController");
const validateLogin = require("../validators/loginValidator");
const refreshToken = require("../controller/refreshTokenController");
const fetchAllEstates = require("../controller/fetchAllEstates");
const fetchAllPlots = require("../controller/fetchAllPlots");
const fetchAllQuestions = require("../controller/fetchAllQuestions");
const createTourRequest = require("../controller/tourRequestController");
const tourRequestValidation = require("../validators/tourValidator");

auth.route("/refresh-token").post(refreshToken);
auth.route("/start-client-journey").post(startJourney);
auth.route("/login").post(validate(validateLogin), adminLogin);
auth.route("/complete-client-journey/:stepNumber").post(
  authenticateToken,
  authorizeRoles("user"),
  (req, res, next) => {
    req.body.stepNumber = Number(req.params.stepNumber);
    req.body.email = req.user.email; // merge params into body
    next();
  },
  validate(submitStepSchema),
  completeStep
);
auth
  .route("/reserve-plot")
  .patch(
    authenticateToken,
    authorizeRoles("user"),
    validate(plotReservationSchema),
    plotReservation
  );
auth
  .route("/answer-questionaire")
  .post(
    authenticateToken,
    authorizeRoles("user"),
    validate(answerQuestionaireSchema),
    answerQuestionaire
  );
auth
  .route("/fetch-user-step")
  .get(authenticateToken, authorizeRoles("user"), fetchUserStep);
auth
  .route("/fetch-all-steps")
  .get(authenticateToken, authorizeRoles("user"), fetchAllStep);
auth
  .route("/fetch-all-estates")
  .get(authenticateToken, authorizeRoles("user"), fetchAllEstates);
auth
  .route("/fetch-all-plots")
  .get(authenticateToken, authorizeRoles("user"), fetchAllPlots);
auth
  .route("/fetch-all-questions")
  .get(authenticateToken, authorizeRoles("user"), fetchAllQuestions);
auth
  .route("/request-tour")
  .post(
    authenticateToken,
    authorizeRoles("user"),
    validate(tourRequestValidation),
    createTourRequest
  );

module.exports = auth;
