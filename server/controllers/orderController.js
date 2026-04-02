const Order = require("../models/order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");

exports.placeOrder = async (req, res) => {
  try {

    const { restaurantId, restaurant, items, paymentMethod } = req.body;

    const restaurantRef = restaurantId || restaurant;

    const selectedPaymentMethod = "COD";

    const paymentStatus = "Unpaid";

    let baseTotal = 0;

    for (let item of items) {
      const menu = await MenuItem.findById(item.menuItem);

      if (!menu) {
        return res.status(404).json({ message: "Menu item not found" });
      }

      baseTotal += menu.price * item.quantity;
    }

    const TAX_RATE = 0.05;
    const DELIVERY_CHARGE = 30;
    const tax = Math.round(baseTotal * TAX_RATE);
    const totalAmount = baseTotal + tax + DELIVERY_CHARGE;

    const order = new Order({
      customer: req.user._id,
      restaurant: restaurantRef,
      items,
      totalAmount,
      
      paymentMethod: selectedPaymentMethod,
      paymentStatus
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate("restaurant", "name")
      .populate("items.menuItem", "name price");

    res.json(orders);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.json([]); 
    }

    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("customer", "name email")
      .populate("items.menuItem", "name price");

    res.json(orders);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (req.user.role === "restaurant") {
      const validTransitions = {
        "Pending": ["Preparing"],
        "Preparing": ["Out for Delivery"],
        "Out for Delivery": ["Completed"],
        "Completed": []
      };

      const allowedNext = validTransitions[order.status] || [];
      if (!allowedNext.includes(status)) {
        return res.status(400).json({
          message: `Invalid status transition from ${order.status} to ${status}`
        });
      }
    }

    order.status = status;

    if (status === "Completed" && order.paymentMethod === "COD") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    res.json({ message: "Order status updated", order });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
