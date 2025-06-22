const expressAsyncHandler = require("express-async-handler");
const User = require("../models/User");

const checkRequestMiddleware = expressAsyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.status(401);
        throw new Error("Not authorized");
    }
    const user = await User.findById(req?.user?.id);
    if (!user) {
        res.status(401);
        throw new Error("User not found");
    }
    let requestLimit = 0
    // check if the user is on trial period
    if(user?.trialActive){
        requestLimit = user?.monthlyRequestCount
    }
    console.log(requestLimit)
    // check if user exceeds the request limit
    if(user?.apiRequestCount >= requestLimit){
        res.status(401);
        throw new Error("You have exceeded the request limit, Please upgrade your plan");
    }
    next()
});

module.exports = checkRequestMiddleware;