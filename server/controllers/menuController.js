const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");

exports.addMenuItem = async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant profile not found" });
    }

    let imageUrl;
    if (req.file) {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
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
    console.log(error);
    
    res.status(500).json({ message: error.message || "Server Error" });
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
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    await MenuItem.findByIdAndDelete(id);

    res.json({ message: "Menu item deleted successfully" });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getMenuByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const menu = await MenuItem.find({ restaurant: restaurantId });

    res.json(menu);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllMenuItems = async (req, res) => {
  try {
    const menu = await MenuItem.find().populate("restaurant", "name");
    res.json(menu);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error fetching all menus" });
  }
};
