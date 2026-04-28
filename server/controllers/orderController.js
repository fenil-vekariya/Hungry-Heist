const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");

const calculateOrderCharges = (subtotal, distanceKm) => {
  let deliveryFeeCustomer = 25;
  if (subtotal >= 300) deliveryFeeCustomer = 0;
  else if (subtotal >= 150) deliveryFeeCustomer = 15;

  const handlingFee = 5;
  const tax = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + tax + deliveryFeeCustomer + handlingFee;

  const commissionAmount = Math.round(subtotal * 0.10);
  const restaurantEarning = subtotal - commissionAmount;

  let agentEarning = 25;
  if (distanceKm > 2) {
    agentEarning += (distanceKm - 2) * 5;
  }

  let adminSubsidy = 0;
  if (agentEarning > deliveryFeeCustomer) {
      adminSubsidy = agentEarning - deliveryFeeCustomer;
  }
  
  const adminEarning = commissionAmount + handlingFee - adminSubsidy;

  return {
    deliveryFeeCustomer,
    handlingFee,
    tax,
    totalAmount,
    commissionAmount,
    restaurantEarning,
    agentEarning,
    adminSubsidy,
    adminEarning
  };
};

exports.placeOrder = async (req, res) => {
  try {
    const { restaurantId, restaurant, items, paymentMethod } = req.body;
    const itemsArray = Array.isArray(items) ? items : JSON.parse(items);
    const restaurantRef = restaurantId || restaurant;
    const selectedPaymentMethod = paymentMethod || "COD";
    const paymentStatus = selectedPaymentMethod === "Online" ? "Pending" : "Unpaid";

    // Anti-Abuse Check: Limit to 3 FREE cancellations per 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentFreeCancellations = await Order.countDocuments({
      customer: req.user._id,
      status: "Cancelled",
      cancelledBy: req.user._id,
      cancellationFee: 0, // Only count free ones for the limit
      updatedAt: { $gte: last24Hours }
    });

    if (recentFreeCancellations >= 3) {
      return res.status(429).json({
        message: "You have reached your free cancellation limit (3 per 24h). Please try again later or pay any outstanding fees to continue."
      });
    }

    // Recover Outstanding Balance (Cancellation Fees)
    const user = await User.findById(req.user._id);
    const outstandingFee = user.outstandingBalance || 0;

    let baseTotal = 0;
    for (let item of itemsArray) {
      const menu = await MenuItem.findById(item.menuItem);
      if (!menu) return res.status(404).json({ message: "Menu item not found" });
      baseTotal += menu.price * item.quantity;
    }

    const distanceKm = req.body.distanceKm || 2; 
    const charges = calculateOrderCharges(baseTotal, distanceKm);
    
    const finalTotalAmount = charges.totalAmount + outstandingFee;

    const order = new Order({
      customer: req.user._id,
      restaurant: restaurantRef,
      items: itemsArray,
      subtotal: baseTotal,
      tax: charges.tax,
      distanceKm,
      deliveryFeeCustomer: charges.deliveryFeeCustomer,
      handlingFee: charges.handlingFee,
      commissionRate: 0.10,
      commissionAmount: charges.commissionAmount,
      restaurantEarning: charges.restaurantEarning,
      adminEarning: charges.adminEarning,
      agentEarning: charges.agentEarning,
      adminSubsidy: charges.adminSubsidy,
      totalAmount: finalTotalAmount,
      paymentMethod: selectedPaymentMethod,
      paymentStatus,
      deliveryAddress: req.body.deliveryAddress || [user.address.flat, user.address.building, user.address.area, user.address.town, user.address.city]
        .filter(part => part && part.trim() !== "")
        .join(", ")
    });

    // Reset outstanding balance after recovery
    if (outstandingFee > 0) {
      user.outstandingBalance = 0;
      await user.save();
    }

    await order.save();
    res.status(201).json({ message: "Order placed successfully", order });

  } catch (error) {
    console.error("Place Order Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("restaurant", "name")
      .populate("items.menuItem", "name price")
      .populate("deliveryAgent", "name phone vehicleType vehicleNumber")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get My Orders Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });
    if (!restaurant) return res.json([]);

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("customer", "name email")
      .populate("items.menuItem", "name price")
      .populate("deliveryAgent", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Get Restaurant Orders Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.user.role;
    const userId = req.user._id.toString();

    const order = await Order.findById(id).populate("restaurant");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Authorization & Status Logic
    const validTransitions = {
      "Pending": ["Accepted", "Cancelled"],
      "Accepted": ["Preparing", "Cancelled"],
      "Preparing": ["Ready", "Cancelled"],
      "Ready": ["Assigned", "Cancelled"],
      "Assigned": ["Picked Up", "Cancelled"],
      "Picked Up": ["Out for Delivery", "Cancelled"],
      "Out for Delivery": ["Completed", "Cancelled"],
      "Completed": [],
      "Cancelled": []
    };

    if (status !== order.status && !validTransitions[order.status].includes(status)) {
      return res.status(400).json({ message: `Invalid transition from ${order.status} to ${status}` });
    }

    // Role-Based Authorization
    if (userRole === "restaurant") {
      if (order.restaurant.owner.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized: Not your order" });
      }
      if (!["Accepted", "Preparing", "Ready", "Cancelled"].includes(status)) {
        return res.status(403).json({ message: "Unauthorized: Invalid state for restaurant" });
      }
    } else if (userRole === "partner") {
      if (order.deliveryAgent?.toString() !== userId) {
        return res.status(403).json({ message: "Unauthorized: Not assigned to you" });
      }
      if (!["Picked Up", "Out for Delivery", "Completed"].includes(status)) {
        return res.status(403).json({ message: "Unauthorized: Invalid state for partner" });
      }
    } else if (userRole === "customer") {
      if (order.customer.toString() !== userId) return res.status(403).json({ message: "Unauthorized" });
      if (status !== "Cancelled") return res.status(403).json({ message: "Unauthorized: Action not permitted" });

      const timeDiff = Date.now() - new Date(order.createdAt).getTime();
      const isWithinGracePeriod = timeDiff <= 60000;

      if (!isWithinGracePeriod && order.status !== "Pending") {
        return res.status(403).json({ message: "The 60-second risk-free window has closed and the restaurant has already accepted your order." });
      }

      if (["Picked Up", "Out for Delivery", "Completed"].includes(order.status)) {
        return res.status(403).json({ message: "Cannot cancel an order that is already being delivered or finalized." });
      }
    }

    // Business Logic for Ready Status - Robust Fair Assignment
    if (status === "Ready") {
      // 1. Find all potentially eligible partners who are approved and not blocked
      const allPartners = await User.find({
        role: "partner",
        isApproved: true,
        isBlocked: false
      }).sort({ totalEarnings: 1 });

      let selectedPartner = null;

      if (allPartners.length > 0) {
        // 2. Filter for those who are truly free
        for (const partner of allPartners) {
          // Secondary verification: Check if they have ANY active orders in the collection
          // We use case-insensitive matching because statuses like "PICKED UP" appear in the UI
          const activeOrder = await Order.findOne({
            deliveryAgent: partner._id,
            status: { $in: [/^Assigned$/i, /^Picked Up$/i, /^Out for Delivery$/i] }
          });

          if (!activeOrder) {
            selectedPartner = partner;
            break; // Found our partner!
          }
        }
      }

      if (selectedPartner) {
        order.deliveryAgent = selectedPartner._id;
        order.status = "Assigned";
        selectedPartner.currentOrder = order._id;
        selectedPartner.isAvailable = false;
        await selectedPartner.save();
      } else {
        order.status = "Ready"; // Still stay in Ready for next retry
      }
    } else {
      order.status = status;
    }

    // Cleanup for Completion or Cancellation
    if (status === "Completed" || status === "Cancelled") {
      if (status === "Completed" && order.paymentMethod === "COD") order.paymentStatus = "Paid";

      if (status === "Cancelled") {
        order.cancellationReason = req.body.reason || "No specific reason provided";
        order.cancelledBy = req.user._id;

        // Apply 100% Cancellation Fee if outside grace period and not Pending
        if (userRole === "customer") {
          const timeDiff = Date.now() - new Date(order.createdAt).getTime();
          const isWithinGracePeriod = timeDiff <= 60000;

          if (!isWithinGracePeriod && order.status !== "Pending") {
            order.cancellationFee = order.totalAmount;
            await User.findByIdAndUpdate(req.user._id, { $inc: { outstandingBalance: order.totalAmount } });
          } else {
            order.cancellationFee = 0;
          }
        }
      }

      // Free up agent if one was assigned
      if (order.deliveryAgent) {
        await User.findByIdAndUpdate(order.deliveryAgent, {
          currentOrder: null,
          isAvailable: true
        });
      }
    }

    await order.save();
    res.json({ message: "Order status updated", order });

  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
