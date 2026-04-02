const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  description: String,

  image: {
    type: String,
  },

  category: {
    type: String,
    required: true
  },

  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("MenuItem", menuItemSchema);
