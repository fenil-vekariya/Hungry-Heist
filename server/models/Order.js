const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },

  items: [
    {
      menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
        required: true
      },
      quantity: {
        type: Number,
        required: true,
      }
    }
  ],

  totalAmount: {
    type: Number,
    required: true
  },

  deliveryAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },

  agentEarning: {
    type: Number,
    default: 0
  },

  paymentMethod: {
    type: String,
    enum: ["COD", "Online"],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["Paid", "Unpaid", "Pending", "Failed"],
    required: true
  },
  
  paymentId: {
    type: String,
    default: null
  },
  
  razorpayOrderId: {
    type: String,
    default: null
  },

  status: {
    type: String,
    enum: ["Pending", "Accepted", "Preparing", "Ready", "Assigned", "Picked Up", "Out for Delivery", "Completed", "Cancelled"],
    default: "Pending"
  },
  isReviewed: {
    type: Boolean,
    default: false
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  cancellationFee: {
    type: Number,
    default: 0
  },
  deliveryAddress: {
    type: String,
    default: ""
  }
}, { timestamps: true });

module.exports = mongoose.models.Order || mongoose.model("Order", orderSchema);
