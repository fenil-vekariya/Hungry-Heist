const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const Order = require("../models/Order");

exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, address, email, phone } = req.body;

    if (!req.user || !req.user._id) {
       return res.status(401).json({ message: "Authentication required" });
    }

    const existing = await Restaurant.findOne({ owner: req.user._id });

    if (existing) {
      return res.status(400).json({ message: "Restaurant profile already created" });
    }

    let imageUrl;
    let bannerUrl;

    if (req.files && req.files.image && req.files.image[0]) {
      imageUrl = `uploads/${req.files.image[0].filename}`;
    }

    if (req.files && req.files.banner && req.files.banner[0]) {
      bannerUrl = `uploads/${req.files.banner[0].filename}`;
    }

    const restaurant = new Restaurant({
      name,
      description,
      address,
      email,
      phone,
      owner: req.user._id,
      image: imageUrl || "",
      banner: bannerUrl || "",
    });

    await restaurant.save();

    res.status(201).json({
      message: "Restaurant profile created successfully",
      restaurant
    });

  } catch (error) {
    console.error("Create Restaurant Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const { name, description, address, email, phone } = req.body;

    if (!req.user || !req.user._id) {
       return res.status(401).json({ message: "Authentication required" });
    }

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant profile not found" });
    }

    if (name) restaurant.name = name;
    if (description) restaurant.description = description;
    if (address) restaurant.address = address;
    if (email) restaurant.email = email;
    if (phone) restaurant.phone = phone;

    if (req.files && req.files.image && req.files.image[0]) {
      restaurant.image = `uploads/${req.files.image[0].filename}`;
    }

    if (req.files && req.files.banner && req.files.banner[0]) {
      restaurant.banner = `uploads/${req.files.banner[0].filename}`;
    }

    await restaurant.save();

    res.json({
      message: "Restaurant profile updated successfully",
      restaurant
    });

  } catch (error) {
    console.error("Update Restaurant Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages[0] });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id }).populate("owner", "name email phone");

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json(restaurant);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRevenue = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      console.log("DEBUG: Restaurant profile not found for user:", req.user._id);
      return res.status(404).json({ message: "Restaurant profile not found" });
    }

    const completedOrders = await Order.find({ 
      restaurant: restaurant._id, 
      status: { $regex: /^(completed|Completed)$/ } 
    });

    const totalRevenue = completedOrders.reduce((sum, order) => {
      return sum + (Number(order.totalAmount) || 0);
    }, 0);

    res.json({ 
      totalRevenue, 
      completedCount: completedOrders.length 
    });
  } catch (error) {
    console.error("Get Revenue Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isApproved: true }).lean();

    // Fetch and append ratings
    const restaurantsWithRatings = await Promise.all(
      restaurants.map(async (r) => {
        const reviews = await Review.find({ restaurant: r._id });
        const reviewCount = reviews.length;
        const averageRating = reviewCount > 0 
          ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviewCount 
          : 0;
        
        return {
          ...r,
          averageRating: parseFloat(averageRating.toFixed(1)),
          reviewCount
        };
      })
    );

    res.json(restaurantsWithRatings);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).lean();
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const reviews = await Review.find({ restaurant: restaurant._id });
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0 
      ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviewCount 
      : 0;

    res.json({
      ...restaurant,
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
