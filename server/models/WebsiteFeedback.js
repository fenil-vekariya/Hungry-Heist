const mongoose = require("mongoose");

const websiteFeedbackSchema = new mongoose.Schema(
    {
        user: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("WebsiteFeedback", websiteFeedbackSchema);
