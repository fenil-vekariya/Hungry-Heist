const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant profile not found" });
    }

    let imageUrl = "";
    if (req.file) {
      // Store relative path for cross-environment compatibility
      imageUrl = `uploads/${req.file.filename}`;
    }

    const menuItem = new MenuItem({
      name,
      price,
      description,
      category,
      image: imageUrl,
      restaurant: restaurant._id
    });

    await menuItem.save();

    res.status(201).json({
      message: "Menu item added successfully",
      menuItem
    });

  } catch (error) {
    console.error("Add Menu Item Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant profile not found" });
    }

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Authorization: Ensure the menu item belongs to the user's restaurant
    if (menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: Access denied" });
    }

    // Update fields
    if (name) menuItem.name = name;
    if (price) menuItem.price = price;
    if (description !== undefined) menuItem.description = description;
    if (category) menuItem.category = category;

    if (req.file) {
      // Store relative path for cross-environment compatibility
      menuItem.image = `uploads/${req.file.filename}`;
    }

    await menuItem.save();

    res.json({
      message: "Menu item updated successfully",
      menuItem
    });

  } catch (error) {
    console.error("Update Menu Item Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
};

exports.getMyMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant profile not found" });
    }

    const menu = await MenuItem.find({ restaurant: restaurant._id });
    res.json(menu);

  } catch (error) {
    console.error("Get My Menu Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant profile not found" });
    }

    const menuItem = await MenuItem.findById(id);
    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    // Authorization: Ensure the menu item belongs to the user's restaurant
    if (menuItem.restaurant.toString() !== restaurant._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: Access denied" });
    }

    await MenuItem.findByIdAndDelete(id);
    res.json({ message: "Menu item deleted successfully" });

  } catch (error) {
    console.error("Delete Menu Item Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menu = await MenuItem.find({ restaurant: restaurantId });
    res.json(menu);
  } catch (error) {
    console.error("Get Menu By Restaurant Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllMenuItems = async (req, res) => {
  try {
    const menu = await MenuItem.find().populate("restaurant", "name");
    res.json(menu);
  } catch (error) {
    console.error("Get All Menu Items Error:", error);
    res.status(500).json({ message: "Server Error fetching all menus" });
  }
};
