const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  getAdminStats,
  getAllUsers,
  deleteUser,
  toggleBlockUser,
  getAllRestaurantsAdmin,
  deleteRestaurantAdmin,
  getAllOrdersAdmin,
  deleteOrderAdmin,
  getPendingRestaurants,
  approveRestaurant,
  rejectRestaurant,
  approveUser,
  getAllDeliveryAgents,
  getPendingDeliveryAgents,
  approveDeliveryAgent,
  rejectAgent,
  assignAgentToOrder
} = require("../controllers/adminController");

// Use array format for roleMiddleware for multi-role support
router.get(
  "/stats",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAdminStats
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllUsers
);

router.delete(
  "/user/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteUser
);

router.put(
  "/block/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  toggleBlockUser
);

router.get(
  "/restaurants",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllRestaurantsAdmin
);

router.delete(
  "/restaurant/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteRestaurantAdmin
);

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(["admin"]),
  getPendingRestaurants
);

router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  approveRestaurant
);

router.get(
  "/orders",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllOrdersAdmin
);

router.delete(
  "/order/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteOrderAdmin
);

router.get(
  "/delivery-agents",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllDeliveryAgents
);

router.get(
  "/delivery-agents/pending",
  authMiddleware,
  roleMiddleware(["admin"]),
  getPendingDeliveryAgents
);

router.put(
  "/delivery-agents/approve/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  approveDeliveryAgent
);

router.delete(
  "/delivery-agents/reject/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  rejectAgent
);

router.delete(
  "/reject/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  rejectRestaurant
);

router.post(
  "/delivery-agents/assign",
  authMiddleware,
  roleMiddleware(["admin"]),
  assignAgentToOrder
);

router.put(
  "/approve-user/:id",
  authMiddleware,
  roleMiddleware(["admin"]),
  approveUser
);

module.exports = router;
