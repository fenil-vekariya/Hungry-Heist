const WebsiteFeedback = require("../models/WebsiteFeedback");

exports.submitFeedback = async (req, res) => {
    try {
        const { user, message, rating } = req.body;

        if (!user || !message || !rating) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const newFeedback = new WebsiteFeedback({
            user,
            message,
            rating,
        });

        await newFeedback.save();

        res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        res.status(500).json({ message: "Server error submitting feedback" });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await WebsiteFeedback.find().sort({ createdAt: -1 });
        res.json(feedback);
    } catch (error) {
        console.error("Error fetching feedback:", error);
        res.status(500).json({ message: "Server error fetching feedback" });
    }
};

exports.deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await WebsiteFeedback.findByIdAndDelete(id);
        if (!feedback) {
            return res.status(404).json({ message: "Feedback not found" });
        }
        res.json({ message: "Feedback deleted successfully" });
    } catch (error) {
        console.error("Error deleting feedback:", error);
        res.status(500).json({ message: "Server error deleting feedback" });
    }
};
