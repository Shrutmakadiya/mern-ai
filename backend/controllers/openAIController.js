const asyncHandler = require('express-async-handler');
const axios = require('axios');
const User = require('../models/User');
const ContentHistory = require('../models/ContentHistory');

// OPENAI Controller
const openAIController = asyncHandler(async (req, res) => {
    const { prompt } = req.body
    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo-instruct",
            prompt,
            max_tokens: 700
        }, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': "application/json"
            }
        });

        const content = response?.data?.choices[0].text?.trim();
        const newContent = await ContentHistory.create({
            user: req?.user?._id,
            content
        })

        // Push the content into the user
        const userFound = await User.findById(req?.user?.id);
        userFound.history.push(newContent?._id);
        userFound.apiRequestCount += 1;
        await userFound.save();
        res.json(200).json(content)
    } catch (error) {
        const userFound = await User.findById(req?.user?.id);
        userFound.apiRequestCount += 1;
        await userFound.save();
        res.status(500);
        throw new Error("Something went wrong");
    }
})

module.exports = {
    openAIController
}