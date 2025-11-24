const express = require("express");
const webhook = express.Router();
const verifySytemapSignature = require("../middleware/verifySytemapSignature");
const payment = require("../controller/webhook/payment");
const invoice = require("../controller/webhook/invoice");
const signup = require("../controller/webhook/signup");

webhook.route("/signup").post(signup);
webhook.route("/invoice").post(invoice);
webhook.route("/payment").post(payment);

module.exports = webhook;
