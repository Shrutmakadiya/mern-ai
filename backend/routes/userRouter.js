const express = require("express");
const { register, login, logout, profile, checkAuth } = require("../controllers/usersController");
const isAuthenticated = require("../middlewares/isAuhenticated");
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

router.get('/profile', isAuthenticated,profile);
router.get("/auth/check", isAuthenticated, checkAuth);

module.exports = router;