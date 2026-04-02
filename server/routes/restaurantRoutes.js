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
  updateRestaurant
} = require("../controllers/restaurantController");

router.get("/all", getAllRestaurants);
router.get("/details/:id", getRestaurantById);

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("restaurant"),
  
  uploadRestaurantImages,
  createRestaurant
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("restaurant"),
  getMyRestaurant
);

router.put(
  "/update",
  authMiddleware,
  roleMiddleware("restaurant"),
  uploadRestaurantImages,
  updateRestaurant
);

module.exports = router;
