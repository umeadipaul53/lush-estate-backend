const express = require("express");
const webhook = express.Router();
const verifySytemapSignature = require("../middleware/verifySytemapSignature");
const payment = require("../controller/webhook/payment");
const invoice = require("../controller/webhook/invoice");
const signup = require("../controller/webhook/signup");

webhook.route("/signup").post(verifySytemapSignature, signup);
webhook.route("/invoice").post(verifySytemapSignature, invoice);
webhook.route("/payment").post(verifySytemapSignature, payment);

module.exports = webhook;
