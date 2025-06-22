const express = require("express");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const cors = require("cors");
const app = express();
const connectDB = require("./utils/connectDB");
const { errorHandler } = require("./middlewares/errorMiddleware")

connectDB();
const dotenv = require("dotenv");
const usersRouter = require("./routes/userRouter");
const openAIRouter = require("./routes/openAIRouter");
const paymentRouter = require("./routes/paymentRouter");
const User = require("./models/User");

dotenv.config();
const PORT = process.env.PORT || 8090;

//Cron for the trial plan : run every single
cron.schedule("0 0 * * * *", async () => {
    try {
        const today = new Date();
        const updatedUsers = await User.updateMany({
            trialActive: true,
            trialExpires: { $lt: today }
        }, {
            trialActive: false,
            subscriptionPlan: "Free",
            monthlyRequestCount: 5
        });
    } catch (error) {
        console.log(error);
    }
});

//Cron for the Free plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
    try {
        //get the current date
        const today = new Date();
        await User.updateMany(
            {
                subscriptionPlan: "Free",
                nextBillingDate: { $lt: today },
            },
            {
                monthlyRequestCount: 0,
            }
        );
    } catch (error) {
        console.log(error);
    }
});

//Cron for the Basic plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
    try {
        //get the current date
        const today = new Date();
        await User.updateMany(
            {
                subscriptionPlan: "Basic",
                nextBillingDate: { $lt: today },
            },
            {
                monthlyRequestCount: 0,
            }
        );
    } catch (error) {
        console.log(error);
    }
});

//Cron for the Premium plan: run at the end of every month
cron.schedule("0 0 1 * * *", async () => {
    try {
        //get the current date
        const today = new Date();
        await User.updateMany(
            {
                subscriptionPlan: "Premium",
                nextBillingDate: { $lt: today },
            },
            {
                monthlyRequestCount: 0,
            }
        );
    } catch (error) {
        console.log(error);
    }
});

// Middleware
app.use(express.json());
app.use(cookieParser());
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/openai", openAIRouter);
app.use("/api/v1/payment", paymentRouter);

// Error Handler Middleware
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));