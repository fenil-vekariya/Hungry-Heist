const User = require("../models/User");
const Order = require("../models/Order");

exports.getDeliveryAgentDashboard = async (req, res) => {
  try {
    const agent = await User.findById(req.user._id);
    const assignedOrder = await Order.findOne({
      deliveryAgent: req.user._id,
      status: { $in: ["Assigned", "Picked Up", "Out for Delivery"] }
    }).populate("restaurant", "name").populate("customer", "name");

    // Calculate total earnings dynamically for 100% accuracy
    const completedOrders = await Order.find({
      deliveryAgent: req.user._id,
      status: "Completed"
    });
    
    const dynamicTotalEarnings = completedOrders.reduce((sum, order) => sum + (order.agentEarning || 0), 0);

    res.json({
      assignedOrder,
      totalEarnings: dynamicTotalEarnings
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery agent dashboard" });
  }
};



exports.acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Assigned" || order.deliveryAgent.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Order cannot be accepted" });
    }

    order.status = "Picked Up";
    await order.save();
    
    const populated = await Order.findById(order._id)
      .populate("restaurant", "name phone address")
      .populate("customer", "name phone")
      .populate("items.menuItem", "name price");
      
    res.json({ message: "Order accepted. Head to the restaurant for pickup.", order: populated });
  } catch (error) {
    res.status(500).json({ message: "Error accepting order" });
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    const agent = await User.findById(req.user._id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.deliveryAgent.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    order.deliveryAgent = null;
    order.status = "Ready";
    await order.save();

    agent.currentOrder = null;
    agent.isAvailable = true;
    await agent.save();

    res.json({ message: "Order rejected" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting order" });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    const agent = await User.findById(req.user._id);

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.deliveryAgent.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Unauthorized" });
    }

    const validTransitions = {
      "Assigned": ["Picked Up", "Cancelled"],
      "Picked Up": ["Out for Delivery", "Cancelled"],
      "Out for Delivery": ["Completed", "Cancelled"],
      "Completed": [],
      "Cancelled": []
    };

    if (status !== order.status && !validTransitions[order.status].includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status transition from ${order.status} to ${status}` 
      });
    }

    order.status = status;

    if (status === "Completed") {
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
      }
      agent.currentOrder = null;
      agent.isAvailable = true;
      await agent.save();
    }

    await order.save();
    res.json({ message: "Status updated", status: order.status });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};

exports.getMyDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({ deliveryAgent: req.user._id })
      .sort({ createdAt: -1 })
      .populate("restaurant", "name")
      .populate("customer", "name");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching delivery history" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const agent = await User.findById(req.user._id).select("-password");
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, vehicleNumber, vehicleType } = req.body;
    const agent = await User.findById(req.user._id);

    if (!agent) return res.status(404).json({ message: "Agent not found" });

    if (name) agent.name = name;
    if (phone) agent.phone = phone;
    if (vehicleNumber) agent.vehicleNumber = vehicleNumber;
    if (vehicleType) agent.vehicleType = vehicleType;

    await agent.save();
    res.json({ message: "Profile updated successfully", agent });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile" });
  }
};
