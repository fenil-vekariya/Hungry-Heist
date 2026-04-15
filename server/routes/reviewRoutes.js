const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { 
  addReview, 
  getRestaurantReviews, 
  getAllReviewsAdmin, 
  deleteReviewAdmin 
} = require("../controllers/reviewController");

router.post("/", authMiddleware, roleMiddleware("customer"), addReview);
router.get("/restaurant/:restaurantId", getRestaurantReviews);
router.get("/admin", authMiddleware, roleMiddleware("admin"), getAllReviewsAdmin);
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteReviewAdmin);

module.exports = router;
