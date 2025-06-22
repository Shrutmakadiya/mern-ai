const express = require("express");
const isAuthenticated = require("../middlewares/isAuhenticated");
const { openAIController } = require("../controllers/openAiController");
const checkRequestMiddleware = require("../middlewares/checkRequestMiddleware");
const router = express.Router();

router.post("/generate", isAuthenticated, checkRequestMiddleware,openAIController);

module.exports = router;