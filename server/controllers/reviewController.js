const Review = require("../models/Review");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");

exports.addReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customer.toString() !== (req.user.id || req.user._id).toString()) {
      return res.status(403).json({ message: "You can only review your own orders" });
    }

    if (order.status !== "Completed") {
      return res.status(400).json({ message: "You can only review completed orders" });
    }

    if (order.isReviewed) {
      return res.status(400).json({ message: "Order already reviewed" });
    }

    const review = new Review({
      customer: req.user.id || req.user._id,
      restaurant: order.restaurant,
      order: orderId,
      rating,
      comment
    });

    await review.save();

    order.isReviewed = true;
    await order.save();

    res.status(201).json({ message: "Review added successfully", review });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const reviews = await Review.find({ restaurant: restaurantId })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews" });
  }
};

exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all reviews" });
  }
};

exports.deleteReviewAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);

    if (!review) {
       return res.status(404).json({ message: "Review not found" });
    }

    // Optional: Reset order's isReviewed? User said "completed", usually we don't allow re-reviewing after deletion, but it's an option.
    // Let's keep isReviewed=true to prevent spamming deleted reviews.

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review" });
  }
};
