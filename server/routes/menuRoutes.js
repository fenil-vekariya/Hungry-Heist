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
  getMenuByRestaurant,
  getAllMenuItems
} = require("../controllers/menuController");

router.get("/restaurant/:restaurantId", getMenuByRestaurant);
router.get("/all", getAllMenuItems);

router.post(
  "/add",
  authMiddleware,
  roleMiddleware("restaurant"),
  
  uploadMenuItemImage,
  addMenuItem
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("restaurant"),
  getMyMenu
);

router.delete(
  "/delete/:id",
  authMiddleware,
  roleMiddleware("restaurant"),
  deleteMenuItem
);

module.exports = router;
