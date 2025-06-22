const mongoose = require("mongoose");

//Schema
const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    reference: {
        type: String,
        required: true,
    },
    currency: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        default: "pending",
        required: true,
    },
    subscriptionPlan: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        default: 0,
    },
    monthlyRequestCount: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

// ! Compile to from the model
const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;