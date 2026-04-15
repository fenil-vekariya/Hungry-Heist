const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  placeOrder,
  getMyOrders,
  getRestaurantOrders,
  updateOrderStatus
} = require("../controllers/orderController");

// Customer places order
router.post(
  "/place",
  authMiddleware,
  roleMiddleware("customer"),
  placeOrder
);

// Customer tracks their orders
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("customer"),
  getMyOrders
);

// Restaurant views their orders
router.get(
  "/restaurant",
  authMiddleware,
  roleMiddleware(["restaurant", "admin"]),
  getRestaurantOrders
);

// Unified Status Update (Restaurant, Partner, Customer, Admin)
router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["restaurant", "partner", "customer", "admin"]),
  updateOrderStatus
);

module.exports = router;
