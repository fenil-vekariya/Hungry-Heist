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

router.post(
  "/place",
  authMiddleware,
  roleMiddleware("customer"),
  placeOrder
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("customer"),
  getMyOrders
);

router.get(
  "/restaurant",
  authMiddleware,
  roleMiddleware("restaurant"),
  getRestaurantOrders
);

router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware("restaurant"),
  updateOrderStatus
);

module.exports = router;
