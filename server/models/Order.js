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

  paymentMethod: {
    type: String,
    enum: ["COD"],
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["Paid", "Unpaid"],
    required: true
  },

  status: {
    type: String,
    enum: ["Pending", "Preparing", "Out for Delivery", "Completed"],
    default: "Pending"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
