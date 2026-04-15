const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  uploadMenuItemImage,
} = require("../middleware/uploadMiddleware");

const {
  addMenuItem,
  getMyMenu,
  deleteMenuItem,
  updateMenuItem,
  getMenuByRestaurant,
  getAllMenuItems
} = require("../controllers/menuController");

router.get("/restaurant/:restaurantId", getMenuByRestaurant);
router.get("/all", getAllMenuItems);

router.post(
  "/add",
  authMiddleware,
  roleMiddleware(["restaurant"]),
  uploadMenuItemImage,
  addMenuItem
);

router.put(
  "/update/:id",
  authMiddleware,
  roleMiddleware(["restaurant"]),
  uploadMenuItemImage,
  updateMenuItem
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware(["restaurant", "admin"]),
  getMyMenu
);

router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware(["restaurant", "admin"]),
  deleteMenuItem
);

module.exports = router;
