const User = require("../models/user");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/order");
const MenuItem = require("../models/MenuItem");

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { status: "Completed" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const totalRevenue =
      revenueResult && revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      totalUsers,
      totalRestaurants,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getPendingRestaurants = async (req, res) => {
  try {
    const restaurants = await User.find({
      role: "restaurant",
      isApproved: false
    });

    res.json(restaurants);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isApproved = true;
    await user.save();

    await Restaurant.findOneAndUpdate({ owner: id }, { isApproved: true });

    res.json({ message: "Restaurant Approved Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    
    const users = await User.find({ role: { $not: /admin/i } }).select("-password");
    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: user.isBlocked
        ? "User blocked successfully"
        : "User unblocked successfully",
      user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllRestaurantsAdmin = async (req, res) => {
  try {
    
    const orderCounts = await Order.aggregate([
      {
        $group: {
          _id: "$restaurant",
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    const countsMap = orderCounts.reduce((acc, item) => {
      acc[item._id.toString()] = item.totalOrders;
      return acc;
    }, {});

    const restaurants = await Restaurant.find().populate(
      "owner",
      "name email"
    );

    const withCounts = restaurants.map((r) => ({
      ...r.toObject(),
      totalOrders: countsMap[r._id.toString()] || 0
    }));

    res.json(withCounts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteRestaurantAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    await Restaurant.findByIdAndDelete(id);
    await MenuItem.deleteMany({ restaurant: id });

    res.json({ message: "Restaurant and its menu items deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllOrdersAdmin = async (req, res) => {
  try {
    const { status, paymentMethod } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email")
      .populate("restaurant", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.deleteOrderAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
