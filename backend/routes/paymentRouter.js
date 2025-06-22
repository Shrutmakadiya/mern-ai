const express = require("express");
const isAuthenticated = require("../middlewares/isAuhenticated");
const { handlePayment, handleFreeSubscription, verifyPayment } = require("../controllers/handlePayment");

const paymentRouter = express.Router();

paymentRouter.post("/checkout", isAuthenticated, handlePayment);
paymentRouter.post("/free-plan", isAuthenticated, handleFreeSubscription);
paymentRouter.post("/verify-payment/:paymentId", isAuthenticated, verifyPayment);

module.exports = paymentRouter;