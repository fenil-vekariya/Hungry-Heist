const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { status: { $regex: /^Completed$/i } } },
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
    // 1. Fetch all restaurant profiles and filter unapproved ones in memory for speed/safety
    const allProfilesData = await Restaurant.find({}).populate("owner", "name email");
    const pendingProfiles = allProfilesData.filter(p => !p.isApproved);

    // 2. Fetch all users and filter for those registered as restaurants but not yet approved
    const allUsers = await User.find({}).select("name email role isApproved createdAt");
    const pendingAccounts = allUsers.filter(u => 
      u.role === "restaurant" && !u.isApproved
    );

    // 3. Track which users already have a profile so we don't duplicate them in the list
    const ownersWithProfiles = new Set(
      allProfilesData
        .filter(p => p.owner)
        .map(p => p.owner._id.toString())
    );

    // 4. Accounts that have registered but haven't created a restaurant profile yet
    const formattedAccounts = pendingAccounts
      .filter(acc => !ownersWithProfiles.has(acc._id.toString()))
      .map(acc => ({
        _id: acc._id,
        name: "New Restaurant Registration",
        owner: { name: acc.name, email: acc.email, _id: acc._id },
        isAccountOnly: true,
        createdAt: acc.createdAt
      }));

    // Combine both: New account registrations + Created but unapproved profiles
    res.json([...pendingProfiles, ...formattedAccounts]);
  } catch (error) {
    console.error("Fetch Pending Restaurants Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // Try finding by Restaurant ID first
    let restaurant = await Restaurant.findById(id);
    if (restaurant) {
      restaurant.isApproved = true;
      await restaurant.save();
      await User.findByIdAndUpdate(restaurant.owner, { isApproved: true });
      return res.json({ message: "Restaurant Approved Successfully" });
    }

    // If not found, try finding by User ID (for new account approvals)
    const user = await User.findById(id);
    if (user && user.role?.toLowerCase() === "restaurant") {
      user.isApproved = true;
      await user.save();
      return res.json({ message: "Restaurant Owner Account Approved Successfully" });
    }

    return res.status(404).json({ message: "Restaurant or User not found" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAccountOnly } = req.query;

    if (isAccountOnly === "true") {
      // Delete the user account directly
      await User.findByIdAndDelete(id);
      return res.json({ message: "Restaurant Registration Rejected and Account Deleted" });
    }

    // If it's a restaurant profile, delete the profile and the owner account
    const restaurant = await Restaurant.findById(id);
    if (restaurant) {
      await User.findByIdAndDelete(restaurant.owner);
      await MenuItem.deleteMany({ restaurant: id });
      await Restaurant.findByIdAndDelete(id);
    }
    
    res.json({ message: "Restaurant Profile and Owner Account Deleted" });
  } catch (error) {
    console.error("Reject Restaurant Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.rejectAgent = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "Delivery Agent Application Rejected and Account Deleted" });
  } catch (error) {
    console.error("Reject Agent Error:", error);
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
      .populate("deliveryAgent", "name email phone")
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

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Deletion Logic: Revert earnings if the order was completed
    if ((order.status === "Completed" || order.status === "completed") && order.deliveryAgent) {
      await User.findByIdAndUpdate(order.deliveryAgent, {
        $inc: { totalEarnings: -(order.agentEarning || 0) }
      });
    }

    await Order.findByIdAndDelete(id);

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllDeliveryAgents = async (req, res) => {
  try {
    const agents = await User.find({ role: { $regex: /^partner$/i } }).select("-password");
    
    // Enrich agents with accurate, real-time total earnings and sync the database
    const enrichedAgents = await Promise.all(agents.map(async (agent) => {
      const completedOrders = await Order.find({
        deliveryAgent: agent._id,
        status: { $regex: /^Completed$/i }
      });
      
      const dynamicTotalEarnings = completedOrders.reduce((sum, order) => sum + (order.agentEarning || 0), 0);
      
      // Sync the database field if it's incorrect (Self-healing logic)
      if (agent.totalEarnings !== dynamicTotalEarnings) {
        await User.findByIdAndUpdate(agent._id, { totalEarnings: dynamicTotalEarnings });
        agent.totalEarnings = dynamicTotalEarnings; 
      }
      
      return agent;
    }));

    res.json(enrichedAgents);
  } catch (error) {
    console.error("Fetch Delivery Agents Error:", error);
    res.status(500).json({ message: "Error fetching delivery agents" });
  }
};

exports.assignAgentToOrder = async (req, res) => {
  try {
    const { orderId, agentId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    let selectedAgentId = agentId;

    if (!selectedAgentId) {
      // Logic for automatic selection from Admin Dashboard
      // 1. Find all potentially eligible partners who are approved, not blocked
      const allPartners = await User.find({
        role: { $regex: /^partner$/i },
        isApproved: true,
        isBlocked: false
      }).sort({ totalEarnings: 1 });

      if (allPartners.length === 0) {
        return res.status(404).json({ message: "No delivery partners found in the system." });
      }

      // 2. Filter for those who are truly free
      for (const partner of allPartners) {
        const activeOrder = await Order.findOne({
          deliveryAgent: partner._id,
          status: { $in: [/^Assigned$/i, /^Picked Up$/i, /^Out for Delivery$/i] }
        });

        if (!activeOrder) {
          selectedAgentId = partner._id;
          break;
        }
      }

      if (!selectedAgentId) {
        return res.status(404).json({ message: "All delivery partners are currently busy. Please try again later." });
      }
    }

    const agent = await User.findById(selectedAgentId);
    if (!agent) {
      return res.status(404).json({ message: "Delivery Agent not found" });
    }

    order.deliveryAgent = selectedAgentId;
    order.status = "Assigned";
    await order.save();

    agent.currentOrder = orderId;
    agent.isAvailable = false;
    await agent.save();

    res.json({ message: "Delivery Agent assigned successfully", order });
  } catch (error) {
    console.error("Manual Assignment Error:", error);
    res.status(500).json({ message: "Error assigning delivery agent" });
  }
};

exports.getPendingDeliveryAgents = async (req, res) => {
  try {
    const agents = await User.find({ 
      role: { $regex: /^partner$/i }, 
      isApproved: { $ne: true } 
    }).select("-password");
    res.json(agents);
  } catch (error) {
    console.error("DEBUG: getPendingDeliveryAgents Error:", error);
    res.status(500).json({ message: "Error fetching pending delivery agents" });
  }
};

exports.approveDeliveryAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Delivery Agent not found" });
    user.isApproved = true;
    user.isAvailable = true;
    await user.save();
    res.json({ message: "Delivery Agent approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error approving delivery agent" });
  }
};
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.isApproved = true;
    await user.save();
    
    res.json({ message: `${user.role} approved successfully` });
  } catch (error) {
    res.status(500).json({ message: "Error approving user" });
  }
};
