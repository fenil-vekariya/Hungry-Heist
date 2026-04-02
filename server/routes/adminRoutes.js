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
  approveRestaurant
} = require("../controllers/adminController");

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminStats
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware("admin"),
  getAllUsers
);

router.delete(
  "/user/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteUser
);

router.put(
  "/block/:id",
  authMiddleware,
  roleMiddleware("admin"),
  toggleBlockUser
);

router.get(
  "/restaurants",
  authMiddleware,
  roleMiddleware("admin"),
  getAllRestaurantsAdmin
);

router.delete(
  "/restaurant/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteRestaurantAdmin
);

router.get(
  "/pending",
  authMiddleware,
  roleMiddleware("admin"),
  getPendingRestaurants
);

router.put(
  "/approve/:id",
  authMiddleware,
  roleMiddleware("admin"),
  approveRestaurant
);

router.get(
  "/orders",
  authMiddleware,
  roleMiddleware("admin"),
  getAllOrdersAdmin
);

router.delete(
  "/order/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteOrderAdmin
);

module.exports = router;
