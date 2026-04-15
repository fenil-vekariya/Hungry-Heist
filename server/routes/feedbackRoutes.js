const express = require("express");
const { submitFeedback, getAllFeedback, deleteFeedback } = require("../controllers/feedbackController");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Public feedback submission
router.post("/", submitFeedback);

// Admin-only management
router.get("/", authMiddleware, roleMiddleware(["admin"]), getAllFeedback);
router.delete("/:id", authMiddleware, roleMiddleware(["admin"]), deleteFeedback);

module.exports = router;
