const express = require("express");
const router = express.Router();
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const authMiddleware = require("../middleware/authMiddleware");

// Both routes require the user to be authenticated
router.post("/create-order", authMiddleware, createOrder);
router.post("/verify", authMiddleware, verifyPayment);

module.exports = router;
