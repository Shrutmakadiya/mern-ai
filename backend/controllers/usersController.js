const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");

// Registration
const register = asyncHandler(async (req, res, next) => {
    const { username, email, password } = req.body;
    //validation
    if (!username || !email || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }
    //Check the email is token
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    //password encryption
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //register user
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

    //Add the date the trial will end
    newUser.trialExpires = new Date(new Date().getTime() + newUser.trialPeriod * 24 * 60 * 60 * 1000);

    await newUser.save();
    //token
    res.json({
        status: true,
        message: "User registered successfully",
        user: {
            username: newUser.username,
            email: newUser.email
        }
    });
})

// login
const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // check email
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("Incorrect email or password");
    }
    // check password
    const isPasswordCorrect = await bcrypt.compare(password, user?.password);
    if (!isPasswordCorrect) {
        res.status(400);
        throw new Error("Incorrect email or password");
    }
    // generate token
    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, { expiresIn: "3d" });

    // set the token into the cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });

    // send the response
    res.json({
        status: true,
        _id: user?._id,
        message: "User logged in successfully",
        username: user?.username,
        email: user?.email
    });
})

// logout
const logout = asyncHandler(async (req, res, next) => {
    res.cookie("token", null, { maxAge: 1 });
    res.json({
        status: 200,
        message: "User logged out successfully"
    });
})

// profile
const profile = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).select("-password")?.populate('payments')?.populate('history');
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.json({
        status: 200,
        user
    });
})

// check user Auth status
const checkAuth = asyncHandler(async (req, res) => {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    if (decoded) {
        res.json({
            isAuthenticated: true,
        });
    } else {
        res.json({
            isAuthenticated: false,
        });
    }
})

module.exports = {
    register,
    login,
    logout,
    profile,
    checkAuth
}