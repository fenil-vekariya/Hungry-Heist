const Restaurant = require("../models/Restaurant");

exports.createRestaurant = async (req, res) => {
  try {
    const { name, description, address, email, phone } = req.body;

    const existing = await Restaurant.findOne({ owner: req.user._id });

    if (existing) {
      return res.status(400).json({ message: "Restaurant profile already created" });
    }

    let imageUrl;
    let bannerUrl;

    if (req.files && req.files.image && req.files.image[0]) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.image[0].filename}`;
    }

    if (req.files && req.files.banner && req.files.banner[0]) {
      bannerUrl = `${req.protocol}://${req.get("host")}/uploads/${req.files.banner[0].filename}`;
    }

    const restaurant = new Restaurant({
      name,
      description,
      address,
      email,
      phone,
      owner: req.user._id,
      
      image: imageUrl,
      banner: bannerUrl,
    });

    await restaurant.save();

    res.status(201).json({
      message: "Restaurant profile created successfully",
      restaurant
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const { name, description, address, email, phone } = req.body;

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
      restaurant.image = `${req.protocol}://${req.get("host")}/uploads/${req.files.image[0].filename}`;
    }

    if (req.files && req.files.banner && req.files.banner[0]) {
      restaurant.banner = `${req.protocol}://${req.get("host")}/uploads/${req.files.banner[0].filename}`;
    }

    await restaurant.save();

    res.json({
      message: "Restaurant profile updated successfully",
      restaurant
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
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

exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isApproved: true });

    res.json(restaurants);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
