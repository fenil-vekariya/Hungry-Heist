const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  uploadRestaurantImages,
} = require("../middleware/uploadMiddleware");

const {
  createRestaurant,
  getMyRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  getRevenue
} = require("../controllers/restaurantController");

router.get("/all", getAllRestaurants);
router.get("/details/:id", getRestaurantById);

router.get(
  "/earnings",
  authMiddleware,
  roleMiddleware(["restaurant", "admin"]),
  getRevenue
);

router.post(
  "/create",
  authMiddleware,
  roleMiddleware(["restaurant"]),
  uploadRestaurantImages,
  createRestaurant
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware(["restaurant", "admin"]), // Admin might need to see the owner's profile
  getMyRestaurant
);

router.put(
  "/update",
  authMiddleware,
  roleMiddleware(["restaurant", "admin"]),
  uploadRestaurantImages,
  updateRestaurant
);

module.exports = router;
