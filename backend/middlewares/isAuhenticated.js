const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAuthenticated = expressAsyncHandler(async (req, res, next) => {
    if (req.cookies.token) {
        // verify token
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id)?.select("-password");
        return next();
    } else {
        res.status(401);
        throw new Error("Not authorized");
    }
});

module.exports = isAuthenticated;