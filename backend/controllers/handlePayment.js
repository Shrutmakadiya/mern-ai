const asyncHandler = require("express-async-handler");
const Razorpay = require("razorpay");
const Payment = require("../models/Payment");
const { calculateNextBillingDate } = require("../utils/calculateNextBillingDate");
const { shouldRenewSubcriptionPlan } = require("../utils/shouldRenewsubcriptionPlan");
const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const handlePayment = asyncHandler(async (req, res) => {
    const { amount, subscriptionPlan } = req.body;
    const user = req?.user;
    console.log(user);
    try {
        // Create Razorpay order (amount is in paise, so multiply by 100)
        const options = {
            amount: Number(amount) * 100,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: user?._id?.toString(),
                userEmail: user?.email,
                subscriptionPlan,
            },
        };
        const order = await razorpayInstance.orders.create(options);

        res.json({
            orderId: order.id,
            currency: order.currency,
            amount: order.amount,
            notes: order.notes,
        });
    }
    catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ error: "Failed to create Razorpay order" });
    }
});

// verify payment
const verifyPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    try {
        const payment = await razorpayInstance.payments.fetch(paymentId);
        console.log("Fetched Payment:", payment);

        if (payment.status === "captured") {
            const subscriptionPlan = payment.notes.subscriptionPlan;
            const userEmail = payment.notes.userEmail;
            const userId = payment.notes.userId;

            const userFound = await User.findById(userId);
            if (!userFound) {
                return res.status(404).json({
                    status: false,
                    message: "User not found",
                });
            }

            const amount = payment.amount / 100;
            const currency = payment.currency;

            const newPayment = await Payment.create({
                user: userId,
                email: userEmail,
                subscriptionPlan,
                amount,
                currency,
                status: "success",
                reference: paymentId,
            });

            let monthlyRequestCount = 0;
            if (subscriptionPlan === "Basic") monthlyRequestCount = 50;
            if (subscriptionPlan === "Premium") monthlyRequestCount = 100;

            const updatedUser = await User.findByIdAndUpdate(userId, {
                subscriptionPlan,
                trialPeriod: 0,
                nextBillingDate: calculateNextBillingDate(),
                apiRequestCount: 0,
                monthlyRequestCount,
                $addToSet: { payments: newPayment?._id },
            }, { new: true });

            return res.json({
                status: true,
                message: "Payment verified and user updated",
                updatedUser,
            });
        } else {
            return res.status(400).json({
                status: false,
                message: "Payment not captured",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});


// hanle free subscription
const handleFreeSubscription = asyncHandler(async (req, res) => {
    //Get the login user
    const user = req?.user;
    console.log("free plan", user);

    //Check if user account should be renew or not
    try {
        if (shouldRenewSubcriptionPlan(user)) {
            //Update the user account
            user.subscription = "Free";
            user.monthlyRequestCount = 5;
            user.apiRequestCount = 0;
            user.nextBillingDate = calculateNextBillingDate();

            //Create new payment and save into DB
            const newPayment = await Payment.create({
                user: user?._id,
                subscriptionPlan: "Free",
                amount: 0,
                status: "success",
                reference: Math.random().toString(36).substring(7),
                monthlyRequestCount: 0,
                currency: "INR",
            });
            user.payments.push(newPayment?._id);
            //save the user
            await user.save();
            //send the response
            res.json({
                status: "success",
                message: "Subscription plan updated successfully",
                user,
            });
        } else {
            return res.status(403).json({ error: "Subcription renewal not due yet" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
});


module.exports = {
    handlePayment,
    handleFreeSubscription,
    verifyPayment
};