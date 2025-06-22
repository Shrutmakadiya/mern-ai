const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const conn = await mongoose.connect("mongodb+srv://shrutmakadiya37:qRnATwVZmVbQXT7T@mernai.qpniiob.mongodb.net/mern-ai?retryWrites=true&w=majority&appName=mernAI");
        console.log("MongoDB connected", conn.connection.host);
    } catch (error) {
        console.log("Error in connecting to MongoDB", error);
        process.exit(1);
    }
}

module.exports = connectDB;