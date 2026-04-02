const express = require("express");
const { submitFeedback, getAllFeedback } = require("../controllers/feedbackController");
const router = express.Router();

router.post("/", submitFeedback);
router.get("/", getAllFeedback);

module.exports = router;
